using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.Models;
using System.Security.Claims;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FinanceController(AppDbContext context)
        {
            _context = context;
        }

        // Only authenticated users with artist or admin roles can access their statistics
        [HttpGet("artist-statistics")]
        [Authorize(Roles = "artist,admin")]
        public IActionResult GetArtistStatistics()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found" });
            }
            var stats = _context.Orders
                .Where(o => o.BuyerId == userId)
                .AsEnumerable()
                .GroupBy(o => o.OrderDate?.ToString("yyyy-MM") ?? "Unknown")
                .Select(g => new
                {
                month = g.Key,
                income = g.Sum(x => x.TotalAmount),
                })
                .OrderBy(x => x.month)
                .ToList();

            return Ok(stats);
        }

        // Only admins can access statistics for all users
        [HttpGet("admin-statistics")]
        [Authorize(Roles = "admin")]
        public IActionResult GetAdminStatistics()
        {
            var stats = _context.Orders
                .AsEnumerable()
                .GroupBy(o => o.OrderDate?.ToString("yyyy-MM") ?? "Unknown")
                .Select(g => new
                {
                    month = g.Key,
                    income = g.Sum(x => x.TotalAmount),
                    orderCount = g.Count()
                })
                .OrderBy(x => x.month)
                .ToList();

            return Ok(stats);
        }





    }
}
