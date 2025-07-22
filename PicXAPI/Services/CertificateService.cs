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
            // Modern, premium palette: deep blue, gold, white, subtle gray
            // Add watermark logo, elegant image frame, improved layout
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
                        font-family: 'Georgia', 'Times New Roman', serif;
                        background: #f4f6fa;
                        color: #1a2340;
                        margin: 0;
                        padding: 0;
                        height: 100%;
                        position: relative;
                    }}
                    .certificate-container {{
                        width: 800px;
                        margin: 40px auto;
                        background: #fff;
                        border-radius: 18px;
                        box-shadow: 0 8px 32px rgba(26,35,64,0.18);
                        border: 6px solid #1a2340;
                        position: relative;
                        overflow: hidden;
                        padding: 0;
                    }}
                    .certificate-border {{
                        border: 3px solid #e5b200;
                        border-radius: 12px;
                        margin: 32px;
                        padding: 32px 40px 40px 40px;
                        background: rgba(255,255,255,0.98);
                        position: relative;
                        box-shadow: 0 2px 8px rgba(26,35,64,0.06);
                    }}
                    .watermark {{
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        opacity: 0.08;
                        z-index: 0;
                        width: 400px;
                        height: 400px;
                        background: url('https://i.imgur.com/0y0y0y0.png') no-repeat center center;
                        background-size: contain;
                        pointer-events: none;
                    }}
                    .certificate-number {{
                        position: absolute;
                        top: 24px;
                        right: 40px;
                        font-size: 1rem;
                        color: #e5b200;
                        font-weight: bold;
                        letter-spacing: 1px;
                        z-index: 2;
                        background: #fff;
                        padding: 4px 12px;
                        border-radius: 8px;
                        box-shadow: 0 1px 4px rgba(26,35,64,0.04);
                    }}
                    .header {{
                        text-align: center;
                        margin-bottom: 24px;
                        position: relative;
                        z-index: 2;
                    }}
                    .logo {{
                        font-size: 2.5rem;
                        font-weight: bold;
                        color: #1a2340;
                        letter-spacing: 3px;
                        margin-bottom: 6px;
                        text-shadow: 0 2px 8px #e5b20033;
                    }}
                    .certificate-title {{
                        font-size: 2.6rem;
                        font-weight: bold;
                        color: #e5b200;
                        margin: 18px 0 10px 0;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        text-shadow: 1px 1px 2px #1a234033;
                    }}
                    .subtitle {{
                        font-size: 1.2rem;
                        color: #1a2340;
                        font-style: italic;
                        margin-bottom: 18px;
                    }}
                    .decorative-line {{
                        width: 180px;
                        height: 3px;
                        background: linear-gradient(90deg, #1a2340, #e5b200);
                        margin: 12px auto 0 auto;
                        border-radius: 2px;
                    }}
                    .main-content {{
                        text-align: center;
                        margin: 28px 0 0 0;
                        z-index: 2;
                        position: relative;
                    }}
                    .certifies-text {{
                        font-size: 1.1rem;
                        margin-bottom: 18px;
                        color: #1a2340;
                        font-style: italic;
                    }}
                    .artwork-image-frame {{
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: linear-gradient(135deg, #e5b20022 0%, #1a234011 100%);
                        border: 2px solid #e5b200;
                        border-radius: 12px;
                        padding: 18px;
                        margin: 0 auto 18px auto;
                        width: 340px;
                        height: 340px;
                        box-shadow: 0 2px 12px #1a234022;
                    }}
                    .artwork-image-frame img {{
                        max-width: 100%;
                        max-height: 300px;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px #1a234033;
                        background: #fff;
                    }}
                    .artwork-info, .artist-section, .buyer-section {{
                        background: #f8f9fa;
                        border: 1.5px solid #e5b20055;
                        border-radius: 10px;
                        padding: 18px 22px;
                        margin: 18px 0;
                        text-align: left;
                        word-wrap: break-word;
                        box-shadow: 0 1px 4px #1a234011;
                    }}
                    .artwork-title {{
                        font-size: 1.5rem;
                        font-weight: bold;
                        color: #1a2340;
                        margin-bottom: 10px;
                        text-align: center;
                        text-decoration: underline;
                    }}
                    .info-row {{
                        margin-bottom: 10px;
                        display: flex;
                        align-items: flex-start;
                        gap: 10px;
                    }}
                    .info-label {{
                        font-weight: bold;
                        color: #1a2340;
                        min-width: 130px;
                        margin-right: 5px;
                        white-space: nowrap;
                    }}
                    .info-value {{
                        color: #2c3e50;
                        font-weight: 500;
                    }}
                    .artist-section {{
                        border-left: 4px solid #1a2340;
                    }}
                    .buyer-section {{
                        border-left: 4px solid #e5b200;
                    }}
                    .section-title {{
                        font-size: 1.1rem;
                        font-weight: bold;
                        color: #1a2340;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }}
                    .signatures {{
                        display: flex;
                        justify-content: space-between;
                        margin-top: 36px;
                        text-align: center;
                        z-index: 2;
                    }}
                    .signature-box {{
                        width: 180px;
                    }}
                    .signature-line {{
                        border-bottom: 2.5px solid #1a2340;
                        height: 36px;
                        margin-bottom: 7px;
                    }}
                    .signature-label {{
                        font-size: 0.9rem;
                        color: #7f8c8d;
                        font-weight: bold;
                    }}
                    .date-issued {{
                        text-align: center;
                        margin-top: 18px;
                        font-size: 1.1rem;
                        color: #1a2340;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 28px;
                        font-size: 0.9rem;
                        color: #7f8c8d;
                        border-top: 1px solid #e9ecef;
                        padding-top: 12px;
                    }}
                    .seal {{
                        position: absolute;
                        bottom: 48px;
                        right: 48px;
                        width: 80px;
                        height: 80px;
                        border: 3px solid #e5b200;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(229, 178, 0, 0.08);
                        font-size: 1rem;
                        font-weight: bold;
                        color: #e5b200;
                        text-align: center;
                        line-height: 1.1;
                        box-shadow: 0 2px 8px #1a234022;
                        z-index: 2;
                    }}
                    .attribution-notice {{
                        margin-top: 24px;
                        font-size: 1rem;
                        color: #1a2340;
                        background: #f8f9fa;
                        border: 1px solid #e9ecef;
                        border-radius: 8px;
                        padding: 18px;
                        text-align: left;
                        line-height: 1.5;
                    }}
                </style>
            </head>
            <body>
                <div class='certificate-container'>
                    <div class='watermark'></div>
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
                            <div class='artwork-image-frame'>
                                <img src='/api/product/image/{product.ImageDriveId}' alt='Artwork Image'/>
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