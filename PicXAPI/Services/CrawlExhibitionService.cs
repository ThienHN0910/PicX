using PicXAPI.Models;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json; // Để làm việc với JSON
using System.Threading.Tasks;
using System;
using System.Linq;

namespace PicXAPI.Services
{
    public class CrawlExhibitionService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration; // Để đọc API Key từ cấu hình

        public CrawlExhibitionService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<List<ExhibitionInfo>> GetAllExhibitionsFromApis()
        {
            var allExhibitions = new List<ExhibitionInfo>();

            // call each API
            allExhibitions.AddRange(await GetFromHarvardApi());
            // can add more APIs here

            return allExhibitions;
        }

       

       
        private async Task<List<ExhibitionInfo>> GetFromHarvardApi()
        {
            var exhibitions = new List<ExhibitionInfo>();
            try
            {
                var apiKey = _configuration["ApiKeys:HarvardArtMuseums"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    Console.WriteLine("Harvard Art Museums API Key is not configured. Skipping this API.");
                    return exhibitions;
                }

                var response = await _httpClient.GetStringAsync($"https://api.harvardartmuseums.org/exhibition?apikey={apiKey}&size=100");
                using (JsonDocument doc = JsonDocument.Parse(response))
                {
                    if (doc.RootElement.TryGetProperty("records", out var records))
                    {
                        foreach (var element in records.EnumerateArray())
                        {
                            exhibitions.Add(new ExhibitionInfo
                            {
                                Title = element.TryGetProperty("title", out var title) ? title.GetString() : null,
                                GalleryOrMuseum = "Harvard Art Museums",
                                Date = element.TryGetProperty("period", out var period) ? period.GetString() :
                                       (element.TryGetProperty("begindate", out var beginDate) && element.TryGetProperty("enddate", out var endDate)
                                           ? $"{beginDate.GetString()} - {endDate.GetString()}"
                                           : (element.TryGetProperty("begindate", out var onlyBeginDate) ? onlyBeginDate.GetString()
                                               : (element.TryGetProperty("enddate", out var onlyEndDate) ? onlyEndDate.GetString() : null))),
                                Location = element.TryGetProperty("venues", out var venues) && venues.EnumerateArray().Any() ?
                                            (venues.EnumerateArray().FirstOrDefault().TryGetProperty("name", out var venueName) ? venueName.GetString() : null) : null,
                                Url = element.TryGetProperty("url", out var url) ? url.GetString() : null,
                                Description = element.TryGetProperty("shortdescription", out var shortDesc) ? shortDesc.GetString() :
                                              (element.TryGetProperty("description", out var desc) ? desc.GetString() : null),
                                ImageUrl = element.TryGetProperty("images", out var images) && images.EnumerateArray().Any() ?
                                            (images.EnumerateArray().FirstOrDefault().TryGetProperty("baseimageurl", out var imageUrl) ? imageUrl.GetString() : null) : null,

                                SourceApi = "Harvard Art Museums API"
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting data from Harvard API: {ex.Message}");
            }
            return exhibitions;
        }
        // if u add more APIs, you can create similar methods like GetFromHarvardApi and call them in GetAllExhibitionsFromApis method
    }
}