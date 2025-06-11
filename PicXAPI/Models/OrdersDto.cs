namespace PicXAPI.Dtos
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime? OrderDate { get; set; }
        public List<OrderDetailDto> Details { get; set; } = new();
    }

    public class OrderDetailDto
    {
        public string ProductTitle { get; set; } = string.Empty;
        public string? ImageUrl { get; set; } = string.Empty;

        // Artist info (nested directly or simplified)
        public string ArtistName { get; set; } = string.Empty;


    }
}
