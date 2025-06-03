using System;
using System.Collections.Generic;

namespace PicX.Models;

public partial class Session
{
    public string SessionId { get; set; } = null!;

    public int UserId { get; set; }

    public string? IpAddress { get; set; }

    public string? UserAgent { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime ExpiresAt { get; set; }

    public bool? IsActive { get; set; }

    public virtual User User { get; set; } = null!;
}
