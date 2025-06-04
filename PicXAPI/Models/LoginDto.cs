using System.ComponentModel.DataAnnotations;

namespace PicXAPI.Models
{
    public class LoginDto
    {
        [EmailAddress]
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
