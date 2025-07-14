using System.Net;
using System.Net.Mail;

namespace PicXAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            var smtpClient = new SmtpClient
            {
                Host = _config["Email:SmtpHost"],
                Port = int.Parse(_config["Email:SmtpPort"]),
                EnableSsl = true,
                Credentials = new NetworkCredential(
                    _config["Email:Username"],
                    _config["Email:Password"]
                )
            };

            var mail = new MailMessage
            {
                From = new MailAddress(_config["Email:Username"], "PicX Support"),
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true
            };

            mail.To.Add(toEmail);
            await smtpClient.SendMailAsync(mail);
        }
    }

}
