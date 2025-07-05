using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Threading.Tasks;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Png;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/download")]
    public class DownloadController : ControllerBase
    {
        private readonly DriveService _driveService;
        private readonly ILogger<DownloadController> _logger;

        public DownloadController(DriveService driveService, ILogger<DownloadController> logger)
        {
            _driveService = driveService;
            _logger = logger;
        }

        [HttpGet("image/{fileId}")]
        public async Task<IActionResult> DownloadImage(string fileId)
        {
            try
            {
                var request = _driveService.Files.Get(fileId);
                request.Fields = "name,mimeType";
                var file = await request.ExecuteAsync();

                if (file == null)
                {
                    _logger.LogWarning($"File with ID {fileId} not found on Google Drive.");
                    return NotFound(new { error = "File not found on Google Drive.", fileId });
                }

                var imageStream = new MemoryStream();
                await _driveService.Files.Get(fileId).DownloadAsync(imageStream);
                imageStream.Position = 0;

                if (file.MimeType == null || !file.MimeType.StartsWith("image/"))
                {
                    _logger.LogWarning($"File with ID {fileId} is not an image. MIME type: {file.MimeType}");
                    return BadRequest(new { error = "File is not an image.", fileId, mimeType = file.MimeType });
                }

                try
                {
                    using (var image = await Image.LoadAsync(imageStream))
                    {
                        var pngStream = new MemoryStream();
                        await image.SaveAsPngAsync(pngStream);
                        pngStream.Position = 0;
                        var fileName = (file.Name != null ? System.IO.Path.GetFileNameWithoutExtension(file.Name) : "downloaded_image") + ".png";
                        Response.Headers["Cache-Control"] = "public,max-age=86400";
                        return File(pngStream, "image/png", fileName);
                    }
                }
                catch (SixLabors.ImageSharp.UnknownImageFormatException ex)
                {
                    _logger.LogError(ex, $"File with ID {fileId} is not a valid image or format not supported.");
                    return BadRequest(new { error = "File is not a valid image or format not supported.", fileId, fileName = file.Name });
                }
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"Failed to download image with ID: {fileId}");
                return StatusCode(500, new { error = $"Failed to download image: {ex.Message}", fileId });
            }
        }

        [HttpGet("file/{fileId}")]
        public async Task<IActionResult> DownloadAnyFile(string fileId)
        {
            try
            {
                var request = _driveService.Files.Get(fileId);
                request.Fields = "name,mimeType";
                var file = await request.ExecuteAsync();

                if (file == null)
                {
                    _logger.LogWarning($"File with ID {fileId} not found on Google Drive.");
                    return NotFound(new { error = "File not found on Google Drive.", fileId });
                }

                var fileStream = new MemoryStream();
                await _driveService.Files.Get(fileId).DownloadAsync(fileStream);
                fileStream.Position = 0;

                var fileName = file.Name ?? "downloaded_file";
                var contentType = file.MimeType ?? "application/octet-stream";
                Response.Headers["Cache-Control"] = "public,max-age=86400";
                return File(fileStream, contentType, fileName);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"Failed to download file with ID: {fileId}");
                return StatusCode(500, new { error = $"Failed to download file: {ex.Message}", fileId });
            }
        }
    }
}
