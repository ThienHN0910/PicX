using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using PicXAPI.DTOs;
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

            var userInfo = new
            {
                id = user.UserId.ToString(),
                name = user.Name,
                email = user.Email,
                role = user.Role
            };

            return Ok(new { user = userInfo, token });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // For JWT-based authentication, logout is handled on the client side by removing the token
            return Ok(new { message = "Logout success" });
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            // Get token from the Authorization header (standard)
            string? authHeader = Request.Headers["Authorization"];
            if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer "))
                return Unauthorized(new { message = "Token not provided" });

            var token = authHeader.Substring("Bearer ".Length);

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

        [HttpPost("oauth/google")]
        public async Task<IActionResult> GoogleOAuthCode([FromBody] CodeDto dto)
        {
            var clientId = _config["Google:ClientId"];
            var clientSecret = _config["Google:ClientSecret"];
            var redirectUri = "https://localhost:5173/google-auth-success";

            var client = new HttpClient();
            var tokenRequest = new Dictionary<string, string>
            {
                ["code"] = dto.Code,
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["redirect_uri"] = redirectUri,
                ["grant_type"] = "authorization_code"
            };

            var tokenResponse = await client.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(tokenRequest));
            if (!tokenResponse.IsSuccessStatusCode)
                return BadRequest(new { message = "Failed to get access token" });

            var tokenResult = await tokenResponse.Content.ReadFromJsonAsync<GoogleTokenResponse>();
            if (tokenResult == null || string.IsNullOrEmpty(tokenResult.AccessToken))
                return BadRequest(new { message = "Invalid token response" });

            // Retrieve user info using access token
            var userRequest = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v2/userinfo");
            userRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenResult.AccessToken);
            var userResponse = await client.SendAsync(userRequest);
            if (!userResponse.IsSuccessStatusCode)
                return BadRequest(new { message = "Failed to get user info" });

            var userInfo = await userResponse.Content.ReadFromJsonAsync<GoogleUserInfo>();
            if (userInfo == null || string.IsNullOrEmpty(userInfo.Email))
                return BadRequest(new { message = "Invalid user info" });

            // Get or create user in database
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == userInfo.Email.ToLower());
            if (user == null)
            {
                user = new User
                {
                    Email = userInfo.Email.ToLower(),
                    Name = userInfo.Name,
                    Password = "", // Google login
                    Role = "buyer",
                    CreatedAt = DateTime.UtcNow,
                    EmailVerified = true
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

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
                new Claim("email", user.Email),
                new Claim("user_id", user.UserId.ToString())
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
