using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicXAPI.DTOs
{
    public class ArtistProfileDto
    {
         // Fields from the Users table (common profile info)
            public string Name { get; set; }
            public string Email { get; set; }
            public string Phone { get; set; }
            public string Address { get; set; }
            public string Role { get; set; } // Should be "artist" for this DTO

            // Fields specific to ArtistProfiles table
            public string Bio { get; set; }
            public string ProfilePicture { get; set; }
            public string Specialization { get; set; }
            public int? ExperienceYears { get; set; } // Nullable if not always provided
            public string WebsiteUrl { get; set; }
            public string SocialMediaLinks { get; set; } // Stored as JSON string
    }
}