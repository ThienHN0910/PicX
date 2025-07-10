namespace PicXAPI.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Role { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public bool? IsActive { get; set; }

    public bool? EmailVerified { get; set; }

    public DateTime? LastLogin { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ArtistProfile? ArtistProfile { get; set; }

    public virtual ICollection<Chat> ChatReceivers { get; set; } = new List<Chat>();

    public virtual ICollection<Chat> ChatSenders { get; set; } = new List<Chat>();

    public virtual ICollection<CommentReply> CommentReplies { get; set; } = new List<CommentReply>();

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    public virtual ICollection<FinancialReport> FinancialReports { get; set; } = new List<FinancialReport>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Products> Products { get; set; } = new List<Products>();

    public virtual ICollection<Reporting> Reportings { get; set; } = new List<Reporting>();

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();
    public Wallet Wallet { get; set; }
    public ICollection<WithdrawRequest> WithdrawRequests { get; set; } = new List<WithdrawRequest>();

    // public string? ResetToken { get; set; }
    // public DateTime? ResetTokenExpiry { get; set; }

}
