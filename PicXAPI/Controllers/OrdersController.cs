using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicX.Models;
using PicXAPI.Dtos;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PicXAPI.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    private async Task<int?> GetAuthenticatedUserId()
    {
        if (!Request.Cookies.TryGetValue("authToken", out var token) || string.IsNullOrEmpty(token))
            return null;

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return null;

            var user = await _context.Users.FindAsync(userId);
            return user?.UserId;
        }
        catch
        {
            return null;
        }
    }

    // GET: api/orders
    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var userId = await GetAuthenticatedUserId();
        if (!userId.HasValue)
            return Unauthorized(new { message = "Login first" });

        var orders = await _context.Orders
            .Where(o => o.BuyerId == userId)
            .Select(o => new OrderDto
            {
                OrderId = o.OrderId,
                TotalAmount = o.TotalAmount,
                OrderDate = o.OrderDate,
                Details = o.OrderDetails.Select(od => new OrderDetailDto
                {
                    ProductTitle = od.Product.Title,
                    ImageUrl = od.Product.ImageDriveId,
                    ArtistName = od.Product.Artist.Name
                }).ToList()
            })
            .ToListAsync();

        return Ok(new { orders });
    }

    // GET: api/orders/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var userId = await GetAuthenticatedUserId();
        if (!userId.HasValue)
            return Unauthorized(new { message = "Login first" });

        var order = await _context.Orders
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.OrderId == id && o.BuyerId == userId);

        if (order == null)
            return NotFound(new { message = "Order not found" });

        return Ok(order);
    }

    // POST: api/orders
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] List<OrderDetail> orderDetails)
    {
        var userId = await GetAuthenticatedUserId();
        if (!userId.HasValue)
            return Unauthorized(new { message = "Login first" });

        if (orderDetails == null || orderDetails.Count == 0)
            return BadRequest(new { message = "No order details provided" });

        decimal total = orderDetails.Sum(od => od.TotalPrice);

        var order = new Order
        {
            BuyerId = userId.Value,
            OrderDate = DateTime.Now,
            TotalAmount = total,
            OrderDetails = orderDetails
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Order created", orderId = order.OrderId });
    }

    // DELETE: api/orders/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var userId = await GetAuthenticatedUserId();
        if (!userId.HasValue)
            return Unauthorized(new { message = "Login first" });

        var order = await _context.Orders
            .Include(o => o.OrderDetails)
            .FirstOrDefaultAsync(o => o.OrderId == id && o.BuyerId == userId);

        if (order == null)
            return NotFound(new { message = "Order not found" });

        _context.OrderDetails.RemoveRange(order.OrderDetails);
        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Order deleted" });
    }
}
