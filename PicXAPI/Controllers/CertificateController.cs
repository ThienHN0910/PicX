using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.Models;
using PicXAPI.Services;
using System.Threading.Tasks;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/certificate")]
    public class CertificateController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CertificateService _certificateService;

        public CertificateController(AppDbContext context, CertificateService certificateService)
        {
            _context = context;
            _certificateService = certificateService;
        }

        /// <summary>
        /// Tải chứng chỉ bản quyền PDF cho sản phẩm đã mua (theo OrderDetailId)
        /// </summary>
        [HttpGet("download/{orderDetailId}")]
        public async Task<IActionResult> DownloadCertificate(int orderDetailId)
        {
            // Lấy OrderDetail, Product, Artist, ArtistProfile, Buyer, Order
            var orderDetail = await _context.OrderDetails
                .Include(od => od.Product)
                    .ThenInclude(p => p.Artist)
                        .ThenInclude(a => a.ArtistProfile)
                .Include(od => od.Order)
                    .ThenInclude(o => o.Buyer)
                .FirstOrDefaultAsync(od => od.OrderDetailId == orderDetailId);

            if (orderDetail == null)
                return NotFound(new { message = "Order detail not found" });

            var product = orderDetail.Product;
            var artist = product.Artist;
            var artistProfile = artist.ArtistProfile;
            var buyer = orderDetail.Order.Buyer;
            var order = orderDetail.Order;

            var pdfBytes = await _certificateService.GenerateCertificateAsync(product, artist, artistProfile, buyer, order);
            var fileName = $"Certificate_{product.Title.Replace(" ", "_")}_{order.OrderId}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }
    }
} 