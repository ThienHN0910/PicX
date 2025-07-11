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
        [Column("user_id")]
        public int UserId { get; set; }

        [Column("amount_requested", TypeName = "decimal(18, 2)")]
        public decimal AmountRequested { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        [Column("amount_received", TypeName = "decimal(18, 2)")]
        public decimal AmountReceived { get; set; }

        [Column("status")]
        public string Status { get; set; } = "pending";

        [Column("admin_note")]
        public string? AdminNote { get; set; }

        [Column("requested_at")]
        public DateTime RequestedAt { get; set; } = DateTime.Now;

        [Column("processed_at")]
        public DateTime? ProcessedAt { get; set; }

        public User? User { get; set; }
    }
}
