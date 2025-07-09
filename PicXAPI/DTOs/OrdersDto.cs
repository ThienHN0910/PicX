using System.Text.Json.Serialization;
using PicXAPI.Models;

namespace PicXAPI.DTOs
{
    public class GetOrderDto
    {
        public int OrderId { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime? OrderDate { get; set; }
        public string BuyerName { get; set; } = string.Empty;
        public List<GetOrderDetailDto> Items { get; set; } = new();
        public User Buyer { get; set; }
    }


    public class GetOrderDetailDto
    {
        public int ProductId { get; set; }

        public string ProductTitle { get; set; } = string.Empty;

        public string? ImageUrl { get; set; } = string.Empty;

        public decimal TotalPrice { get; set; }

        public string ArtistName { get; set; } = string.Empty;
    }

    public class CreateOrderDto
    {
        public List<CreateOrderDetailDto> Items { get; set; } = new();
    }

    public class CreateOrderDetailDto
    {
        public int ProductId { get; set; }
        public double TotalPrice { get; set; }
    }

}
