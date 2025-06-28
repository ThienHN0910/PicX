using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicXAPI.Models;
using PicXAPI.DTOs; // Assuming ProfileDto and potentially ArtistProfileDto are here

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/profile")] // Base route for profile related operations
    public class ArtistProfileController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ArtistProfileController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("artist")]
        [Authorize(Roles = "artist")] // Only artists can view their artist profile
        public async Task<ActionResult<ArtistProfileDto>> GetArtistProfile()
        {
            // Extract the user ID from the authenticated user's claims
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Attempt to parse the user ID to an integer
            if (!int.TryParse(userIdString, out var userId))
            {
                // If parsing fails, it indicates an invalid token or setup
                return Unauthorized("Invalid user ID in token.");
            }

            // Query the database to get the user and their associated artist profile
            // Use .Include() to eagerly load the related ArtistProfile
            var user = await _context.Users
                .Include(u => u.ArtistProfile) // Assuming User model has ArtistProfile navigation property
                .Where(u => u.UserId == userId && u.Role == "artist")
                .FirstOrDefaultAsync();

            // If user or artist profile not found, return NotFound
            if (user == null || user.ArtistProfile == null)
            {
                return NotFound("Artist profile not found for the authenticated user.");
            }

            // Map the User and ArtistProfile data to the ArtistProfileDto
            var artistProfileDto = new ArtistProfileDto
            {
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Address = user.Address,
                Role = user.Role,
                Bio = user.ArtistProfile.Bio,
                ProfilePicture = user.ArtistProfile.ProfilePicture,
                Specialization = user.ArtistProfile.Specialization,
                ExperienceYears = user.ArtistProfile.ExperienceYears,
                WebsiteUrl = user.ArtistProfile.WebsiteUrl,
                SocialMediaLinks = user.ArtistProfile.SocialMediaLinks
            };

            // Return the DTO
            return Ok(artistProfileDto);
        }

        [HttpPut("artist")]
        [Authorize(Roles = "artist")] // Only artists can update their artist profile
        public async Task<IActionResult> UpdateArtistProfile([FromBody] ArtistProfileDto profileDto)
        {
            // Extract the user ID from the authenticated user's claims
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Attempt to parse the user ID to an integer
            if (!int.TryParse(userIdString, out var userId))
            {
                return Unauthorized("Invalid user ID in token.");
            }

            // Find the user and eager load their artist profile
            var user = await _context.Users
                .Include(u => u.ArtistProfile)
                .Where(u => u.UserId == userId && u.Role == "artist")
                .FirstOrDefaultAsync();

            // If user or artist profile not found, return NotFound
            if (user == null)
            {
                return NotFound("Artist profile not found for the authenticated user.");
            }

            // Check if an ArtistProfile already exists for this user
            if (user.ArtistProfile == null)
            {
                // Create a new ArtistProfile if one doesn't exist for this user
                user.ArtistProfile = new ArtistProfile
                {
                    ArtistId = user.UserId,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.ArtistProfiles.Add(user.ArtistProfile);
            }

            // Update user's general profile information
            user.Name = profileDto.Name;
            user.Email = profileDto.Email;
            user.Phone = profileDto.Phone;
            user.Address = profileDto.Address;

            // Update artist-specific profile information
            user.ArtistProfile.Bio = profileDto.Bio;
            user.ArtistProfile.ProfilePicture = profileDto.ProfilePicture;
            user.ArtistProfile.Specialization = profileDto.Specialization;
            user.ArtistProfile.ExperienceYears = profileDto.ExperienceYears;
            user.ArtistProfile.WebsiteUrl = profileDto.WebsiteUrl;
            user.ArtistProfile.SocialMediaLinks = profileDto.SocialMediaLinks;
            user.ArtistProfile.UpdatedAt = DateTime.Now;

            // Save changes to the database
            await _context.SaveChangesAsync();

            // Return success response
            return Ok(new { message = "Artist profile updated successfully" });
        }

        [HttpGet("artist/{id}")]
        public async Task<ActionResult<ArtistProfileDto>> GetArtistProfileById(int id)
        {
            // Query the database to get the user and their associated artist profile
            var user = await _context.Users
                .Include(u => u.ArtistProfile)
                .Where(u => u.UserId == id && u.Role == "artist")
                .FirstOrDefaultAsync();

            // If user or artist profile not found, return NotFound
            if (user == null || user.ArtistProfile == null)
            {
                return NotFound("Artist profile not found.");
            }

            // Map the User and ArtistProfile data to the ArtistProfileDto
            var artistProfileDto = new ArtistProfileDto
            {
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone ?? string.Empty,
                Address = user.Address ?? string.Empty,
                Role = user.Role,
                Bio = user.ArtistProfile.Bio ?? string.Empty,
                ProfilePicture = user.ArtistProfile.ProfilePicture ?? string.Empty,
                Specialization = user.ArtistProfile.Specialization ?? string.Empty,
                ExperienceYears = user.ArtistProfile.ExperienceYears,
                WebsiteUrl = user.ArtistProfile.WebsiteUrl ?? string.Empty,
                SocialMediaLinks = user.ArtistProfile.SocialMediaLinks ?? string.Empty
            };

            return Ok(artistProfileDto);
        }
    }
}
