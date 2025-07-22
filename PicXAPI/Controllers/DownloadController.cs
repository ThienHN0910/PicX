using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Processing;
using System.IO;
using System.Threading.Tasks;
using PicXAPI.Services;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/download")]
    public class DownloadController : ControllerBase
    {
        private readonly S3Service _s3Service;
        private readonly ILogger<DownloadController> _logger;

        public DownloadController(S3Service s3Service, ILogger<DownloadController> logger)
        {
            _s3Service = s3Service;
            _logger = logger;
        }

        [HttpGet("image/{fileKey}")]
        public async Task<IActionResult> DownloadImage(string fileKey)
        {
            try
            {
                var stream = await _s3Service.GetFileAsync(fileKey);
                stream.Position = 0;

                try
                {
                    using var image = await Image.LoadAsync(stream);
                    var pngStream = new MemoryStream();
                    await image.SaveAsPngAsync(pngStream);
                    pngStream.Position = 0;
                    var fileName = Path.GetFileNameWithoutExtension(fileKey) + ".png";
                    Response.Headers["Cache-Control"] = "public,max-age=86400";
                    return File(pngStream, "image/png", fileName);
                }
                catch (SixLabors.ImageSharp.UnknownImageFormatException ex)
                {
                    _logger.LogError(ex, $"File with key {fileKey} is not a valid image or format not supported.");
                    return BadRequest(new { error = "File is not a valid image or format not supported.", fileKey });
                }
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"Failed to download image with key: {fileKey}");
                return StatusCode(500, new { error = $"Failed to download image: {ex.Message}", fileKey });
            }
        }

        [HttpGet("file/{fileKey}")]
        public async Task<IActionResult> DownloadAnyFile(string fileKey)
        {
            try
            {
                var stream = await _s3Service.GetFileAsync(fileKey);
                stream.Position = 0;
                var contentType = "application/octet-stream";
                var fileName = Path.GetFileName(fileKey);
                Response.Headers["Cache-Control"] = "public,max-age=86400";
                return File(stream, contentType, fileName);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"Failed to download file with key: {fileKey}");
                return StatusCode(500, new { error = $"Failed to download file: {ex.Message}", fileKey });
            }
        }
    }
}
