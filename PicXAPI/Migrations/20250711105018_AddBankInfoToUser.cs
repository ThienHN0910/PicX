using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PicXAPI.Migrations
{
    public partial class AddBankInfoToUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "bank_account_number",
                table: "Users",
                type: "nvarchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "bank_name",
                table: "Users",
                type: "nvarchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "momo_number",
                table: "Users",
                type: "nvarchar(100)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "bank_account_number",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "bank_name",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "momo_number",
                table: "Users");
        }
    }
}
