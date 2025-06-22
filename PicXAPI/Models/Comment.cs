using System;
using System.Collections.Generic;

namespace PicXAPI.Models;

public partial class Comment
{
    public int CommentId { get; set; }

    public int UserId { get; set; }

    public int ProductId { get; set; }

    public string Content { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<CommentReply> CommentReplies { get; set; } = new List<CommentReply>();

    public virtual Products Product { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
