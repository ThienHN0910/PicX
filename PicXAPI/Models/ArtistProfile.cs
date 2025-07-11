namespace PicXAPI.Models;

public partial class ArtistProfile
{
    public int ArtistId { get; set; }

    public string? Bio { get; set; }

    public string? ProfilePicture { get; set; }

    public string? Specialization { get; set; }

    public int? ExperienceYears { get; set; }

    public string? WebsiteUrl { get; set; }

    public string? SocialMediaLinks { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User Artist { get; set; } = null!;
}
