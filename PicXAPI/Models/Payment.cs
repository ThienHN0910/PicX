
namespace PicXAPI.Models;

public partial class Payment
{
    public int PaymentId { get; set; }

    public int OrderId { get; set; }

    public string PaymentMethod { get; set; } = null!;

    public string? PaymentProvider { get; set; }

    public string? TransactionId { get; set; }

    public DateTime? PaymentDate { get; set; }

    public decimal Amount { get; set; }

    public string? Currency { get; set; }

    public string? PaymentDetails { get; set; }

    public virtual Order Order { get; set; } = null!;
}
