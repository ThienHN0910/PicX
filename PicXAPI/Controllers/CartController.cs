﻿﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.Models;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using PicXAPI.DTOs;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("/api/cart")]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        // Helper: Extract userId from JWT token in Authorization header
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

                var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                    return null;

                var user = await _context.Users.FindAsync(userId);
                return user?.UserId;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing JWT token: {ex.Message}");
                return null;
            }
        }

        // GET: /api/cart - Retrieve all items in the authenticated user's cart
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = await GetAuthenticatedUserId();
            if (!userId.HasValue)
                return Unauthorized(new { message = "Please login to view your cart." });

            var cartItems = await _context.Carts
                .Where(c => c.UserId == userId.Value)
                .Include(c => c.Product)
                    .ThenInclude(p => p.Artist)
                .Select(c => new
                {
                    cartId = c.CartId,
                    productId = c.ProductId,
                    addedAt = c.AddedAt,
                    product = new
                    {
                        productId = c.Product.ProductId,
                        title = c.Product.Title,
                        price = c.Product.Price,
                        image_url = c.Product.ImageDriveId != null ? $"/api/product/image/{c.Product.ImageDriveId}" : null,
                        artist = new { name = c.Product.Artist != null ? c.Product.Artist.Name : null }
                    }
                })
                .ToListAsync();

            return Ok(new { cartItems });
        }

        // POST: /api/cart/add - Add a product to the authenticated user's cart
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] CartDto cartDto)
        {
            var userId = await GetAuthenticatedUserId();
            if (!userId.HasValue)
                return Unauthorized(new { message = "Please login to add products to your cart." });

            if (cartDto.ProductId <= 0)
                return BadRequest(new { message = "Invalid product ID." });

            var product = await _context.Products.FindAsync(cartDto.ProductId);
            if (product == null)
                return NotFound(new { message = "Product not found." });

            var existingCartItem = await _context.Carts
                .FirstOrDefaultAsync(c => c.UserId == userId.Value && c.ProductId == cartDto.ProductId);

            if (existingCartItem != null)
                return Conflict(new { message = "This product is already in your cart." });

            var cartItem = new Cart
            {
                UserId = userId.Value,
                ProductId = cartDto.ProductId,
                AddedAt = DateTime.UtcNow
            };

            _context.Carts.Add(cartItem);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Product added to cart successfully.",
                cart = new { cartItem.UserId, cartItem.ProductId }
            });
        }

        // DELETE: /api/cart/{cartId} - Remove an item from the authenticated user's cart
        [HttpDelete("{cartId}")]
        public async Task<IActionResult> RemoveFromCart(int cartId)
        {
            var userId = await GetAuthenticatedUserId();
            if (!userId.HasValue)
                return Unauthorized(new { message = "Please login to remove products from your cart." });

            var cartItem = await _context.Carts
                .FirstOrDefaultAsync(c => c.CartId == cartId && c.UserId == userId.Value);

            if (cartItem == null)
                return NotFound(new { message = "Cart item not found." });

            _context.Carts.Remove(cartItem);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Item removed from cart successfully." });
        }

        // POST: /api/cart/remove-multiple - Remove multiple items from the authenticated user's cart
        [HttpPost("remove-multiple")]
        public async Task<IActionResult> RemoveMultipleFromCart([FromBody] List<int> productIds)
        {
            var userId = await GetAuthenticatedUserId();
            if (!userId.HasValue)
                return Unauthorized(new { message = "Please login to remove items." });

            var cartItemsToRemove = await _context.Carts
                .Where(c => c.UserId == userId.Value && productIds.Contains(c.ProductId))
                .ToListAsync();

            _context.Carts.RemoveRange(cartItemsToRemove);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Selected items removed from cart." });
        }
    }
}
