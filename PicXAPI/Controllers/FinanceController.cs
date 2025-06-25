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

        // Only authenticated users (artist) can access their statistics
        [HttpGet("artist-statistics")]
        [Authorize(Roles = "artist,admin")]
        public IActionResult GetArtistStatistics()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("User ID not found");
            }

            var stats = _context.FinancialReports
                .Where(r => r.ArtistId == userId)
                .OrderBy(r => r.PeriodStart)
                .Select(r => new
                {
                    month = r.PeriodStart.ToString("yyyy-MM"),
                    income = r.TotalSales ?? 0,
                    expense = r.TotalCommission ?? 0
                })
                .ToList();

            return Ok(stats);
        }

        // Only admin can access all statistics
        [HttpGet("admin-statistics")]
        [Authorize(Roles = "admin")]
        public IActionResult GetAdminStatistics()
        {
            try
            {
                var result = _context.FinancialReports
                    .AsEnumerable()
                    .GroupBy(fr => fr.PeriodStart.ToString("yyyy-MM"))
                    .Select(g => new
                    {
                        month = g.Key,
                        income = g.Sum(x => x.TotalSales ?? 0),
                        expense = g.Sum(x => x.TotalCommission ?? 0)
                    })
                    .OrderBy(x => x.month)
                    .ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Admin API Error: " + ex.Message);
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
