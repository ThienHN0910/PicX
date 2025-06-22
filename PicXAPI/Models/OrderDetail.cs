using System;
using System.Collections.Generic;

namespace PicXAPI.Models;

public partial class OrderDetail
{
    public int OrderDetailId { get; set; }

    public int OrderId { get; set; }

    public int ProductId { get; set; }

    public decimal TotalPrice { get; set; }

    public virtual Order Order { get; set; } = null!;

    public virtual Products Product { get; set; } = null!;
}
