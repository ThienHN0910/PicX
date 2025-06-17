using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PicXAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddResetTokenToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    category_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    parent_category_id = table.Column<int>(type: "int", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Categori__D54EE9B4B4AB38BB", x => x.category_id);
                    table.ForeignKey(
                        name: "FK__Categorie__paren__31EC6D26",
                        column: x => x.parent_category_id,
                        principalTable: "Categories",
                        principalColumn: "category_id");
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    email_verified = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    last_login = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    ResetToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResetTokenExpiry = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__B9BE370F1D82176C", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "ArtistProfiles",
                columns: table => new
                {
                    artist_id = table.Column<int>(type: "int", nullable: false),
                    bio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    profile_picture = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    specialization = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    experience_years = table.Column<int>(type: "int", nullable: true),
                    website_url = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    social_media_links = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ArtistPr__6CD0400102775B1B", x => x.artist_id);
                    table.ForeignKey(
                        name: "FK__ArtistPro__artis__2E1BDC42",
                        column: x => x.artist_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Chats",
                columns: table => new
                {
                    chat_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    sender_id = table.Column<int>(type: "int", nullable: false),
                    receiver_id = table.Column<int>(type: "int", nullable: false),
                    message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_read = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    sent_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Chats__FD040B178BAD7184", x => x.chat_id);
                    table.ForeignKey(
                        name: "FK__Chats__receiver___5AEE82B9",
                        column: x => x.receiver_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Chats__sender_id__59FA5E80",
                        column: x => x.sender_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "FinancialReports",
                columns: table => new
                {
                    report_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    artist_id = table.Column<int>(type: "int", nullable: true),
                    period_start = table.Column<DateOnly>(type: "date", nullable: false),
                    period_end = table.Column<DateOnly>(type: "date", nullable: false),
                    total_sales = table.Column<decimal>(type: "decimal(12,2)", nullable: true, defaultValue: 0m),
                    total_commission = table.Column<decimal>(type: "decimal(12,2)", nullable: true, defaultValue: 0m),
                    net_earnings = table.Column<decimal>(type: "decimal(12,2)", nullable: true, defaultValue: 0m),
                    commission_rate = table.Column<decimal>(type: "decimal(5,2)", nullable: true, defaultValue: 10.00m),
                    generated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Financia__779B7C58184CDE44", x => x.report_id);
                    table.ForeignKey(
                        name: "FK__Financial__artis__73BA3083",
                        column: x => x.artist_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    notification_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    entity_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    entity_id = table.Column<int>(type: "int", nullable: true),
                    is_read = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Notifica__E059842F831D78D5", x => x.notification_id);
                    table.ForeignKey(
                        name: "FK__Notificat__user___6C190EBB",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    order_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    buyer_id = table.Column<int>(type: "int", nullable: false),
                    total_amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    order_date = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Orders__465962298B6B6AC2", x => x.order_id);
                    table.ForeignKey(
                        name: "FK__Orders__buyer_id__3D5E1FD2",
                        column: x => x.buyer_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    product_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    artist_id = table.Column<int>(type: "int", nullable: false),
                    category_id = table.Column<int>(type: "int", nullable: true),
                    title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    image_url = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    additional_images = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    dimensions = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    is_available = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    tags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    like_count = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Products__47027DF59C2B42B3", x => x.product_id);
                    table.ForeignKey(
                        name: "FK__Products__artist__38996AB5",
                        column: x => x.artist_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__Products__catego__398D8EEE",
                        column: x => x.category_id,
                        principalTable: "Categories",
                        principalColumn: "category_id");
                });

            migrationBuilder.CreateTable(
                name: "Sessions",
                columns: table => new
                {
                    session_id = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    ip_address = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    expires_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Sessions__69B13FDCED5B06CA", x => x.session_id);
                    table.ForeignKey(
                        name: "FK__Sessions__user_i__5FB337D6",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    payment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_id = table.Column<int>(type: "int", nullable: false),
                    payment_method = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    payment_provider = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    transaction_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    payment_date = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true, defaultValue: "VND"),
                    payment_details = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Payments__ED1FC9EAAB7E9FAB", x => x.payment_id);
                    table.ForeignKey(
                        name: "FK__Payments__order___45F365D3",
                        column: x => x.order_id,
                        principalTable: "Orders",
                        principalColumn: "order_id");
                });

            migrationBuilder.CreateTable(
                name: "Carts",
                columns: table => new
                {
                    cart_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    product_id = table.Column<int>(type: "int", nullable: false),
                    added_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Carts__51BCD7B7A8B1C5D9", x => x.cart_id);
                    table.ForeignKey(
                        name: "FK__Carts__product_id__4C6B5933",
                        column: x => x.product_id,
                        principalTable: "Products",
                        principalColumn: "product_id");
                    table.ForeignKey(
                        name: "FK__Carts__user_id__4B7734EA",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Comments",
                columns: table => new
                {
                    comment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    product_id = table.Column<int>(type: "int", nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Comments__E79576879A88D365", x => x.comment_id);
                    table.ForeignKey(
                        name: "FK__Comments__produc__4AB81AF0",
                        column: x => x.product_id,
                        principalTable: "Products",
                        principalColumn: "product_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__Comments__user_i__49C3F6B7",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Favorites",
                columns: table => new
                {
                    favorite_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    product_id = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Favorite__46ACF4CB05875304", x => x.favorite_id);
                    table.ForeignKey(
                        name: "FK__Favorites__produ__5535A963",
                        column: x => x.product_id,
                        principalTable: "Products",
                        principalColumn: "product_id");
                    table.ForeignKey(
                        name: "FK__Favorites__user___5441852A",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderDetails",
                columns: table => new
                {
                    order_detail_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_id = table.Column<int>(type: "int", nullable: false),
                    product_id = table.Column<int>(type: "int", nullable: false),
                    total_price = table.Column<decimal>(type: "decimal(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OrderDet__3C5A4080B28191D1", x => x.order_detail_id);
                    table.ForeignKey(
                        name: "FK__OrderDeta__order__403A8C7D",
                        column: x => x.order_id,
                        principalTable: "Orders",
                        principalColumn: "order_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__OrderDeta__produ__412EB0B6",
                        column: x => x.product_id,
                        principalTable: "Products",
                        principalColumn: "product_id");
                });

            migrationBuilder.CreateTable(
                name: "Reporting",
                columns: table => new
                {
                    review_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    product_id = table.Column<int>(type: "int", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_approved = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Reportin__60883D9088341A0C", x => x.review_id);
                    table.ForeignKey(
                        name: "FK__Reporting__produ__66603565",
                        column: x => x.product_id,
                        principalTable: "Products",
                        principalColumn: "product_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__Reporting__user___6754599E",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "CommentReplies",
                columns: table => new
                {
                    reply_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    comment_id = table.Column<int>(type: "int", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__CommentR__EE405698C9D8E9B2", x => x.reply_id);
                    table.ForeignKey(
                        name: "FK__CommentRe__comme__4E88ABD4",
                        column: x => x.comment_id,
                        principalTable: "Comments",
                        principalColumn: "comment_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__CommentRe__user___4F7CD00D",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Carts_product_id",
                table: "Carts",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "UQ_UserProduct",
                table: "Carts",
                columns: new[] { "user_id", "product_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_parent_category_id",
                table: "Categories",
                column: "parent_category_id");

            migrationBuilder.CreateIndex(
                name: "IX_Chats_receiver_id",
                table: "Chats",
                column: "receiver_id");

            migrationBuilder.CreateIndex(
                name: "IX_Chats_sender_id",
                table: "Chats",
                column: "sender_id");

            migrationBuilder.CreateIndex(
                name: "IX_CommentReplies_comment_id",
                table: "CommentReplies",
                column: "comment_id");

            migrationBuilder.CreateIndex(
                name: "IX_CommentReplies_user_id",
                table: "CommentReplies",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_product_id",
                table: "Comments",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_user_id",
                table: "Comments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_product_id",
                table: "Favorites",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Favorite__FDCE10D167584305",
                table: "Favorites",
                columns: new[] { "user_id", "product_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FinancialReports_artist_id",
                table: "FinancialReports",
                column: "artist_id");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_user_id",
                table: "Notifications",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_order_id",
                table: "OrderDetails",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_product_id",
                table: "OrderDetails",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_buyer_id",
                table: "Orders",
                column: "buyer_id");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_order_id",
                table: "Payments",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_Products_artist_id",
                table: "Products",
                column: "artist_id");

            migrationBuilder.CreateIndex(
                name: "IX_Products_category_id",
                table: "Products",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_Reporting_user_id",
                table: "Reporting",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Reportin__AC999E84635EC82E",
                table: "Reporting",
                columns: new[] { "product_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_user_id",
                table: "Sessions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Users__AB6E6164275C847B",
                table: "Users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ArtistProfiles");

            migrationBuilder.DropTable(
                name: "Carts");

            migrationBuilder.DropTable(
                name: "Chats");

            migrationBuilder.DropTable(
                name: "CommentReplies");

            migrationBuilder.DropTable(
                name: "Favorites");

            migrationBuilder.DropTable(
                name: "FinancialReports");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "OrderDetails");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Reporting");

            migrationBuilder.DropTable(
                name: "Sessions");

            migrationBuilder.DropTable(
                name: "Comments");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
