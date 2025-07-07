using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PicXAPI.Models
{
    public class Wallet
    {
        [Key]
        [Column("wallet_id")]
        public int WalletId { get; set; }

        [ForeignKey("User")]
        [Column("user_id")]
        public int UserId { get; set; }

        [Column("balance", TypeName = "decimal(18, 2)")]
        public decimal Balance { get; set; } = 0;

        public User? User { get; set; }
        public ICollection<WalletTransaction> Transactions { get; set; } = new List<WalletTransaction>();

    }
}
