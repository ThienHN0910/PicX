
namespace PicXAPI.Models;

public partial class Reporting
{
    public int ReviewId { get; set; }

    public int ProductId { get; set; }

    public int UserId { get; set; }

    public string? Content { get; set; }

    public bool? IsApproved { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Products Product { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
