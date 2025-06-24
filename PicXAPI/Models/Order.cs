namespace PicXAPI.Models;

public partial class Order
{
    public int OrderId { get; set; }

    public int BuyerId { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime? OrderDate { get; set; }

    public virtual User Buyer { get; set; } = null!;

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
