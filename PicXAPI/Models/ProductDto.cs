using System.ComponentModel.DataAnnotations;

namespace PicXAPI.Models
{
    public class ProductDto
    {
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Price must be a positive number")]
        public decimal Price { get; set; }
        [Required]
        public string CategoryName { get; set; } // Use category name instead of ID
        public string Dimensions { get; set; }
        public bool IsAvailable { get; set; } = true;
        public string Tags { get; set; }
        [Required]
        public IFormFile Image { get; set; }
        public List<IFormFile> AdditionalImages { get; set; }
    }
}
