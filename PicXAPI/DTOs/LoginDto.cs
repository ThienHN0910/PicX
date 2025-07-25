﻿using System.ComponentModel.DataAnnotations;

namespace PicXAPI.DTOs
{
    public class LoginDto
    {
        [EmailAddress(ErrorMessage = "Invalid email")]
        [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format")]
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
