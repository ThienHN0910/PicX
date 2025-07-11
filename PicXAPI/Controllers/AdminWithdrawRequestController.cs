using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.Models;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/admin/withdrawal-requests")]
    [Authorize(Roles = "admin")]
    public class AdminWithdrawRequestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminWithdrawRequestController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/withdrawal-requests
        [HttpGet]
        public async Task<IActionResult> GetAllPendingRequests()
        {
            var requests = await _context.WithdrawRequests
                .Include(r => r.User)
                .Where(r => r.Status == "pending")
                .OrderByDescending(r => r.RequestedAt)
                .Select(r => new
                {
                    r.RequestId,
                    r.UserId,
                    UserName = r.User!.Name,
                    UserRole = r.User.Role,
                    r.AmountRequested,
                    r.AmountReceived,
                    r.RequestedAt,
                    r.Status
                })
                .ToListAsync();

            return Ok(requests);
        }

        // POST: api/admin/withdrawal-requests/{id}/approve
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var request = await _context.WithdrawRequests.Include(r => r.User).FirstOrDefaultAsync(r => r.RequestId == id);
            if (request == null || request.Status != "pending")
                return NotFound(new { message = "Yêu cầu không tồn tại hoặc đã được xử lý." });

            request.Status = "approved";
            request.ProcessedAt = DateTime.UtcNow;

            await _context.WalletTransactions.AddAsync(new WalletTransaction
            {
                WalletId = await _context.Wallets.Where(w => w.UserId == request.UserId).Select(w => w.WalletId).FirstAsync(),
                TransactionType = "withdraw_success",
                Amount = -request.AmountReceived,
                Description = "Rút tiền thành công",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Duyệt yêu cầu rút tiền thành công." });
        }

        // POST: api/admin/withdrawal-requests/{id}/reject
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> Reject(int id)
        {
            var request = await _context.WithdrawRequests.FirstOrDefaultAsync(r => r.RequestId == id);
            if (request == null || request.Status != "pending")
                return NotFound(new { message = "Yêu cầu không tồn tại hoặc đã được xử lý." });

            request.Status = "rejected";
            request.ProcessedAt = DateTime.UtcNow;

            // Refund tiền lại ví
            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == request.UserId);
            if (wallet != null)
            {
                wallet.Balance += request.AmountRequested;

                await _context.WalletTransactions.AddAsync(new WalletTransaction
                {
                    WalletId = wallet.WalletId,
                    TransactionType = "refund",
                    Amount = request.AmountRequested,
                    Description = "Hoàn tiền do yêu cầu rút bị từ chối",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Từ chối yêu cầu rút tiền và hoàn tiền thành công." });
        }
    }
}
