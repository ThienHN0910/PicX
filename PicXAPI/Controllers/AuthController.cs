using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PicX.Models;
using PicXAPI.DTO;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("/api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IPasswordHasher<User> passwordHasher, IConfiguration config)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if email already exists (case-insensitive)
            var userExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (userExists)
                return BadRequest(new { message = "Email is already registed" });

            var user = new User
            {
                Email = dto.Email.ToLower(), // Normalize email
                Name = dto.Name,
                CreatedAt = DateTime.UtcNow,
                Role = "buyer"
            };

            user.Password = _passwordHasher.HashPassword(user, dto.Password);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registor successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return Unauthorized(new { message = "Email or password is incorrect" });

            var result = _passwordHasher.VerifyHashedPassword(user, user.Password, dto.Password);
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized(new { message = "Email or password is incorrect" });

            var token = GenerateJwtToken(user);

            // Set token in HTTP-only cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // BẮT BUỘC khi SameSite=None
                SameSite = SameSiteMode.None, // Cho phép gửi cookie cross-origin
                Expires = DateTime.UtcNow.AddHours(int.Parse(_config.GetSection("Jwt")["ExpireHours"])),
                Path = "/"
            };

            Response.Cookies.Append("authToken", token, cookieOptions);

            // Trả về thông tin user (không bao gồm token)
            var userInfo = new
            {
                id = user.UserId.ToString(),
                name = user.Name,
                email = user.Email,
                role = user.Role
            };

            return Ok(new { user = userInfo, message = "Login success" });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Xóa cookie
            Response.Cookies.Delete("authToken", new CookieOptions
            {
                Path = "/",
                SameSite = SameSiteMode.Strict
            });

            return Ok(new { message = "Logout success" });
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            // Lấy token từ cookie
            if (!Request.Cookies.TryGetValue("authToken", out var token) || string.IsNullOrEmpty(token))
            {
                return Unauthorized(new { message = "Not found token" });
            }

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);

                var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Token invalid" });
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var userInfo = new
                {
                    id = user.UserId.ToString(),
                    name = user.Name,
                    email = user.Email,
                    role = user.Role
                };

                return Ok(new { user = userInfo });
            }
            catch (Exception)
            {
                return Unauthorized(new { message = "Token invalid" });
            }
        }

        [HttpGet("google")]
        public IActionResult GoogleLogin()
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = "https://localhost:5173/api/auth/google/callback" // Buộc redirect_uri
            };
            Console.WriteLine($"Initiating Google OAuth with RedirectUri: {properties.RedirectUri}");
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("google/callback")]
        public async Task<IActionResult> GoogleCallback()
        {
            var authenticateResult = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
            if (!authenticateResult.Succeeded)
            {
                Console.WriteLine($"Authentication failed: {authenticateResult.Failure?.Message}");
                Console.WriteLine($"Request Query: {HttpContext.Request.QueryString}");
                Console.WriteLine($"Cookies: {string.Join(", ", HttpContext.Request.Cookies.Keys)}");
                return BadRequest(new { message = "Google authentication failed", details = authenticateResult.Failure?.Message });
            }
            var tokens = authenticateResult.Properties.GetTokens();
            var scope = tokens.FirstOrDefault(t => t.Name == "scope")?.Value;
            Console.WriteLine($"Scopes granted: {scope}");

            var claims = authenticateResult.Principal.Claims;
            var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var name = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(email))
                return BadRequest(new { message = "Email not provided by Google" });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
            if (user == null)
            {
                // Đăng ký người dùng mới
                user = new User
                {
                    Email = email.ToLower(),
                    Name = name ?? "Google User",
                    Role = "buyer",
                    Password = "", // Không cần mật khẩu
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    EmailVerified = true // Email từ Google được coi là đã xác minh
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            // Tạo JWT token
            var token = GenerateJwtToken(user);

            // Lưu token vào cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddHours(int.Parse(_config.GetSection("Jwt")["ExpireHours"])),
                Path = "/"
            };
            Response.Cookies.Append("authToken", token, cookieOptions);

            // Trả về URL redirect cho frontend
            return Redirect("https://localhost:5173");
        }

        // Hàm tạo token JWT
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expireHours = int.Parse(jwtSettings["ExpireHours"]);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role ?? "buyer"),
                new Claim("email", user.Email)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expireHours),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}