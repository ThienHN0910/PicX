using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.DTOs;
using PicXAPI.Models;
using System.Security.Claims;
using Net.payOS;
using Net.payOS.Types;


namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/wallet")]
    public class WalletController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public WalletController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("deposit")]
        [Authorize]
        public async Task<IActionResult> Deposit([FromBody] DepositRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId)
                         ?? new Wallet { UserId = userId, Balance = 0 };
            if (wallet.WalletId == 0)
            {
                _context.Wallets.Add(wallet);
                await _context.SaveChangesAsync();
            }

            if (dto.Amount <= 0)
                return BadRequest(new { message = "Số tiền nạp không hợp lệ." });

            var payOSConfig = _configuration.GetSection("PayOS");
            var payOS = new PayOS(
                payOSConfig["ClientId"]!,
                payOSConfig["APIKey"]!,
                payOSConfig["ChecksumKey"]!
            );

            long orderCode = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var items = new List<ItemData> {
        new ItemData("Top-up wallet", 1, (int)(dto.Amount*1000))
    };

            var paymentData = new PaymentData(
                orderCode: orderCode,
                amount: (int)(dto.Amount * 1000),
                description: $"Nạp tiền ví #{userId}",
                items: items,
                cancelUrl: $"https://picxapi.onrender.com/api/wallet/cancel-handler?orderCode={orderCode}",
                returnUrl: $"https://picxapi.onrender.com/api/wallet/return-handler?orderCode={orderCode}"

            );


            CreatePaymentResult result;
            try
            {
                result = await payOS.createPaymentLink(paymentData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi tạo payment link", detail = ex.Message });
            }

            var transaction = new WalletTransaction
            {
                WalletId = wallet.WalletId,
                Amount = dto.Amount,
                TransactionType = "deposit",
                Description = "Nạp tiền qua PayOS (chờ xác nhận)",
                CreatedAt = DateTime.UtcNow,
                ExternalTransactionId = orderCode
            };
            _context.WalletTransactions.Add(transaction);

            var wallet2 = await _context.Wallets.FirstOrDefaultAsync(w => w.WalletId == transaction.WalletId);
            if (wallet2 == null)
                return NotFound(new { message = "Ví không tồn tại." });

            wallet2.Balance += transaction.Amount *1000;

            transaction.Description = "Nạp tiền thành công qua PayOS";
            transaction.CreatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Tạo yêu cầu nạp tiền thành công.",
                paymentUrl = result.checkoutUrl,
                transactionId = transaction.TransactionId
            });
        }

        [HttpGet("return-handler")]
        [AllowAnonymous]
        public IActionResult HandleReturnFromPayOS([FromQuery] long orderCode)
        {
            return Redirect($"https://picx-client.onrender.com/deposit?status=paid&orderCode={orderCode}");
        }

        [HttpGet("cancel-handler")]
        [AllowAnonymous]
        public IActionResult HandleCancelFromPayOS([FromQuery] long orderCode)
        {
            return Redirect($"https://picx-client.onrender.com/deposit?status=cancel&orderCode={orderCode}");
        }


        [HttpPost("deposit-callback")]
        [AllowAnonymous]
        public async Task<IActionResult> DepositCallback([FromBody] DepositCallbackDto dto)
        {
            // TODO: Nếu cần, thêm xác minh checksum ở đây để đảm bảo chỉ PayOS mới gọi được endpoint này

            var transaction = await _context.WalletTransactions
                .FirstOrDefaultAsync(t => t.ExternalTransactionId == dto.OrderCode && t.TransactionType == "deposit");

            if (transaction == null)
                return NotFound(new { message = "Giao dịch không tồn tại." });

            // ⚠️ Chống xử lý lại nhiều lần
            if (transaction.Description == "Nạp tiền thành công qua PayOS")
                return Ok(new { message = "Giao dịch đã được xử lý." });

            if (dto.Status == "PAID")
            {
                var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.WalletId == transaction.WalletId);
                if (wallet == null)
                    return NotFound(new { message = "Ví không tồn tại." });

                wallet.Balance += transaction.Amount;

                transaction.Description = "Nạp tiền thành công qua PayOS";
                transaction.CreatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Nạp tiền thành công và đã cộng vào ví." });
            }
            else
            {
                transaction.Description = "Nạp tiền thất bại (PayOS)";
                await _context.SaveChangesAsync();
                return BadRequest(new { message = "Nạp tiền thất bại." });
            }
        }
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetWallet()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null)
                return NotFound(new { message = "Ví không tồn tại." });

            return Ok(new
            {
                balance = wallet.Balance
            });
        }

    }
}
