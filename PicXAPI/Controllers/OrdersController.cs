using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.Models;
using PicXAPI.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        // Helper: Get userId from JWT in Authorization header
        private async Task<int?> GetAuthenticatedUserId()
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                return null;

            var token = authHeader.Substring("Bearer ".Length);

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

        // GET: api/orders - Get all orders of authenticated user
        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var userId = await GetAuthenticatedUserId();
            if (!userId.HasValue)
                return Unauthorized(new { message = "Login first" });

            var orders = await _context.Orders
                .Where(o => o.BuyerId == userId)
                .Select(o => new GetOrderDto
                {
                    OrderId = o.OrderId,
                    TotalAmount = o.TotalAmount,
                    OrderDate = o.OrderDate,
                    Items = o.OrderDetails.Select(od => new GetOrderDetailDto
                    {
                        ProductId = od.ProductId,
                        ProductTitle = od.Product.Title,
                        TotalPrice = od.Product.Price,
                        ImageUrl = "/api/product/image/" + od.Product.ImageDriveId,
                        ArtistName = od.Product.Artist.Name,
                    }).ToList()
                })
                .ToListAsync();

            return Ok(new { orders });
        }

        // GET: api/orders/{id} - Get specific order by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var userId = await GetAuthenticatedUserId();
            if (!userId.HasValue)
                return Unauthorized(new { message = "Login first" });

            var order = await _context.Orders
                .Where(o => o.OrderId == id && o.BuyerId == userId)
                .Select(o => new GetOrderDto
                {
                    OrderId = o.OrderId,
                    TotalAmount = o.TotalAmount,
                    OrderDate = o.OrderDate,
                    Items = o.OrderDetails.Select(od => new GetOrderDetailDto
                    {
                        ProductId = od.ProductId,
                        ProductTitle = od.Product.Title,
                        TotalPrice = od.Product.Price,
                        ImageUrl = "/api/product/image/" + od.Product.ImageDriveId,
                        ArtistName = od.Product.Artist.Name,
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (order == null)
                return NotFound(new { message = "Order not found" });

            return Ok(order);
        }

        // POST: api/orders - Create a new order
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto createOrder)
        {
            var userId = await GetAuthenticatedUserId();
            if (!userId.HasValue)
                return Unauthorized(new { message = "Login first" });

            if (createOrder == null || createOrder.Items.Count == 0)
                return BadRequest(new { message = "No order details provided" });

            var productId = createOrder.Items.Select(d => d.ProductId).ToList();
            var products = await _context.Products
                           .Where(p => productId.Contains(p.ProductId))
                           .ToListAsync();

            if (products.Count != productId.Count)
                return BadRequest(new { message = "Some pictures are invalid or no longer available" });

            var totalAmount = products.Sum(p => p.Price);
            var orderDetails = products.Select(p => new OrderDetail
            {
                ProductId = p.ProductId,
                TotalPrice = p.Price
            }).ToList();

            var order = new Order
            {
                BuyerId = userId.Value,
                OrderDate = DateTime.Now,
                TotalAmount = totalAmount,
                OrderDetails = orderDetails
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order created", orderId = order.OrderId });
        }

        // DELETE: api/orders/{id} - Delete an order
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

            return Ok(new
            {
                message = "Order deleted",
                deletedOrderId = order.OrderId,
                deletedProducts = order.OrderDetails.Select(od => od.ProductId).ToList()
            });
        }

        // POST: api/orders/{orderId}/pay-wallet
        [HttpPost("{orderId}/pay-wallet")]
        public async Task<IActionResult> PayOrderWithWallet(int orderId)
        {
            var userId = await GetAuthenticatedUserId();
            if (!userId.HasValue)
                return Unauthorized(new { message = "Login first" });

            Console.WriteLine($"Processing order {orderId} for user {userId.Value} using wallet payment.");
            var result = await _context.Database
                .ExecuteSqlRawAsync("EXEC sp_ProcessOrderWithWallet @p0, @p1", orderId, userId.Value);

            // Có thể kiểm tra kết quả trả về từ SP (nếu SP trả về output)
            // Ví dụ: nếu SP trả về lỗi, return BadRequest

            // Sau khi SP thành công, ghi log giao dịch bằng C#
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.BuyerId == userId);

            if (order == null)
                return NotFound(new { message = "Order not found" });

            // Lấy ví buyer và artist
            var buyerWallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
            if (buyerWallet != null)
            {
                _context.WalletTransactions.Add(new WalletTransaction
                {
                    WalletId = buyerWallet.WalletId,
                    Amount = -order.TotalAmount,
                    TransactionType = "purchase",
                    Description = $"Thanh toán đơn hàng #{order.OrderId}",
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Ghi log cho từng artist (nếu đơn có nhiều artist)
            foreach (var od in order.OrderDetails)
            {
                var product = await _context.Products.FindAsync(od.ProductId);
                if (product == null) continue;

                var artistWallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == product.ArtistId);
                if (artistWallet == null) continue;

                var commission = od.TotalPrice * 0.10m;
                var artistAmount = od.TotalPrice - commission;

                _context.WalletTransactions.Add(new WalletTransaction
                {
                    WalletId = artistWallet.WalletId,
                    Amount = artistAmount,
                    TransactionType = "sale",
                    Description = $"Nhận tiền bán sản phẩm #{product.ProductId} từ đơn hàng #{order.OrderId}",
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Ghi log Payment
            _context.Payments.Add(new Payment
            {
                OrderId = order.OrderId,
                Amount = order.TotalAmount,
                PaymentMethod = "wallet",
                PaymentProvider = "internal",
                PaymentDate = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Thanh toán đơn hàng thành công bằng ví nội bộ." });
        }
    }
}
