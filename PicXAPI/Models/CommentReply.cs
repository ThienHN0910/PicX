using System;
using System.Collections.Generic;

namespace PicXAPI.Models;

public partial class CommentReply
{
    public int ReplyId { get; set; }

    public int CommentId { get; set; }

    public int UserId { get; set; }

    public string Content { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual Comment Comment { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
