using PicXAPI.Models;

namespace PicXAPI.Models
{
    public class Cart
    {
        public int CartId { get; set; }
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public DateTime AddedAt { get; set; }
        public virtual Products Product { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }

}
