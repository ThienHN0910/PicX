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
                cancelUrl: "https://localhost:5173/cancel",
                returnUrl: "https://localhost:5173/success"
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
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Tạo yêu cầu nạp tiền thành công.",
                paymentUrl = result.checkoutUrl,
                transactionId = transaction.TransactionId
            });
        }



        // Webhook nhận callback từ VNPAY/MoMo (giả lập)
        [HttpPost("deposit-callback")]
        [AllowAnonymous]
        public async Task<IActionResult> DepositCallback([FromBody] DepositCallbackDto dto)
        {
            // TODO: Xác minh checksum ở đây nếu cần

            var transaction = await _context.WalletTransactions
                .FirstOrDefaultAsync(t => t.ExternalTransactionId == dto.OrderCode && t.TransactionType == "deposit");

            if (transaction == null)
                return NotFound(new { message = "Giao dịch không tồn tại." });

            if (dto.Status == "PAID")
            {
                var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.WalletId == transaction.WalletId);
                if (wallet == null)
                    return NotFound(new { message = "Ví không tồn tại." });

                wallet.Balance += transaction.Amount;
                transaction.Description = "Nạp tiền thành công qua PayOS";
                transaction.CreatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Nạp tiền thành công." });
            }
            else
            {
                transaction.Description = "Nạp tiền thất bại (PayOS)";
                await _context.SaveChangesAsync();
                return BadRequest(new { message = "Nạp tiền thất bại." });
            }
        }


        // Artist yêu cầu rút tiền
        [HttpPost("withdraw-request")]
        [Authorize(Roles = "artist")]
        public async Task<IActionResult> RequestWithdraw([FromBody] WithdrawRequestDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
            if (wallet == null)
            {
                wallet = new Wallet { UserId = userId, Balance = 0 };
                _context.Wallets.Add(wallet);
                await _context.SaveChangesAsync();
            }

            if (dto.Amount <= 0)
                return BadRequest(new { message = "Số tiền rút không hợp lệ." });

            if (wallet.Balance < dto.Amount)
                return BadRequest(new { message = "Số dư ví không đủ." });

            var withdrawRequest = new WithdrawRequest
            {
                ArtistId = userId,
                Amount = dto.Amount,
                Status = "pending",
                RequestedAt = DateTime.UtcNow
            };
            _context.WithdrawRequests.Add(withdrawRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Gửi yêu cầu rút tiền thành công.", requestId = withdrawRequest.RequestId });
        }

        // Admin duyệt rút tiền
        [HttpPost("withdraw-approve/{requestId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ApproveWithdraw(int requestId)
        {
            var withdrawRequest = await _context.WithdrawRequests
                .FirstOrDefaultAsync(w => w.RequestId == requestId && w.Status == "pending");
            if (withdrawRequest == null)
                return NotFound(new { message = "Yêu cầu rút tiền không tồn tại hoặc đã xử lý." });

            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == withdrawRequest.ArtistId);
            if (wallet == null)
                return NotFound(new { message = "Ví không tồn tại." });

            if (wallet.Balance < withdrawRequest.Amount)
                return BadRequest(new { message = "Số dư ví không đủ." });

            // Tính hoa hồng admin 10%
            var commission = withdrawRequest.Amount * 0.10m;
            var payout = withdrawRequest.Amount - commission;

            wallet.Balance -= withdrawRequest.Amount;
            withdrawRequest.Status = "approved";
            withdrawRequest.ProcessedAt = DateTime.UtcNow;

            // Ghi log giao dịch rút tiền
            _context.WalletTransactions.Add(new WalletTransaction
            {
                WalletId = wallet.WalletId,
                Amount = -withdrawRequest.Amount,
                TransactionType = "withdraw",
                Description = $"Rút tiền (admin duyệt), nhận về {payout} (đã trừ 10% hoa hồng)",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Duyệt rút tiền thành công. Số tiền thực nhận: {payout} (đã trừ 10% hoa hồng)",
                payout,
                commission
            });
        }
    }
}
