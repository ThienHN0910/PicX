using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.Drawing;
using SixLabors.Fonts;
using System.IO;
using System.Threading.Tasks;
using System.Numerics;

namespace PicXAPI.Services
{
    public class WatermarkService : IWatermarkService
    {
        public async Task<byte[]> ApplyTextWatermarkAsync(Stream imageStream, string watermarkText, string mimeType)
        {
            if (imageStream.CanSeek)
            {
                imageStream.Position = 0;
            }

            using (var image = await Image.LoadAsync(imageStream))
            {
                // Initialize FontCollection and load font from file
                var fontCollection = new FontCollection();
                string baseDirectory = AppContext.BaseDirectory;
                string fontPath = System.IO.Path.Combine(baseDirectory, "Fonts", "04B_19.TTF");

                // Check if font file exists
                if (!File.Exists(fontPath))
                {
                    throw new FileNotFoundException($"Font file not found at: {fontPath}");
                }

                // Load font from file
                FontFamily fontFamily = fontCollection.Add(fontPath);

                // Create font with size
                var fontSize = Math.Max(image.Width, image.Height) / 15f;
                var font = fontFamily.CreateFont(fontSize, FontStyle.Regular);

                var color = Color.FromRgba(42, 214, 158, 20);
                var textRect = TextMeasurer.MeasureBounds(watermarkText, new TextOptions(font));
                var textWidth = textRect.Width;
                var textHeight = textRect.Height;

                image.Mutate(ctx =>
                {
                    for (float y = 0; y < image.Height; y += textHeight + 80)
                    {
                        for (float x = 0; x < image.Width; x += textWidth + 80)
                        {
                            ctx.DrawText(
                                new DrawingOptions
                                {
                                    GraphicsOptions = new GraphicsOptions { Antialias = true },
                                    Transform = Matrix3x2.CreateRotation(-0.4f, new PointF(x + textWidth / 2, y + textHeight / 2))
                                },
                                watermarkText,
                                font,
                                color,
                                new PointF(x, y)
                            );
                        }
                    }
                });

                using (var memoryStream = new MemoryStream())
                {
                    switch (mimeType.ToLower())
                    {
                        case "image/png":
                            await image.SaveAsPngAsync(memoryStream);
                            break;
                        case "image/jpeg":
                        case "image/jpg":
                            await image.SaveAsJpegAsync(memoryStream);
                            break;
                        case "image/webp":
                            await image.SaveAsWebpAsync(memoryStream);
                            break;
                        default:
                            await image.SaveAsPngAsync(memoryStream);
                            break;
                    }
                    return memoryStream.ToArray();
                }
            }
        }
    }
}