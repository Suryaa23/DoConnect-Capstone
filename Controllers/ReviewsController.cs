using DoConnect.API.Data;
using DoConnect.API.DTOs;
using DoConnect.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DoConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly DoConnectDbContext _context;

        public ReviewsController(DoConnectDbContext context)
        {
            _context = context;
        }

        // GET api/reviews/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ReviewedUserId == userId && r.IsActive)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDto
                {
                    ReviewId = r.ReviewId,
                    Content = r.Content,
                    Rating = r.Rating,
                    CreatedAt = r.CreatedAt,
                    UserId = r.UserId,
                    Username = r.User!.Username,
                    ReviewedUserId = r.ReviewedUserId
                })
                .ToListAsync();

            var averageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;

            return Ok(new { reviews, averageRating });
        }

        // POST api/reviews
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (userId == dto.ReviewedUserId)
                return BadRequest(new { message = "You cannot review yourself." });

            var reviewedUser = await _context.Users.FindAsync(dto.ReviewedUserId);
            if (reviewedUser == null) return NotFound(new { message = "User not found." });

            var existing = await _context.Reviews
                .FirstOrDefaultAsync(r => r.UserId == userId && r.ReviewedUserId == dto.ReviewedUserId);

            if (existing != null)
                return BadRequest(new { message = "You have already reviewed this user." });

            var review = new Review
            {
                Content = dto.Content,
                Rating = dto.Rating,
                UserId = userId,
                ReviewedUserId = dto.ReviewedUserId
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Review submitted." });
        }

        // DELETE api/reviews/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role);

            var review = await _context.Reviews.FindAsync(id);
            if (review == null || !review.IsActive) return NotFound();

            if (review.UserId != userId && role != "Admin") return Forbid();

            review.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Review deleted." });
        }
    }
}
