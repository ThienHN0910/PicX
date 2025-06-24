using System.ComponentModel.DataAnnotations;

namespace PicXAPI.DTOs
{
    public class FavoriteDto
    {
    [Key]
    public int FavoriteId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int ProductId { get; set; }

    public DateTime? CreatedAt { get; set; }
    }
}