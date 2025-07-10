using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.DTOs;
using PicXAPI.Models;
using System.Security.Claims;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/withdraw-request")]
    public class WithdrawRequestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WithdrawRequestController(AppDbContext context)
        {
            _context = context;
        }

        // Artist gửi yêu cầu rút tiền (gọi SP)
        [HttpPost]
        [Authorize(Roles = "artist")]
        public async Task<IActionResult> Create([FromBody] WithdrawRequestDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (dto.Amount <= 0)
                return BadRequest(new { message = "Số tiền rút không hợp lệ." });

            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_ArtistRequestWithdraw @p0, @p1",
                    userId, dto.Amount
                );

                // Lấy yêu cầu rút mới nhất của artist để trả về
                var withdrawRequest = await _context.WithdrawRequests
                    .Where(w => w.ArtistId == userId)
                    .OrderByDescending(w => w.RequestedAt)
                    .FirstOrDefaultAsync();

                return Ok(new
                {
                    message = "Gửi yêu cầu rút tiền thành công.",
                    requestId = withdrawRequest?.RequestId,
                    amount = dto.Amount
                });
            }
            catch (DbUpdateException ex)
            {
                var msg = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { message = msg });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra.", detail = ex.Message });
            }
        }

        // (Optional) Lấy danh sách yêu cầu rút tiền của artist
        [HttpGet("my-requests")]
        [Authorize(Roles = "artist")]
        public async Task<IActionResult> GetMyRequests()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var requests = await _context.WithdrawRequests
                .Where(w => w.ArtistId == userId)
                .OrderByDescending(w => w.RequestedAt)
                .ToListAsync();

            return Ok(requests);
        }
    }
}