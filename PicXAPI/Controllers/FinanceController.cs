﻿using Microsoft.AspNetCore.Authorization;
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

        // Get all orders for admin dashboard
        [HttpGet("all-orders")]
        [Authorize(Roles = "admin")]
        public IActionResult GetAllOrders()
        {
            try
            {
                var orders = _context.Orders
                    .Include(o => o.Buyer)
                    .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                    .ThenInclude(p => p.Artist)
                    .OrderByDescending(o => o.OrderDate)
                    .Take(10)
                    .Select(o => new
                    {
                        id = o.OrderId,
                        customer = o.Buyer.Name ?? "Unknown",
                        total = o.TotalAmount,
                        date = o.OrderDate.HasValue ? o.OrderDate.Value.ToString("yyyy-MM-dd") : "Unknown",
                        status = "Completed",
                        itemCount = o.OrderDetails.Count(),
                        products = o.OrderDetails.Select(od => new
                        {
                            title = od.Product.Title,
                            artist = od.Product.Artist.Name,
                            price = od.TotalPrice
                        }).ToList()
                    })
                    .ToList();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving orders", error = ex.Message });
            }
        }

        // Get summary statistics for admin dashboard
        [HttpGet("admin-summary")]
        [Authorize(Roles = "admin")]
        public IActionResult GetAdminSummary()
        {
            try
            {
                var totalUsers = _context.Users.Count();
                var totalArtists = _context.Users.Count(u => u.Role == "artist");
                var totalBuyers = _context.Users.Count(u => u.Role == "buyer");
                var totalProducts = _context.Products.Count();
                var totalOrders = _context.Orders.Count();
                var totalRevenue = _context.Orders.Sum(o => o.TotalAmount);

                // Recent activity (last 30 days)
                var thirtyDaysAgo = DateTime.Now.AddDays(-30);
                var recentOrders = _context.Orders.Count(o => o.OrderDate >= thirtyDaysAgo);
                var recentRevenue = _context.Orders
                    .Where(o => o.OrderDate >= thirtyDaysAgo)
                    .Sum(o => o.TotalAmount);

                // Top selling products
                var topProducts = _context.OrderDetails
                    .Include(od => od.Product)
                    .ThenInclude(p => p.Artist)
                    .GroupBy(od => od.ProductId)
                    .Select(g => new
                    {
                        productId = g.Key,
                        title = g.First().Product.Title,
                        artist = g.First().Product.Artist.Name,
                        totalSold = g.Count(),
                        totalRevenue = g.Sum(x => x.TotalPrice)
                    })
                    .OrderByDescending(x => x.totalSold)
                    .Take(5)
                    .ToList();

                return Ok(new
                {
                    totalUsers,
                    totalArtists,
                    totalBuyers,
                    totalProducts,
                    totalOrders,
                    totalRevenue,
                    recentOrders,
                    recentRevenue,
                    topProducts
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving summary", error = ex.Message });
            }
        }

        // Get artist performance data
        [HttpGet("artist-performance")]
        [Authorize(Roles = "admin")]
        public IActionResult GetArtistPerformance()
        {
            try
            {
                var artistPerformance = _context.OrderDetails
                    .Include(od => od.Product)
                    .ThenInclude(p => p.Artist)
                    .GroupBy(od => od.Product.ArtistId)
                    .Select(g => new
                    {
                        artistId = g.Key,
                        artistName = g.First().Product.Artist.Name,
                        totalSales = g.Sum(x => x.TotalPrice),
                        totalOrders = g.Count(),
                        productCount = g.Select(x => x.ProductId).Distinct().Count()
                    })
                    .OrderByDescending(x => x.totalSales)
                    .Take(10)
                    .ToList();

                return Ok(artistPerformance);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving artist performance", error = ex.Message });
            }
        }

    }
}
