using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PicXAPI.Models
{
    public class WalletTransaction
    {
        [Key]
        [Column("transaction_id")]
        public int TransactionId { get; set; }

        [ForeignKey("Wallet")]
        [Column("wallet_id")]
        public int WalletId { get; set; }

        [Column("amount", TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        [Column("transaction_type")]
        public string TransactionType { get; set; } = ""; // deposit / purchase / withdraw

        [Column("description")]
        public string? Description { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        [Column("external_transaction_id")]
        public long? ExternalTransactionId { get; set; }

        public Wallet? Wallet { get; set; }
    }
}
