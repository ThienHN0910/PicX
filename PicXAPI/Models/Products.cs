using System;
using System.Collections.Generic;

namespace PicX.Models;

public partial class Products
{
    public int ProductId { get; set; }

    public int ArtistId { get; set; }

    public int? CategoryId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? ImageDriveId { get; set; }

    public string? AdditionalImages { get; set; }

    public string? Dimensions { get; set; }

    public bool? IsAvailable { get; set; }

    public string? Tags { get; set; }

    public int? LikeCount { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User Artist { get; set; } = null!;

    public virtual Category? Category { get; set; }

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ICollection<Reporting> Reportings { get; set; } = new List<Reporting>();
}
