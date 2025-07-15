using IronPdf;
using System.Threading.Tasks;
using System;
using PicXAPI.Models;
using System.Globalization;

namespace PicXAPI.Services
{
    public class CertificateService
    {
        public async Task<byte[]> GenerateCertificateAsync(Products product, User artist, ArtistProfile? artistProfile, User buyer, Order order)
        {
            // Tạo HTML chứng chỉ với tông màu gradient đẹp
            var html = $@"
            <html>
            <head>
                <meta charset='utf-8'>
                <style>
                    body {{
                        font-family: 'Segoe UI', Arial, sans-serif;
                        background: linear-gradient(180deg, rgb(66,230,149) 0%, rgb(59,178,184) 100%);
                        color: #222;
                        padding: 0;
                        margin: 0;
                    }}
                    .container {{
                        background: #fff;
                        border-radius: 24px;
                        max-width: 600px;
                        margin: 40px auto;
                        box-shadow: 0 8px 32px rgba(59,178,184,0.15);
                        padding: 48px 32px;
                        border: 4px solid rgb(66,230,149);
                    }}
                    .title {{
                        font-size: 2.2rem;
                        font-weight: bold;
                        background: linear-gradient(90deg, rgb(66,230,149), rgb(59,178,184));
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin-bottom: 24px;
                        text-align: center;
                    }}
                    .section {{
                        margin-bottom: 18px;
                    }}
                    .label {{
                        font-weight: 600;
                        color: #3bb2b8;
                    }}
                    .footer {{
                        margin-top: 32px;
                        text-align: right;
                        color: #888;
                        font-size: 0.95rem;
                    }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='title'>Certificate of Authenticity</div>
                    <div class='section'>
                        This document certifies the authenticity and copyright of the following artwork purchased on <b>{order.OrderDate?.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture) ?? "N/A"}</b>.
                    </div>
                    <div class='section'>
                        <span class='label'>Artwork:</span> <b>{product.Title}</b><br/>
                        <span class='label'>Description:</span> {product.Description ?? "-"}<br/>
                        <span class='label'>Dimensions:</span> {product.Dimensions ?? "-"}<br/>
                        <span class='label'>Tags:</span> {product.Tags ?? "-"}<br/>
                        <span class='label'>Price:</span> ${product.Price:F2}
                    </div>
                    <div class='section'>
                        <span class='label'>Artist:</span> <b>{artist.Name}</b><br/>
                        <span class='label'>Bio:</span> {artistProfile?.Bio ?? "-"}<br/>
                        <span class='label'>Specialization:</span> {artistProfile?.Specialization ?? "-"}<br/>
                        <span class='label'>Experience:</span> {artistProfile?.ExperienceYears?.ToString() ?? "-"} years<br/>
                        <span class='label'>Contact:</span> {artist.Email} {(!string.IsNullOrEmpty(artistProfile?.WebsiteUrl) ? "| Website: " + artistProfile.WebsiteUrl : "")}
                    </div>
                    <div class='section'>
                        <span class='label'>Buyer:</span> <b>{buyer.Name}</b><br/>
                        <span class='label'>Email:</span> {buyer.Email}
                    </div>
                    <div class='footer'>
                        &copy; {DateTime.Now.Year} PicX. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            ";

            var Renderer = new HtmlToPdf();
            var pdf = Renderer.RenderHtmlAsPdf(html);
            return pdf.BinaryData;
        }
    }
} 