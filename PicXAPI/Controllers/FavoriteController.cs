using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.Models;
using PicXAPI.DTOs;

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

        // GET: api/favorites/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetFavoritesByUser(int userId)
        {
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
                .OrderByDescending(f => f.CreatedAt) // Newest first
                .Select(f => new
                {
                    ProductId = f.Product.ProductId,
                    ProductName = f.Product.Title,
                    Description = f.Product.Description,
                    Price = f.Product.Price,
                    ImageUrl = f.Product.ImageDriveId,
                    AdditionalImages = f.Product.AdditionalImages,
                    Dimensions = f.Product.Dimensions,
                    Tags = f.Product.Tags != null
                        ? f.Product.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        : null,
                    IsAvailable = f.Product.IsAvailable,
                    LikeCount = f.Product.LikeCount,
                    CreatedAt = f.CreatedAt // When the product was favorited
                })
                .ToListAsync();

            return Ok(products); // Returns empty list if no favorites
        }

        // POST: api/favorites
        [HttpPost]
        public async Task<ActionResult<FavoriteDto>> AddFavorite(FavoriteDto favoriteDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
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
        public async Task<IActionResult> DeleteFavorite(int id)
        {
            var favorite = await _context.Favorites.FindAsync(id);
            if (favorite == null)
            {
                return NotFound("Favorite not found.");
            }

            // Decrement like_count in Products
            var product = await _context.Products.FindAsync(favorite.ProductId);
            if (product != null)
            {
                product.LikeCount = Math.Max(0, product.LikeCount - 1);
            }

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Helper method to get a favorite by ID (used for CreatedAtAction)
        private async Task<ActionResult<FavoriteDto>> GetFavorite(int id)
        {
            var favorite = await _context.Favorites
                .Select(f => new FavoriteDto
                {
                    FavoriteId = f.FavoriteId,
                    UserId = f.UserId,
                    ProductId = f.ProductId,
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