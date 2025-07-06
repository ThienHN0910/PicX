using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.Fonts;
using System.IO;
using System.Threading.Tasks;

namespace PicXAPI.Services
{
   public interface IWatermarkService
   {
       Task<byte[]> ApplyTextWatermarkAsync(Stream imageStream, string watermarkText, string mimeType);
   }
}
