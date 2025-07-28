using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.Models;
using PicXAPI.DTOs;
using PicXAPI.Services;
using System.Security.Claims;
using System.Text.Json;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.SignalR;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/product")]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ProductController> _logger;
        private readonly S3Service _s3Service;
        private readonly IWatermarkService _watermarkService;

        public ProductController(AppDbContext context, ILogger<ProductController> logger, IWatermarkService watermarkService, S3Service s3Service)
        {
            _context = context;
            _logger = logger;
            _watermarkService = watermarkService;
            _s3Service = s3Service;
        }

        // Helper: Lấy userId từ JWT trong Authorization header
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
                {
                    return null;
                }

                var user = await _context.Users.FindAsync(userId);
                return user?.UserId;
            }
            catch
            {
                return null;
            }
        }

        private async Task<bool> IsArtistOrAdmin(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user != null && (user.Role == "artist" || user.Role == "admin");
        }

        private async Task<string> UploadFileToS3(IFormFile file)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            using var stream = file.OpenReadStream();
            return await _s3Service.UploadFileAsync(stream, fileName, file.ContentType);
        }

        private async Task DeleteFileFromS3(string fileKey)
        {
            await _s3Service.DeleteFileAsync(fileKey);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var categories = await _context.Categories
                    .Select(c => new { categoryId = c.CategoryId, name = c.Name })
                    .ToListAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve categories.");
                return StatusCode(500, new { error = "An error occurred while retrieving categories", details = ex.Message });
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllProducts([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            try
            {
                var skip = (page - 1) * limit;
                var products = await _context.Products.Where(p => p.IsAvailable == true)
                    .Include(p => p.Category)
                    .Include(p => p.Artist)
                    .Select(p => new
                    {
                        ProductId = p.ProductId,
                        Title = p.Title,
                        Description = p.Description,
                        Price = p.Price,
                        CategoryId = p.Category.CategoryId,
                        CategoryName = p.Category.Name,
                        Dimensions = p.Dimensions,
                        IsAvailable = p.IsAvailable,
                        Tags = p.Tags,
                        ImageFileId = p.ImageDriveId,
                        Artist = new
                        {
                            Id = p.Artist.UserId,
                            Name = p.Artist.Name
                        },
                        CreatedAt = p.CreatedAt,
                        LikeCount = p.LikeCount
                    })
                    .Skip(skip)
                    .Take(limit)
                    .ToListAsync();

                var totalProducts = await _context.Products.CountAsync();
                var hasMore = skip + products.Count < totalProducts;

                return Ok(new { products, hasMore, totalPages = (int)Math.Ceiling((double)totalProducts / limit) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve all products.");
                return StatusCode(500, new { error = "An error occurred while retrieving products", details = ex.Message });
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            try
            {
                var userId = await GetAuthenticatedUserId();
                if (userId == null)
                {
                    _logger.LogWarning("User ID not found in token.");
                    return Unauthorized(new { error = "User not authenticated" });
                }

                if (!await IsArtistOrAdmin(userId.Value))
                {
                    return Forbid();
                }

                var products = await _context.Products
                    .Where(p => p.ArtistId == userId.Value)
                    .Include(p => p.Category)
                    .Select(p => new
                    {
                        ProductId = p.ProductId,
                        Title = p.Title,
                        Description = p.Description,
                        Price = p.Price,
                        CategoryName = p.Category.Name,
                        Dimensions = p.Dimensions,
                        IsAvailable = p.IsAvailable,
                        Tags = p.Tags,
                        ImageFileId = p.ImageDriveId,
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve products.");
                return StatusCode(500, new { error = "An error occurred while retrieving products", details = ex.Message });
            }
        }

        [HttpGet("artist/{artistId}")]
        public async Task<IActionResult> GetProductsByArtist(int artistId, [FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            try
            {
                var artistExists = await _context.Users.AnyAsync(u => u.UserId == artistId && u.Role == "artist");
                if (!artistExists)
                {
                    _logger.LogWarning($"Artist with ID {artistId} not found.");
                    return NotFound(new { error = "Artist not found" });
                }

                var skip = (page - 1) * limit;
                var products = await _context.Products
                    .Where(p => p.ArtistId == artistId & p.IsAvailable == true)
                    .Include(p => p.Category)
                    .Include(p => p.Artist)
                    .Select(p => new
                    {
                        ProductId = p.ProductId,
                        Title = p.Title,
                        Description = p.Description,
                        Price = p.Price,
                        CategoryId = p.Category.CategoryId,
                        CategoryName = p.Category.Name,
                        Dimensions = p.Dimensions,
                        IsAvailable = p.IsAvailable,
                        Tags = p.Tags,
                        ImageFileId = p.ImageDriveId,
                        Artist = new
                        {
                            Id = p.Artist.UserId,
                            Name = p.Artist.Name
                        },
                        CreatedAt = p.CreatedAt,
                        LikeCount = p.LikeCount
                    })
                    .Skip(skip)
                    .Take(limit)
                    .ToListAsync();

                var totalProducts = await _context.Products.Where(p => p.ArtistId == artistId).CountAsync();
                var hasMore = skip + products.Count < totalProducts;

                return Ok(new { products, hasMore, totalPages = (int)Math.Ceiling((double)totalProducts / limit) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to retrieve products for artist ID: {artistId}");
                return StatusCode(500, new { error = "An error occurred while retrieving products for this artist", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            try
            {
                var userId = await GetAuthenticatedUserId();
                var isAuthenticated = userId != null;

                var product = await _context.Products
                    .Where(p => p.ProductId == id)
                    .Include(p => p.Category)
                    .Include(p => p.Artist)
                    .Select(p => new
                    {
                        ProductId = p.ProductId,
                        Title = p.Title,
                        Description = p.Description,
                        Price = p.Price,
                        CategoryName = p.Category.Name,
                        Dimensions = p.Dimensions,
                        IsAvailable = p.IsAvailable,
                        Tags = p.Tags,
                        ImageFileId = p.ImageDriveId,
                        Artist = new
                        {
                            Id = p.Artist.UserId,
                            Name = p.Artist.Name,
                            CreatedAt = p.Artist.CreatedAt
                        },
                        LikeCount = p.LikeCount,
                        Permissions = new
                        {
                            CanView = true,
                            CanLike = isAuthenticated,
                            CanComment = isAuthenticated,
                            CanAddToCart = isAuthenticated,
                            CanEdit = false
                        }
                    })
                    .FirstOrDefaultAsync();

                if (product == null)
                {
                    _logger.LogWarning($"Product with ID {id} not found.");
                    return NotFound(new { error = "Product not found" });
                }

                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to retrieve product with ID: {id}");
                return StatusCode(500, new { error = "Failed to retrieve product", details = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] ProductDto dto)
        {
            try
            {
                var userId = await GetAuthenticatedUserId();
                if (userId == null)
                {
                    _logger.LogWarning("User ID not found in token.");
                    return Unauthorized(new { error = "User not authenticated" });
                }

                if (!await IsArtistOrAdmin(userId.Value))
                {
                    return Forbid();
                }

                var product = await _context.Products
                    .Where(p => p.ProductId == id && p.ArtistId == userId.Value)
                    .FirstOrDefaultAsync();

                if (product == null)
                {
                    _logger.LogWarning($"Product with ID {id} not found or not owned by user {userId}.");
                    return NotFound(new { error = "Product not found" });
                }

                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name == dto.CategoryName);
                if (category == null)
                {
                    _logger.LogWarning($"Category {dto.CategoryName} not found.");
                    return BadRequest(new { error = "Invalid category name" });
                }

                // Update fields
                product.Title = dto.Title;
                product.Description = dto.Description;
                product.Price = dto.Price;
                product.CategoryId = category.CategoryId;
                product.Dimensions = dto.Dimensions;
                product.IsAvailable = dto.IsAvailable;
                product.Tags = dto.Tags;
                product.UpdatedAt = DateTime.UtcNow;

                // Update main image if provided and not a placeholder
                if (dto.Image != null && dto.Image.Length > 0 && dto.Image.ContentType != "text/plain")
                {
                    var extension = Path.GetExtension(dto.Image.FileName).ToLowerInvariant();
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                    if (!allowedExtensions.Contains(extension))
                    {
                        return BadRequest(new { error = "Invalid image format. Only JPG, PNG, and GIF are allowed." });
                    }

                    // Delete old image
                    if (!string.IsNullOrEmpty(product.ImageDriveId))
                    {
                        await DeleteFileFromS3(product.ImageDriveId);
                    }

                    var mainImageFileName = $"{Guid.NewGuid()}{extension}";
                    product.ImageDriveId = await UploadFileToS3(dto.Image);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Product updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to update product with ID: {id}");
                return StatusCode(500, new { error = "Failed to update product", details = ex.Message });
            }
        }

        [HttpGet("image/{fileKey}")]
        public async Task<IActionResult> GetImage(string fileKey)
        {
            try
            {
                var product = await _context.Products.FirstOrDefaultAsync(p => p.ImageDriveId == fileKey);
                if (product == null)
                {
                    return NotFound("Image not found.");
                }

                var stream = await _s3Service.GetFileAsync(fileKey);
                stream.Position = 0;

                var mimeType = "image/jpeg"; // hoặc dùng extension để xác định

                var watermarked = await _watermarkService.ApplyTextWatermarkAsync(stream, "PicX", mimeType);
                Response.Headers["Cache-Control"] = "public,max-age=86400";
                return File(watermarked, mimeType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get image.");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("add")]
        [Authorize]
        public async Task<IActionResult> CreateProduct([FromForm] ProductDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = await GetAuthenticatedUserId();
                if (userId == null)
                {
                    return Unauthorized(new { error = "User not authenticated" });
                }

                if (!await IsArtistOrAdmin(userId.Value))
                {
                    return Forbid();
                }

                if (dto.Image == null || dto.Image.Length == 0)
                {
                    return BadRequest(new { error = "Image is required" });
                }

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var extension = Path.GetExtension(dto.Image.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { error = "Invalid image format. Only JPG, PNG, and GIF are allowed." });
                }

                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name == dto.CategoryName);
                if (category == null)
                {
                    return BadRequest(new { error = "Invalid category name" });
                }

                var mainImageFileName = $"{Guid.NewGuid()}{extension}";
                var mainImageFileId = await UploadFileToS3(dto.Image);

                var product = new Products
                {
                    ArtistId = userId.Value,
                    CategoryId = category.CategoryId,
                    Title = dto.Title,
                    Description = dto.Description,
                    Price = dto.Price,
                    ImageDriveId = mainImageFileId,
                    Dimensions = dto.Dimensions,
                    IsAvailable = dto.IsAvailable,
                    Tags = dto.Tags,
                    LikeCount = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Product created successfully",
                    product = new
                    {
                        product.ProductId,
                        product.Title,
                        product.Description,
                        product.Price,
                        CategoryName = category.Name,
                        product.Dimensions,
                        product.IsAvailable,
                        product.Tags,
                        ImageFileId = product.ImageDriveId,
                        product.LikeCount,
                        product.ArtistId,
                        product.CreatedAt,
                        product.UpdatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create product");
                return StatusCode(500, new { error = "An error occurred while creating the product", details = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var userId = await GetAuthenticatedUserId();
                if (userId == null)
                {
                    _logger.LogWarning("User ID not found in token.");
                    return Unauthorized(new { error = "User not authenticated" });
                }

                if (!await IsArtistOrAdmin(userId.Value))
                {
                    return Forbid();
                }

                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == id && p.ArtistId == userId.Value);

                if (product == null)
                {
                    _logger.LogWarning($"Product with ID {id} not found or not owned by user {userId}.");
                    return NotFound(new { error = "Product not found" });
                }

                // Delete main image from Google Drive
                if (!string.IsNullOrEmpty(product.ImageDriveId))
                {
                    await DeleteFileFromS3(product.ImageDriveId);
                }

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Product deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to delete product with ID: {id}");
                return StatusCode(500, new { error = "Failed to delete product", details = ex.Message });
            }
        }

        [HttpPut("set-unavailable/{id}")]
        [Authorize(Roles = "admin,artist")]
        public async Task<IActionResult> SetProductUnavailable(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { error = "Product not found" });
            }
            if (product.IsAvailable == false)
            {
                return BadRequest(new { error = "Product is already unavailable" });
            }
            product.IsAvailable = false;
            await _context.SaveChangesAsync();

            // Gửi notification cho artist
            if (product.ArtistId != null)
            {
                var notification = new Notification
                {
                    UserId = product.ArtistId,
                    Type = "Product",
                    Title = "Artwork Locked",
                    Message = $"Your artwork '{product.Title}' was locked by admin.",
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

            return Ok(new { message = "Product is now unavailable" });
        }
    }
}
