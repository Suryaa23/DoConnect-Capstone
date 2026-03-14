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
    public class QuestionsController : ControllerBase
    {
        private readonly DoConnectDbContext _context;

        public QuestionsController(DoConnectDbContext context)
        {
            _context = context;
        }

        // GET api/questions
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? tag,
            [FromQuery] bool? resolved,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Questions
                .Where(q => q.IsActive)
                .Include(q => q.User)
                .Include(q => q.Answers)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(q => q.Title.Contains(search) || q.Body.Contains(search));

            if (!string.IsNullOrWhiteSpace(tag))
                query = query.Where(q => q.Tags != null && q.Tags.Contains(tag));

            if (resolved.HasValue)
                query = query.Where(q => q.IsResolved == resolved.Value);

            var total = await query.CountAsync();
            var questions = await query
                .OrderByDescending(q => q.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(q => new QuestionDto
                {
                    QuestionId = q.QuestionId,
                    Title = q.Title,
                    Body = q.Body,
                    Tags = q.Tags,
                    ViewCount = q.ViewCount,
                    VoteCount = q.VoteCount,
                    IsResolved = q.IsResolved,
                    CreatedAt = q.CreatedAt,
                    UpdatedAt = q.UpdatedAt,
                    UserId = q.UserId,
                    Username = q.User!.Username,
                    AnswerCount = q.Answers.Count(a => a.IsActive),
                    AcceptedAnswerId = q.AcceptedAnswerId
                })
                .ToListAsync();

            return Ok(new { total, page, pageSize, questions });
        }

        // GET api/questions/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var question = await _context.Questions
                .Where(q => q.QuestionId == id && q.IsActive)
                .Include(q => q.User)
                .Include(q => q.Answers.Where(a => a.IsActive))
                    .ThenInclude(a => a.User)
                .FirstOrDefaultAsync();

            if (question == null) return NotFound(new { message = "Question not found." });

            // Increment view count
            question.ViewCount++;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                question = new QuestionDto
                {
                    QuestionId = question.QuestionId,
                    Title = question.Title,
                    Body = question.Body,
                    Tags = question.Tags,
                    ViewCount = question.ViewCount,
                    VoteCount = question.VoteCount,
                    IsResolved = question.IsResolved,
                    CreatedAt = question.CreatedAt,
                    UpdatedAt = question.UpdatedAt,
                    UserId = question.UserId,
                    Username = question.User!.Username,
                    AnswerCount = question.Answers.Count,
                    AcceptedAnswerId = question.AcceptedAnswerId
                },
                answers = question.Answers.Select(a => new AnswerDto
                {
                    AnswerId = a.AnswerId,
                    Body = a.Body,
                    VoteCount = a.VoteCount,
                    IsAccepted = a.IsAccepted,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    UserId = a.UserId,
                    Username = a.User!.Username,
                    QuestionId = a.QuestionId
                }).OrderByDescending(a => a.IsAccepted).ThenByDescending(a => a.VoteCount)
            });
        }

        // POST api/questions
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateQuestionDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var question = new Question
            {
                Title = dto.Title,
                Body = dto.Body,
                Tags = dto.Tags,
                UserId = userId
            };

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = question.QuestionId },
                new { message = "Question created.", questionId = question.QuestionId });
        }

        // PUT api/questions/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateQuestionDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role);

            var question = await _context.Questions.FindAsync(id);
            if (question == null || !question.IsActive) return NotFound();

            if (question.UserId != userId && role != "Admin")
                return Forbid();

            if (dto.Title != null) question.Title = dto.Title;
            if (dto.Body != null) question.Body = dto.Body;
            if (dto.Tags != null) question.Tags = dto.Tags;
            question.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Question updated." });
        }

        // DELETE api/questions/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role);

            var question = await _context.Questions.FindAsync(id);
            if (question == null || !question.IsActive) return NotFound();

            if (question.UserId != userId && role != "Admin")
                return Forbid();

            question.IsActive = false; // Soft delete
            await _context.SaveChangesAsync();
            return Ok(new { message = "Question deleted." });
        }

        // POST api/questions/{id}/vote
        [HttpPost("{id}/vote")]
        [Authorize]
        public async Task<IActionResult> Vote(int id, [FromQuery] string type)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null || !question.IsActive) return NotFound();

            if (type == "up") question.VoteCount++;
            else if (type == "down") question.VoteCount--;

            await _context.SaveChangesAsync();
            return Ok(new { voteCount = question.VoteCount });
        }

        // PATCH api/questions/{id}/resolve
        [HttpPatch("{id}/resolve")]
        [Authorize]
        public async Task<IActionResult> MarkResolved(int id, [FromQuery] int? acceptedAnswerId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var question = await _context.Questions.FindAsync(id);
            if (question == null || !question.IsActive) return NotFound();
            if (question.UserId != userId) return Forbid();

            question.IsResolved = true;
            if (acceptedAnswerId.HasValue)
            {
                question.AcceptedAnswerId = acceptedAnswerId;
                var answer = await _context.Answers.FindAsync(acceptedAnswerId);
                if (answer != null) answer.IsAccepted = true;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Question marked as resolved." });
        }

        // GET api/questions/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var questions = await _context.Questions
                .Where(q => q.UserId == userId && q.IsActive)
                .Include(q => q.Answers)
                .OrderByDescending(q => q.CreatedAt)
                .Select(q => new QuestionDto
                {
                    QuestionId = q.QuestionId,
                    Title = q.Title,
                    Tags = q.Tags,
                    VoteCount = q.VoteCount,
                    ViewCount = q.ViewCount,
                    IsResolved = q.IsResolved,
                    CreatedAt = q.CreatedAt,
                    UserId = q.UserId,
                    Username = q.User!.Username,
                    AnswerCount = q.Answers.Count
                })
                .ToListAsync();

            return Ok(questions);
        }
    }
}
