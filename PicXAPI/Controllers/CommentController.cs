using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/comments")]
    public class CommentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CommentController(AppDbContext context)
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
            catch
            {
                return null;
            }
        }

        // POST: api/comments/product/{productId}
        [HttpPost("product/{productId}")]
        public async Task<IActionResult> AddComment(int productId, [FromBody] string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return BadRequest(new { message = "Comment content is required." });

            var userId = await GetAuthenticatedUserId();
            if (!userId.HasValue)
                return Unauthorized(new { message = "Please log in to comment." });

            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return NotFound(new { message = "Product not found." });

            var comment = new Comment
            {
                ProductId = productId,
                UserId = userId.Value,
                Content = content,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Comment posted successfully.",
                comment = new
                {
                    id = comment.CommentId,
                    userId = comment.UserId,
                    content = comment.Content,
                    createdAt = comment.CreatedAt
                }
            });
        }

        // GET: api/comments/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetCommentsForProduct(int productId)
        {
            var comments = await _context.Comments
                .Where(c => c.ProductId == productId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    id = c.CommentId,
                    userId = c.UserId,
                    userName = c.User.Name,
                    content = c.Content,
                    createdAt = c.CreatedAt
                })
                .ToListAsync();

            return Ok(comments);
        }
    }
}
