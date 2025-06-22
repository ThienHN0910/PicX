using System.ComponentModel.DataAnnotations;

namespace PicXAPI.DTOs
{
    public class CartDto
    {
        [Required]
        public int UserId { get; set; }
        [Required]
        public int ProductId { get; set; }
        public DateTime AddedAt { get; set; }
    }
}