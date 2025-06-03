using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PicX.Models;
using PicXAPI.Models;

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
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
                return BadRequest(new { message = "Email và password không được để trống" });

            // Kiểm tra email đã tồn tại chưa
            var userExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (userExists)
                return BadRequest(new { message = "Email đã được đăng ký" });

            var user = new User
            {
                Email = dto.Email,
                Name = dto.Name,
                CreatedAt = DateTime.UtcNow,
                Role = "buyer"  // Gán role mặc định
            };

            user.Password = _passwordHasher.HashPassword(user, dto.Password);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
                return BadRequest(new { message = "Email và password không được để trống" });

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });

            var result = _passwordHasher.VerifyHashedPassword(user, user.Password, dto.Password);
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });

            var token = GenerateJwtToken(user);

            // Set token in HTTP-only cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true, // Không thể truy cập từ JavaScript
                Secure = true,   // Chỉ gửi qua HTTPS (set false nếu dev không dùng HTTPS)
                SameSite = SameSiteMode.Strict, // CSRF protection
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

            return Ok(new { user = userInfo, message = "Đăng nhập thành công" });
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

            return Ok(new { message = "Đăng xuất thành công" });
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            // Lấy token từ cookie
            if (!Request.Cookies.TryGetValue("authToken", out var token) || string.IsNullOrEmpty(token))
            {
                return Unauthorized(new { message = "Không tìm thấy token xác thực" });
            }

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);

                var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Token không hợp lệ" });
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return Unauthorized(new { message = "Người dùng không tồn tại" });
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
                return Unauthorized(new { message = "Token không hợp lệ" });
            }
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