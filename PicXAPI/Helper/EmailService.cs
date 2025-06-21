// Services/EmailService.cs
using System.Net;
using System.Net.Mail;

namespace PicXAPI.Services
{
    public class EmailService : IEmailService
    {
        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var smtp = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential("your_email@gmail.com", "your_app_password"),
                EnableSsl = true,
            };

            var mail = new MailMessage("your_email@gmail.com", toEmail, subject, body);
            await smtp.SendMailAsync(mail);
        }
    }

}
