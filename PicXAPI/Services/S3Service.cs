using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;

public class S3Service
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public S3Service(IConfiguration config)
    {
        var region = Amazon.RegionEndpoint.GetBySystemName(config["AWS:Region"]);
        _bucketName = config["AWS:BucketName"];

        _s3Client = new AmazonS3Client(
            config["AWS:AccessKey"],
            config["AWS:SecretKey"],
            region
        );
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName,
            InputStream = fileStream,
            ContentType = contentType,
            CannedACL = S3CannedACL.Private // Không public
        };
        await _s3Client.PutObjectAsync(request);
        return fileName; // key = fileId thay thế
    }

    public async Task<Stream> GetFileAsync(string fileName)
    {
        var request = new GetObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName
        };
        var response = await _s3Client.GetObjectAsync(request);
        var ms = new MemoryStream();
        await response.ResponseStream.CopyToAsync(ms);
        ms.Position = 0;
        return ms;
    }

    public async Task DeleteFileAsync(string fileName)
    {
        await _s3Client.DeleteObjectAsync(_bucketName, fileName);
    }
}
