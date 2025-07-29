using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;

public class S3Service
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public S3Service(IConfiguration config)
    {
        var regionName = config["AWS:Region"];
        if (string.IsNullOrEmpty(regionName))
        {
            throw new ArgumentException("AWS:Region is missing or empty in configuration.");
        }

        var region = Amazon.RegionEndpoint.GetBySystemName(regionName);

        _bucketName = config["AWS:BucketName"];
        if (string.IsNullOrEmpty(_bucketName))
        {
            throw new ArgumentException("AWS:BucketName is missing or empty in configuration.");
        }

        var accessKey = config["AWS:AccessKey"];
        var secretKey = config["AWS:SecretKey"];
        if (string.IsNullOrEmpty(accessKey) || string.IsNullOrEmpty(secretKey))
        {
            throw new ArgumentException("AWS AccessKey or SecretKey is missing.");
        }

        _s3Client = new AmazonS3Client(accessKey, secretKey, region);
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName,
            InputStream = fileStream,
            ContentType = contentType,
            CannedACL = S3CannedACL.Private
        };

        await _s3Client.PutObjectAsync(request);
        return fileName;
    }

    public async Task<Stream> GetFileAsync(string fileName)
    {
        var request = new GetObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName
        };

        var response = await _s3Client.GetObjectAsync(request);
        var memoryStream = new MemoryStream();
        await response.ResponseStream.CopyToAsync(memoryStream);
        memoryStream.Position = 0;
        return memoryStream;
    }

    public async Task DeleteFileAsync(string fileName)
    {
        await _s3Client.DeleteObjectAsync(_bucketName, fileName);
    }
}
