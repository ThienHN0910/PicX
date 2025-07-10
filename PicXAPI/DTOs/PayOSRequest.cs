namespace PicXAPI.DTOs
{
    public class PayOSRequest
    {
        public string OrderCode { get; set; }
        public long Amount { get; set; } // VND
        public string Description { get; set; }
        public string ReturnUrl { get; set; }
        public string CancelUrl { get; set; }
    }

}
