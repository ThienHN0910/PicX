using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.Models;
using PicXAPI.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace PicXAPI.Controllers
{
    [Route("api/favorites")]
    [ApiController]
    public class FavoriteController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoriteController(AppDbContext context)
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
                var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);
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

        // GET: api/favorites/user/{userId}
        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetFavoritesByUser(int userId)
        {
            // Only allow accessing one's own favorites (for security)
            var authUserId = await GetAuthenticatedUserId();
            if (!authUserId.HasValue || authUserId.Value != userId)
            {
                return Unauthorized("Not allowed.");
            }

            // Check if user exists
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
            {
                return NotFound("User not found.");
            }

            // Retrieve favorited products with details
            var products = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Include(f => f.Product)
                .Include(p => p.Product.Artist) // Include artist details
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new
                {
                    FavoriteId = f.FavoriteId,
                    ProductId = f.Product.ProductId,
                    ProductName = f.Product.Title,
                    Description = f.Product.Description,
                    Price = f.Product.Price,
                    ImageUrl = f.Product.ImageDriveId,
                    Dimensions = f.Product.Dimensions,
                    Tags = f.Product.Tags != null
                        ? f.Product.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        : null,
                    IsAvailable = f.Product.IsAvailable,
                    LikeCount = f.Product.LikeCount,
                    CreatedAt = f.CreatedAt,
                    Artist = new
                    {
                        Id = f.Product.Artist.UserId,
                        Name = f.Product.Artist.Name,
                    },
                })
                .ToListAsync();

            return Ok(products);
        }

        // POST: api/favorites
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<FavoriteDto>> AddFavorite(FavoriteDto favoriteDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get userId from token, do not accept from client
            var authUserId = await GetAuthenticatedUserId();
            if (!authUserId.HasValue || authUserId.Value != favoriteDto.UserId)
            {
                return Unauthorized("Not allowed.");
            }

            // Check if user and product exist
            var userExists = await _context.Users.AnyAsync(u => u.UserId == favoriteDto.UserId);
            if (!userExists)
            {
                return NotFound("User not found.");
            }

            var productExists = await _context.Products.AnyAsync(p => p.ProductId == favoriteDto.ProductId);
            if (!productExists)
            {
                return NotFound("Product not found.");
            }

            // Check for duplicate favorite
            var existingFavorite = await _context.Favorites
                .AnyAsync(f => f.UserId == favoriteDto.UserId && f.ProductId == favoriteDto.ProductId);
            if (existingFavorite)
            {
                return Conflict("This product is already favorited by the user.");
            }

            // Increment like_count in Products
            var product = await _context.Products.FindAsync(favoriteDto.ProductId);
            product.LikeCount += 1;

            var favorite = new Favorite
            {
                UserId = favoriteDto.UserId,
                ProductId = favoriteDto.ProductId
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            favoriteDto.CreatedAt = favorite.CreatedAt;

            return Ok(new
            {
                message = "Favorite created successfully",
                favorite = new
                {
                    favorite.FavoriteId,
                    favorite.UserId,
                    favorite.ProductId,
                    CreatedAt = favorite.CreatedAt
                }
            });
        }

        // DELETE: api/favorites/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteFavorite(int id)
        {
            var favorite = await _context.Favorites.FindAsync(id);
            if (favorite == null)
            {
                return NotFound("Favorite not found.");
            }

            // Only allow deleting own favorites
            var authUserId = await GetAuthenticatedUserId();
            if (!authUserId.HasValue || favorite.UserId != authUserId.Value)
            {
                return Unauthorized("Not allowed.");
            }

            // Decrement like_count in Products
            var product = await _context.Products.FindAsync(favorite.ProductId);
            if (product != null)
            {
                product.LikeCount = Math.Max(0, product.LikeCount - 1);
            }

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // Helper method to get a favorite by ID (not exposed as API)
        private async Task<ActionResult<Favorite>> GetFavorite(int id)
        {
            var favorite = await _context.Favorites
                .Include(f => f.Product)
                .Select(f => new Favorite
                {
                    FavoriteId = f.FavoriteId,
                    UserId = f.UserId,
                    Product = new Products
                    {
                        ProductId = f.Product.ProductId,
                        Title = f.Product.Title,
                        Description = f.Product.Description,
                        Price = f.Product.Price,
                        ImageDriveId = f.Product.ImageDriveId,
                        Dimensions = f.Product.Dimensions,
                        Tags = f.Product.Tags,
                        IsAvailable = f.Product.IsAvailable,
                        LikeCount = f.Product.LikeCount
                    },
                    CreatedAt = f.CreatedAt
                })
                .FirstOrDefaultAsync(f => f.FavoriteId == id);

            if (favorite == null)
            {
                return NotFound();
            }

            return favorite;
        }
    }
}
