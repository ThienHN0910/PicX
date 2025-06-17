using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PicX.Models;
using PicXAPI.DTO;
using PicXAPI.Models;
using PicXAPI.Helper;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;
using PicXAPI.Services;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("/api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        private static Dictionary<string, string> emailCodeMap = new();

        public AuthController(AppDbContext context,
                              IPasswordHasher<User> passwordHasher,
                              IConfiguration config,
                              IEmailService emailService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _config = config;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (userExists)
                return BadRequest(new { message = "Email is already registered" });

            var user = new User
            {
                Email = dto.Email.ToLower(),
                Name = dto.Name,
                CreatedAt = DateTime.UtcNow,
                Role = "buyer"
            };

            user.Password = _passwordHasher.HashPassword(user, dto.Password);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Register successfully" });
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

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddHours(int.Parse(_config["Jwt:ExpireHours"])),
                Path = "/"
            };

            Response.Cookies.Append("authToken", token, cookieOptions);

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
            if (!Request.Cookies.TryGetValue("authToken", out var token) || string.IsNullOrEmpty(token))
                return Unauthorized(new { message = "Not found token" });

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);

                var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                    return Unauthorized(new { message = "Token invalid" });

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return Unauthorized(new { message = "User not found" });

                var userInfo = new
                {
                    id = user.UserId.ToString(),
                    name = user.Name,
                    email = user.Email,
                    role = user.Role
                };

                return Ok(new { user = userInfo });
            }
            catch
            {
                return Unauthorized(new { message = "Token invalid" });
            }
        }


        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            // Tránh tiết lộ email có tồn tại hay không
            if (user == null)
                return Ok("If an account exists for this email, you will receive password reset instructions.");

            var resetLink = $"https://yourdomain.com/reset-password?email={Uri.EscapeDataString(email)}";

            string body = $@"Hi,  We received a request to reset your password.
                           Click the link below to reset it:
                          {resetLink}
               If you didn’t request this, please ignore this email.";

            await _emailService.SendEmailAsync(email, "Password Reset Instructions", body);

            return Ok("If an account exists for this email, you will receive password reset instructions.");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return NotFound("User not found.");

            // Kiểm tra mã xác nhận
            if (!emailCodeMap.ContainsKey(dto.Email) || emailCodeMap[dto.Email] != dto.Code)
                return BadRequest("Invalid or expired code.");

            // Hash và lưu mật khẩu mới
            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            // Xóa mã đã dùng
            emailCodeMap.Remove(dto.Email);

            return Ok("Password has been reset successfully.");
        }


        // Token generator
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

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
                expires: DateTime.UtcNow.AddHours(int.Parse(jwtSettings["ExpireHours"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
