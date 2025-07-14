namespace PicXAPI.DTOs
{
    public class ProfileDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string Role { get; set; } = "buyer";

        public string? BankName { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? MomoNumber { get; set; }
    }

}
