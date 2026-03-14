using DoConnect.API.Data;
using DoConnect.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DoConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly DoConnectDbContext _context;

        public UsersController(DoConnectDbContext context)
        {
            _context = context;
        }

        // GET api/users (Admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = _context.Users
                .Include(u => u.Questions)
                .Include(u => u.Answers)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(u => u.Username.Contains(search) || u.Email.Contains(search));

            var total = await query.CountAsync();
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role,
                    Bio = u.Bio,
                    ProfilePicture = u.ProfilePicture,
                    CreatedAt = u.CreatedAt,
                    IsActive = u.IsActive,
                    QuestionCount = u.Questions.Count,
                    AnswerCount = u.Answers.Count
                })
                .ToListAsync();

            return Ok(new { total, page, pageSize, users });
        }

        // GET api/users/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _context.Users
                .Include(u => u.Questions.Where(q => q.IsActive))
                .Include(u => u.Answers.Where(a => a.IsActive))
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null) return NotFound();

            return Ok(new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Bio = user.Bio,
                ProfilePicture = user.ProfilePicture,
                CreatedAt = user.CreatedAt,
                IsActive = user.IsActive,
                QuestionCount = user.Questions.Count,
                AnswerCount = user.Answers.Count
            });
        }

        // PUT api/users/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (currentUserId != id && role != "Admin") return Forbid();

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            if (dto.Username != null) user.Username = dto.Username;
            if (dto.Bio != null) user.Bio = dto.Bio;
            if (dto.ProfilePicture != null) user.ProfilePicture = dto.ProfilePicture;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated." });
        }

        // PATCH api/users/{id}/toggle-status (Admin only)
        [HttpPatch("{id}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User {(user.IsActive ? "activated" : "deactivated")}.", isActive = user.IsActive });
        }

        // DELETE api/users/{id} (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deactivated." });
        }

        // GET api/users/stats (Admin dashboard stats)
        [HttpGet("stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
            var totalQuestions = await _context.Questions.CountAsync(q => q.IsActive);
            var totalAnswers = await _context.Answers.CountAsync(a => a.IsActive);
            var resolvedQuestions = await _context.Questions.CountAsync(q => q.IsResolved && q.IsActive);

            return Ok(new
            {
                totalUsers,
                activeUsers,
                totalQuestions,
                totalAnswers,
                resolvedQuestions
            });
        }
    }
}
