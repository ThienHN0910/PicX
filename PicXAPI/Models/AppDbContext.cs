using Microsoft.EntityFrameworkCore;

namespace PicXAPI.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ArtistProfile> ArtistProfiles { get; set; }
    public virtual DbSet<Category> Categories { get; set; }
    public virtual DbSet<Chat> Chats { get; set; }
    public virtual DbSet<Comment> Comments { get; set; }
    public virtual DbSet<CommentReply> CommentReplies { get; set; }
    public virtual DbSet<Favorite> Favorites { get; set; }
    public virtual DbSet<FinancialReport> FinancialReports { get; set; }
    public virtual DbSet<Notification> Notifications { get; set; }
    public virtual DbSet<Order> Orders { get; set; }
    public virtual DbSet<OrderDetail> OrderDetails { get; set; }
    public virtual DbSet<Payment> Payments { get; set; }
    public virtual DbSet<Products> Products { get; set; }
    public virtual DbSet<Reporting> Reportings { get; set; }
    public virtual DbSet<Session> Sessions { get; set; }
    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<Cart> Carts { get; set; }
    public virtual DbSet<Wallet> Wallets { get; set; }
    public virtual DbSet<WalletTransaction> WalletTransactions { get; set; }
    public virtual DbSet<WithdrawRequest> WithdrawRequests { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ArtistProfile>(entity =>
        {
            entity.HasKey(e => e.ArtistId).HasName("PK__ArtistPr__6CD0400102775B1B");

            entity.Property(e => e.ArtistId)
                .ValueGeneratedNever()
                .HasColumnName("artist_id");
            entity.Property(e => e.Bio).HasColumnName("bio");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.ExperienceYears).HasColumnName("experience_years");
            entity.Property(e => e.ProfilePicture)
                .HasMaxLength(255)
                .HasColumnName("profile_picture");
            entity.Property(e => e.SocialMediaLinks).HasColumnName("social_media_links");
            entity.Property(e => e.Specialization)
                .HasMaxLength(100)
                .HasColumnName("specialization");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.WebsiteUrl)
                .HasMaxLength(255)
                .HasColumnName("website_url");

            entity.HasOne(d => d.Artist)
                .WithOne(p => p.ArtistProfile)
                .HasForeignKey<ArtistProfile>(d => d.ArtistId)
                .HasConstraintName("FK__ArtistPro__artis__2E1BDC42");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__D54EE9B4B4AB38BB");

            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Description)
                .HasMaxLength(500)
                .HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.ParentCategoryId).HasColumnName("parent_category_id");

            entity.HasOne(d => d.ParentCategory)
                .WithMany(p => p.InverseParentCategory)
                .HasForeignKey(d => d.ParentCategoryId)
                .HasConstraintName("FK__Categorie__paren__31EC6D26");
        });

        modelBuilder.Entity<Chat>(entity =>
        {
            entity.HasKey(e => e.ChatId).HasName("PK__Chats__FD040B178BAD7184");

            entity.Property(e => e.ChatId).HasColumnName("chat_id");
            entity.Property(e => e.IsRead)
                .HasDefaultValue(false)
                .HasColumnName("is_read");
            entity.Property(e => e.Message).HasColumnName("message");
            entity.Property(e => e.ReceiverId).HasColumnName("receiver_id");
            entity.Property(e => e.SenderId).HasColumnName("sender_id");
            entity.Property(e => e.SentAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("sent_at");

            entity.HasOne(d => d.Receiver)
                .WithMany(p => p.ChatReceivers)
                .HasForeignKey(d => d.ReceiverId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Chats__receiver___5AEE82B9");

            entity.HasOne(d => d.Sender)
                .WithMany(p => p.ChatSenders)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Chats__sender_id__59FA5E80");
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("PK__Comments__E79576879A88D365");

            entity.Property(e => e.CommentId).HasColumnName("comment_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Product)
                .WithMany(p => p.Comments)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__Comments__produc__4AB81AF0");

            entity.HasOne(d => d.User)
                .WithMany(p => p.Comments)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Comments__user_i__49C3F6B7");
        });

        modelBuilder.Entity<CommentReply>(entity =>
        {
            entity.HasKey(e => e.ReplyId).HasName("PK__CommentR__EE405698C9D8E9B2");

            entity.Property(e => e.ReplyId).HasColumnName("reply_id");
            entity.Property(e => e.CommentId).HasColumnName("comment_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Comment)
                .WithMany(p => p.CommentReplies)
                .HasForeignKey(d => d.CommentId)
                .HasConstraintName("FK__CommentRe__comme__4E88ABD4");

            entity.HasOne(d => d.User)
                .WithMany(p => p.CommentReplies)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CommentRe__user___4F7CD00D");
        });

        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.HasKey(e => e.FavoriteId).HasName("PK__Favorite__46ACF4CB05875304");

            entity.HasIndex(e => new { e.UserId, e.ProductId }, "UQ__Favorite__FDCE10D167584305").IsUnique();

            entity.Property(e => e.FavoriteId).HasColumnName("favorite_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Product)
                .WithMany(p => p.Favorites)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Favorites__produ__5535A963");

            entity.HasOne(d => d.User)
                .WithMany(p => p.Favorites)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Favorites__user___5441852A");
        });

        modelBuilder.Entity<FinancialReport>(entity =>
        {
            entity.HasKey(e => e.ReportId).HasName("PK__Financia__779B7C58184CDE44");

            entity.Property(e => e.ReportId).HasColumnName("report_id");
            entity.Property(e => e.ArtistId).HasColumnName("artist_id");
            entity.Property(e => e.CommissionRate)
                .HasDefaultValue(10.00m)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("commission_rate");
            entity.Property(e => e.GeneratedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("generated_at");
            entity.Property(e => e.NetEarnings)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(12, 2)")
                .HasColumnName("net_earnings");
            entity.Property(e => e.PeriodEnd).HasColumnName("period_end");
            entity.Property(e => e.PeriodStart).HasColumnName("period_start");
            entity.Property(e => e.TotalCommission)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(12, 2)")
                .HasColumnName("total_commission");
            entity.Property(e => e.TotalSales)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(12, 2)")
                .HasColumnName("total_sales");

            entity.HasOne(d => d.Artist)
                .WithMany(p => p.FinancialReports)
                .HasForeignKey(d => d.ArtistId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__Financial__artis__73BA3083");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__E059842F831D78D5");

            entity.Property(e => e.NotificationId).HasColumnName("notification_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.EntityType)
                .HasMaxLength(50)
                .HasColumnName("entity_type");
            entity.Property(e => e.IsRead)
                .HasDefaultValue(false)
                .HasColumnName("is_read");
            entity.Property(e => e.Message)
                .HasMaxLength(500)
                .HasColumnName("message");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.Type)
                .HasMaxLength(50)
                .HasColumnName("type");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User)
                .WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Notificat__user___6C190EBB");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__465962298B6B6AC2");

            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.BuyerId).HasColumnName("buyer_id");
            entity.Property(e => e.OrderDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("order_date");
            entity.Property(e => e.TotalAmount)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("total_amount");

            entity.HasOne(d => d.Buyer)
                .WithMany(p => p.Orders)
                .HasForeignKey(d => d.BuyerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Orders__buyer_id__3D5E1FD2");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__OrderDet__3C5A4080B28191D1");

            entity.Property(e => e.OrderDetailId).HasColumnName("order_detail_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.TotalPrice)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("total_price");

            entity.HasOne(d => d.Order)
                .WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__OrderDeta__order__403A8C7D");

            entity.HasOne(d => d.Product)
                .WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderDeta__produ__412EB0B6");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payments__ED1FC9EAAB7E9FAB");

            entity.Property(e => e.PaymentId).HasColumnName("payment_id");
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.Currency)
                .HasMaxLength(10)
                .HasDefaultValue("VND")
                .HasColumnName("currency");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PaymentDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("payment_date");
            entity.Property(e => e.PaymentDetails).HasColumnName("payment_details");
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(50)
                .HasColumnName("payment_method");
            entity.Property(e => e.PaymentProvider)
                .HasMaxLength(50)
                .HasColumnName("payment_provider");
            entity.Property(e => e.TransactionId)
                .HasMaxLength(100)
                .HasColumnName("transaction_id");

            entity.HasOne(d => d.Order)
                .WithMany(p => p.Payments)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Payments__order___45F365D3");
        });

        modelBuilder.Entity<Products>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__Products__47027DF59C2B42B3");

            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.ArtistId).HasColumnName("artist_id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Dimensions)
                .HasMaxLength(100)
                .HasColumnName("dimensions");
            entity.Property(e => e.ImageDriveId)
                .HasMaxLength(255)
                .HasColumnName("image_url");
            entity.Property(e => e.IsAvailable)
                .HasDefaultValue(true)
                .HasColumnName("is_available");
            entity.Property(e => e.LikeCount)
                .HasDefaultValue(0)
                .HasColumnName("like_count");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("price");
            entity.Property(e => e.Tags)
                .HasMaxLength(500)
                .HasColumnName("tags");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Artist)
                .WithMany(p => p.Products)
                .HasForeignKey(d => d.ArtistId)
                .HasConstraintName("FK__Products__artist__38996AB5");

            entity.HasOne(d => d.Category)
                .WithMany(p => p.Products)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK__Products__catego__398D8EEE");
        });

        modelBuilder.Entity<Reporting>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK__Reportin__60883D9088341A0C");

            entity.ToTable("Reporting");

            entity.HasIndex(e => new { e.ProductId, e.UserId }, "UQ__Reportin__AC999E84635EC82E").IsUnique();

            entity.Property(e => e.ReviewId).HasColumnName("review_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.IsApproved)
                .HasDefaultValue(false)
                .HasColumnName("is_approved");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Product)
                .WithMany(p => p.Reportings)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__Reporting__produ__66603565");

            entity.HasOne(d => d.User)
                .WithMany(p => p.Reportings)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reporting__user___6754599E");
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.SessionId).HasName("PK__Sessions__69B13FDCED5B06CA");

            entity.Property(e => e.SessionId)
                .HasMaxLength(255)
                .HasColumnName("session_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.ExpiresAt)
                .HasColumnType("datetime")
                .HasColumnName("expires_at");
            entity.Property(e => e.IpAddress)
                .HasMaxLength(45)
                .HasColumnName("ip_address");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.UserAgent)
                .HasMaxLength(500)
                .HasColumnName("user_agent");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User)
                .WithMany(p => p.Sessions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Sessions__user_i__5FB337D6");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__B9BE370F1D82176C");

            entity.HasIndex(e => e.Email, "UQ__Users__AB6E6164275C847B").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Address)
                .HasMaxLength(500)
                .HasColumnName("address");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.EmailVerified)
                .HasDefaultValue(false)
                .HasColumnName("email_verified");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LastLogin)
                .HasColumnType("datetime")
                .HasColumnName("last_login");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasColumnName("role");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.BankAccountNumber)
                .HasMaxLength(100)
                .HasColumnName("bank_account_number");

            entity.Property(e => e.BankName)
                .HasMaxLength(100)
                .HasColumnName("bank_name");

            entity.Property(e => e.MomoNumber)
                .HasMaxLength(20)
                .HasColumnName("momo_number");
            entity.Property(e => e.EmailOtp)
                .HasMaxLength(100)
                .HasColumnName("email_otp");
            entity.Property(e => e.EmailOtpExpiry)
                .HasMaxLength(100)
                .HasColumnName("email_otp_expiry");
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.CartId).HasName("PK__Carts__51BCD7B7A8B1C5D9");

            entity.ToTable("Carts");

            entity.Property(e => e.CartId)
                .ValueGeneratedOnAdd()
                .HasColumnName("cart_id");
            entity.Property(e => e.UserId)
                .HasColumnName("user_id");
            entity.Property(e => e.ProductId)
                .HasColumnName("product_id");
            entity.Property(e => e.AddedAt)
                .HasColumnType("datetime")
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("added_at");

            entity.HasOne(d => d.User)
                .WithMany(p => p.Carts)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.NoAction)
                .HasConstraintName("FK__Carts__user_id__4B7734EA");

            entity.HasOne(d => d.Product)
                .WithMany(p => p.Carts)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.NoAction)
                .HasConstraintName("FK__Carts__product_id__4C6B5933");

            entity.HasIndex(e => new { e.UserId, e.ProductId })
                .IsUnique()
                .HasDatabaseName("UQ_UserProduct");
        });

        modelBuilder.Entity<Wallet>(entity =>
        {
            entity.HasKey(e => e.WalletId).HasName("PK__Wallets__0EE6F0414E6896D2");

            entity.Property(e => e.WalletId).HasColumnName("wallet_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Balance)
                  .HasColumnType("decimal(18, 2)")
                  .HasDefaultValue(0)
                  .HasColumnName("balance");

            entity.HasIndex(e => e.UserId)
                  .IsUnique()
                  .HasDatabaseName("UQ__Wallets__B9BE370EFE45A351");

            entity.HasOne(d => d.User)
                  .WithOne(p => p.Wallet)
                  .HasForeignKey<Wallet>(d => d.UserId)
                  .OnDelete(DeleteBehavior.Cascade)
                  .HasConstraintName("FK__Wallets__user_id__2B0A656D");
        });

        modelBuilder.Entity<WalletTransaction>(entity =>
        {
            entity.HasKey(e => e.TransactionId).HasName("PK__WalletTr__85C600AF64BBD695");

            entity.Property(e => e.TransactionId).HasColumnName("transaction_id");
            entity.Property(e => e.WalletId).HasColumnName("wallet_id");
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)").HasColumnName("amount");
            entity.Property(e => e.TransactionType).HasMaxLength(20).HasColumnName("type"); // deposit/withdraw/purchase
            entity.Property(e => e.Description).HasMaxLength(500).HasColumnName("description");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("(getdate())").HasColumnName("created_at");

            entity.HasOne(d => d.Wallet)
                  .WithMany(p => p.Transactions)
                  .HasForeignKey(d => d.WalletId)
                  .OnDelete(DeleteBehavior.Cascade)
                  .HasConstraintName("FK__WalletTransactions__wallet_id");
        });

        modelBuilder.Entity<WithdrawRequest>(entity =>
        {
            entity.HasKey(e => e.RequestId).HasName("PK__Withdraw__18D3B90F1E0D8D75");

            entity.Property(e => e.RequestId).HasColumnName("request_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.AmountReceived).HasColumnType("decimal(18, 2)").HasColumnName("amount_received");
            entity.Property(e => e.AmountRequested).HasColumnType("decimal(18, 2)").HasColumnName("amount_requested");
            entity.Property(e => e.Status).HasMaxLength(20).HasColumnName("status"); // pending, approved, rejected
            entity.Property(e => e.RequestedAt).HasColumnType("datetime").HasDefaultValueSql("(getdate())").HasColumnName("requested_at");
            entity.Property(e => e.ProcessedAt).HasColumnType("datetime").HasColumnName("processed_at");

            entity.HasOne(d => d.User)
                  .WithMany(p => p.WithdrawRequests)
                  .HasForeignKey(d => d.UserId)
                  .OnDelete(DeleteBehavior.SetNull)
                  .HasConstraintName("FK__WithdrawR__artis__339FAB6E");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
