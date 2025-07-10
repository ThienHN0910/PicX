using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PicXAPI.Models
{
    public class WithdrawRequest
    {
        [Key]
        [Column("request_id")]
        public int RequestId { get; set; }

        [ForeignKey("User")]
        [Column("artist_id")]
        public int ArtistId { get; set; }

        [Column("amount", TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        [Column("status")]
        public string Status { get; set; } = "pending"; // pending / approved / rejected

        [Column("requested_at")]
        public DateTime RequestedAt { get; set; } = DateTime.Now;

        [Column("processed_at")]
        public DateTime? ProcessedAt { get; set; }

        public User? User { get; set; }
    }
}
