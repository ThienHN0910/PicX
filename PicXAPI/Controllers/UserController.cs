using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PicX.Models;
using PicXAPI.Models;

namespace PicXAPI.Controllers
{
    [ApiController]
    [Route("api/user")]
    
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<ProfileDto>> GetUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userId, out var Id))
                return Unauthorized();
            var user = await _context.Users.Where(u => u.UserId == Id).Select(u => new ProfileDto
            {
                Name = u.Name,
                Email = u.Email,
                Phone = u.Phone,
                Address = u.Address,
                Role = u.Role
            }).FirstOrDefaultAsync();
            if (user == null)
                return NotFound();
            return Ok(user);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(ProfileDto profile)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userId, out var Id))
                return Unauthorized();
            var user = await _context.Users.FindAsync(Id);
            if (user == null)
                return NotFound();
            user.Name = profile.Name;
            user.Email = profile.Email;
            user.Phone = profile.Phone;
            user.Address = profile.Address;
            user.Role = profile.Role;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }  
    }
}
