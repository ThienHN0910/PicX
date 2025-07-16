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
            // Tạo HTML chứng chỉ với thiết kế chuyên nghiệp giống thực tế
            var html = $@"
            <html>
            <head>
                <meta charset='utf-8'>
                <style>
                    @page {{
                        size: A4;
                        margin: 0;
                    }}
                    body {{
                        font-family: 'Times New Roman', serif;
                        background: #ffffff;
                        color: #2c3e50;
                        margin: 0;
                        padding: 20px;
                        line-height: 1.2;
                        height: 100%;
                    }}
                    .certificate-border {{
                        border: 8px solid #1a5490;
                        padding: 20px;
                        position: relative;
                        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                        box-sizing: border-box;
                        height: 100%;
                        page-break-inside: avoid;
                    }}
                    .certificate-border::before {{
                        content: '';
                        position: absolute;
                        top: 15px;
                        left: 15px;
                        right: 15px;
                        bottom: 15px;
                        border: 2px solid #c0392b;
                        border-radius: 0;
                    }}
                    .header {{
                        text-align: center;
                        margin-bottom: 20px;
                        position: relative;
                    }}
                    .logo {{
                        font-size: 2rem;
                        font-weight: bold;
                        color: #1a5490;
                        margin-bottom: 5px;
                        letter-spacing: 2px;
                    }}
                    .certificate-title {{
                        font-size: 2.2rem;
                        font-weight: bold;
                        color: #c0392b;
                        margin: 15px 0 10px 0;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                    }}
                    .subtitle {{
                        font-size: 1.2rem;
                        color: #34495e;
                        font-style: italic;
                        margin-bottom: 15px;
                    }}
                    .decorative-line {{
                        width: 150px;
                        height: 2px;
                        background: linear-gradient(90deg, #1a5490, #c0392b);
                        margin: 10px auto;
                    }}
                    .main-content {{
                        text-align: center;
                        margin: 20px 0;
                    }}
                    .certifies-text {{
                        font-size: 1rem;
                        margin-bottom: 15px;
                        color: #2c3e50;
                    }}
                    .artwork-info, .artist-section, .buyer-section {{
                        background: #f8f9fa;
                        border: 2px solid #e9ecef;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 15px 0;
                        text-align: left;
                        word-wrap: break-word; /* Ensure text wraps properly */
                    }}
                    .artwork-title {{
                        font-size: 1.5rem;
                        font-weight: bold;
                        color: #1a5490;
                        margin-bottom: 10px;
                        text-align: center;
                        text-decoration: underline;
                    }}
                    .info-row {{
                        margin-bottom: 8px;
                        display: flex;
                        align-items: flex-start;
                        gap: 10px; /* Thêm */
                    }}
                    .info-label {{
                        font-weight: bold;
                        color: #2c3e50;
                        min-width: 130px; /* Tăng từ 100px */
                        margin-right: 5px;
                        white-space: nowrap;
                    }}
                    .info-value {{
                        font-weight: bold;
                        color: #2c3e50;
                        min-width: 130px; /* Tăng từ 100px */
                        margin-right: 5px;
                        white-space: nowrap;
                    }}
                    .artist-section {{
                        border-left: 4px solid #1a5490;
                    }}
                    .buyer-section {{
                        border-left: 4px solid #c0392b;
                    }}
                    .section-title {{
                        font-size: 1.1rem;
                        font-weight: bold;
                        color: #2c3e50;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }}
                    .signatures {{
                        display: flex;
                        justify-content: space-between;
                        margin-top: 30px;
                        text-align: center;
                    }}
                    .signature-box {{
                        width: 150px;
                    }}
                    .signature-line {{
                        border-bottom: 2px solid #2c3e50;
                        height: 30px;
                        margin-bottom: 5px;
                    }}
                    .signature-label {{
                        font-size: 0.8rem;
                        color: #7f8c8d;
                        font-weight: bold;
                    }}
                    .certificate-number {{
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        font-size: 0.8rem;
                        color: #7f8c8d;
                    }}
                    .date-issued {{
                        text-align: center;
                        margin-top: 15px;
                        font-size: 1rem;
                        color: #2c3e50;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 20px;
                        font-size: 0.8rem;
                        color: #7f8c8d;
                        border-top: 1px solid #e9ecef;
                        padding-top: 10px;
                    }}
                    .seal {{
                        position: absolute;
                        bottom: 40px;
                        right: 40px;
                        width: 60px;
                        height: 60px;
                        border: 2px solid #c0392b;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(192, 57, 43, 0.1);
                        font-size: 0.7rem;
                        font-weight: bold;
                        color: #c0392b;
                        text-align: center;
                        line-height: 1.1;
                    }}
                    .attribution-notice {{
                        margin-top: 20px;
                        font-size: 0.9rem;
                        color: #2c3e50;
                        background: #f8f9fa;
                        border: 1px solid #e9ecef;
                        border-radius: 8px;
                        padding: 15px;
                        text-align: left;
                        line-height: 1.5;
                    }}
                </style>
            </head>
            <body>
                <div class='certificate-border'>
                    <div class='certificate-number'>
                        Certificate No: PXC-{order.OrderId:D6}
                    </div>
                    
                    <div class='header'>
                        <div class='logo'>PicX</div>
                        <div class='certificate-title'>Certificate of Authenticity</div>
                        <div class='subtitle'>Digital Art Authentication</div>
                        <div class='decorative-line'></div>
                    </div>

                    <div class='main-content'>
                        <div class='certifies-text'>
                            This certificate hereby authenticates and verifies the ownership and authenticity of the following digital artwork:
                        </div>
                        <div class='artwork-info'>
                            <img src='{product.ImageDriveId}' alt='Artwork Image' style='max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px;'/>
                        </div>
                        <div class='artwork-info'>
                            <div class='artwork-title'>{product.Title}</div>
                            
                            <div class='info-row'>
                                <div class='info-label'>Description:</div>
                                <div class='info-value'>{product.Description ?? "Original digital artwork"}</div>
                            </div>
                            
                            <div class='info-row'>
                                <div class='info-label'>Dimensions:</div>
                                <div class='info-value'>{product.Dimensions ?? "Digital format"}</div>
                            </div>
                            
                            <div class='info-row'>
                                <div class='info-label'>Tags:</div>
                                <div class='info-value'>{product.Tags ?? "Digital art"}</div>
                            </div>
                            
                            <div class='info-row'>
                                <div class='info-label'>Purchase Price:</div>
                                <div class='info-value'>{product.Price},000 VND</div>
                            </div>
                        </div>

                        <div class='artist-section'>
                            <div class='section-title'>Artist Information</div>
                            <div class='info-row'>
                                <div class='info-label'>Artist Name:</div>
                                <div class='info-value'>{artist.Name}</div>
                            </div>
                            <div class='info-row'>
                                <div class='info-label'>Biography:</div>
                                <div class='info-value'>{artistProfile?.Bio ?? "Professional digital artist"}</div>
                            </div>
                            <div class='info-row'>
                                <div class='info-label'>Specialization:</div>
                                <div class='info-value'>{artistProfile?.Specialization ?? "Digital Art"}</div>
                            </div>
                            <div class='info-row'>
                                <div class='info-label'>Experience:</div>
                                <div class='info-value'>{artistProfile?.ExperienceYears?.ToString() ?? "Professional"} years</div>
                            </div>
                            <div class='info-row'>
                                <div class='info-label'>Contact:</div>
                                <div class='info-value'>{artist.Email}{(!string.IsNullOrEmpty(artistProfile?.WebsiteUrl) ? " | " + artistProfile.WebsiteUrl : "")}</div>
                            </div>
                        </div>

                        <div class='buyer-section'>
                            <div class='section-title'>Certified Owner</div>
                            <div class='info-row'>
                                <div class='info-label'>Owner Name:</div>
                                <div class='info-value'>{buyer.Name}</div>
                            </div>
                            <div class='info-row'>
                                <div class='info-label'>Email:</div>
                                <div class='info-value'>{buyer.Email}</div>
                            </div>
                        </div>

                        <div class='date-issued'>
                            <strong>Date of Purchase:</strong> {order.OrderDate?.ToString("MMMM dd, yyyy", CultureInfo.InvariantCulture) ?? DateTime.Now.ToString("MMMM dd, yyyy")}
                        </div>

                        <div class='signatures'>
                            <div class='signature-box'>
                                <div class='signature-line'></div>
                                <div class='signature-label'>ARTIST SIGNATURE</div>
                            </div>
                            <div class='signature-box'>
                                <div class='signature-line'></div>
                                <div class='signature-label'>PLATFORM AUTHORIZED</div>
                            </div>
                        </div>
                    </div>

                    <div class='seal'>
                        OFFICIAL<br/>SEAL<br/>PicX
                    </div>

                    <div class='footer'>
                        This certificate is issued by PicX Platform and serves as proof of authenticity and ownership.<br/>
                        For verification, please contact support@picx.com with certificate number PXC-{order.OrderId:D6}<br/>
                        © {DateTime.Now.Year} PicX. All rights reserved.
                    </div>
                    <div class='attribution-notice'>
                        <strong>PicX Certificate of Authenticity – Usage and Attribution Notice</strong><br/>
                        This certificate verifies the authenticity and ownership of the digital artwork listed above. The artwork is protected by copyright and is not classified as free or public domain art.<br/>
                        <br/>
                        <strong>How to attribute PicX certificates:</strong>
                        <br/>
                        For web usage: Please include the following notice on your website or digital platform to acknowledge the certificate and its issuer:
                        <br/>
                        For non-web usage: If possible, the text 'Certificate issued by PicX' must be displayed next to the certificate. If this is not possible, the attribution should be included in the credits or acknowledgements section.
                        <strong>Where you can use this certificate:</strong><br/>
                        Websites and digital platforms<br/>
                        Software, applications, and mobile apps<br/>
                        Printed and digital media (magazines, newspapers, books, cards, labels, CD, DVD, films, television, video, email)<br/>
                        Advertising and promotional materials<br/>
                        Product presentations and public events<br/>
                        Multimedia and presentations<br/>
                        Decorative purposes (private or public)<br/>
                        <br/>
                        <strong>What you CAN DO:</strong><br/>
                        You have the non-exclusive, non-transferable, non-sublicensable right to use this certificate as proof of ownership and authenticity for the associated artwork, in any and all media for commercial or personal purposes as listed above.<br/>
                        You may display, print, and share this certificate as evidence of your rights to the artwork.<br/>
                        You may use this certificate worldwide for the duration of your ownership.<br/>
                        <br/>
                        <strong>What you CANNOT DO:</strong><br/>
                        You may not sublicense, sell, or rent this certificate or the associated artwork.<br/>
                        You may not distribute the certificate or artwork except as proof of ownership or as expressly authorized by PicX.<br/>
                        You may not offer the certificate or artwork for download or as a free asset.<br/>
                    </div>
                </div>
            </body>
            </html>
            ";

            var Renderer = new HtmlToPdf();

            // Cấu hình để tạo PDF chất lượng cao
            Renderer.PrintOptions.PaperSize = PdfPrintOptions.PdfPaperSize.A4;
            Renderer.PrintOptions.MarginTop = 0;
            Renderer.PrintOptions.MarginBottom = 0;
            Renderer.PrintOptions.MarginLeft = 0;
            Renderer.PrintOptions.MarginRight = 0;
            Renderer.PrintOptions.EnableJavaScript = true;
            Renderer.PrintOptions.RenderDelay = 500;
            Renderer.PrintOptions.CssMediaType = PdfPrintOptions.PdfCssMediaType.Print;

            var pdf = Renderer.RenderHtmlAsPdf(html);
            return pdf.BinaryData;
        }
    }
}