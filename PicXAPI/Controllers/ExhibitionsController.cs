using PicXAPI.Models;
using PicXAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/exhibitions")]
    public class ExhibitionsController : ControllerBase
    {
        private readonly CrawlExhibitionService _crawlExhibitionService;

        public ExhibitionsController(CrawlExhibitionService crawlExhibitionService)
        {
            _crawlExhibitionService = crawlExhibitionService;
        }

        /// <summary>
        /// get all exhibitions from various APIs.
        /// This endpoint aggregates exhibition data from multiple sources.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExhibitionInfo>>> GetExhibitionsFromApis()
        {
            var allExhibitions = await _crawlExhibitionService.GetAllExhibitionsFromApis();

            if (!allExhibitions.Any())
            {
                return NotFound("No exhibition information found from APIs.");
            }

            return Ok(allExhibitions);
        }
    }
}