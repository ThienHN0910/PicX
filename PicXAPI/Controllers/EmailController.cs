using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.DTOs;
using PicXAPI.Models;
using PicXAPI.Services;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public EmailController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return NotFound("Không tìm thấy người dùng.");

            var otp = new Random().Next(100000, 999999).ToString();
            user.EmailOtp = otp;
            user.EmailOtpExpiry = DateTime.UtcNow.AddMinutes(10);
            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(email, "Mã OTP Xác Thực", $@"
                <p style='font-size:16px;'>Xin chào <b>{user.Name}</b>,</p>
                <p>Đây là mã OTP để xác thực email của bạn trên PicX:</p>
                <h2 style='color:#10d194;'>{otp}</h2>
                <p>Mã có hiệu lực trong 10 phút.</p>
                <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
                "
            );

            if (user.EmailOtpExpiry != null && user.EmailOtpExpiry > DateTime.UtcNow)
                return BadRequest("Vui lòng chờ mã OTP cũ hết hạn trước khi yêu cầu mã mới.");

            return Ok("Đã gửi mã OTP về email.");
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == dto.Email &&
                u.EmailOtp == dto.Otp &&
                u.EmailOtpExpiry > DateTime.UtcNow);

            if (user == null)
                return BadRequest("OTP không hợp lệ hoặc đã hết hạn.");

            user.EmailVerified = true;
            user.EmailOtp = null;
            user.EmailOtpExpiry = null;
            await _context.SaveChangesAsync();

            return Ok("Xác thực email thành công.");
        }
    }
}
