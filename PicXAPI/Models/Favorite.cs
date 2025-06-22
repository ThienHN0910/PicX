using System;
using System.Collections.Generic;

namespace PicXAPI.Models;

public partial class Favorite
{
    public int FavoriteId { get; set; }

    public int UserId { get; set; }

    public int ProductId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Products Product { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
