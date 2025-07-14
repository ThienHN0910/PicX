using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("/api/report")]
    public class ReportController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReportController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy tất cả report (admin)
        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAll()
        {
            var reports = await _context.Reportings
                .Include(r => r.User)
                .Include(r => r.Product)
                .Where(r => r.User != null && r.Product != null)
                .Select(r => new {
                    r.ReviewId,
                    r.ProductId,
                    r.UserId,
                    r.Content,
                    r.IsApproved,
                    r.CreatedAt,
                    r.UpdatedAt,
                    UserName = r.User.Name,
                    ProductTitle = r.Product.Title,
                    ProductImage = r.Product.ImageDriveId // Add image field
                })
                .ToListAsync();
            return Ok(reports);
        }

        // Lấy report theo id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var report = await _context.Reportings.Include(r => r.User).Include(r => r.Product).FirstOrDefaultAsync(r => r.ReviewId == id);
            if (report == null) return NotFound();
            return Ok(report);
        }

        // Tạo report mới
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] dynamic body)
        {
            if (body == null || body.productId == null || string.IsNullOrWhiteSpace((string)body.content))
                return BadRequest(new { message = "Missing productId or content" });
            // Lấy userId từ token
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized(new { message = "Token invalid" });
            var reporting = new Reporting
            {
                ProductId = (int)body.productId,
                Content = (string)body.content,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsApproved = false
            };
            _context.Reportings.Add(reporting);
            await _context.SaveChangesAsync();
            return Ok(reporting);
        }

        // Duyệt report (admin)
        [HttpPut("approve/{id}")]
        public async Task<IActionResult> Approve(int id)
        {
            var report = await _context.Reportings.FindAsync(id);
            if (report == null) return NotFound();
            report.IsApproved = true;
            report.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Gửi notification cho người report
            if (report.UserId != null)
            {
                var notification = new Notification
                {
                    UserId = report.UserId,
                    Type = "Report",
                    Title = "Report Approved",
                    Message = $"Cảm ơn bạn đã report. Tác phẩm có id {report.ProductId} đã bị khóa.",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
                try
                {
                    var hubContext = HttpContext.RequestServices.GetService(typeof(IHubContext<NotificationHub>)) as IHubContext<NotificationHub>;
                    if (hubContext != null)
                    {
                        await hubContext.Clients.Group(notification.UserId.ToString()).SendCoreAsync("ReceiveNotification", new object[] { notification });
                    }
                }
                catch { /* ignore real-time errors */ }
            }

            return Ok(report);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var report = await _context.Reportings.FindAsync(id);
            if (report == null) return NotFound();
            _context.Reportings.Remove(report);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
