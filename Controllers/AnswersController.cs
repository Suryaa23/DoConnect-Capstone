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
    public class AnswersController : ControllerBase
    {
        private readonly DoConnectDbContext _context;

        public AnswersController(DoConnectDbContext context)
        {
            _context = context;
        }

        // GET api/answers/question/{questionId}
        [HttpGet("question/{questionId}")]
        public async Task<IActionResult> GetByQuestion(int questionId)
        {
            var answers = await _context.Answers
                .Where(a => a.QuestionId == questionId && a.IsActive)
                .Include(a => a.User)
                .OrderByDescending(a => a.IsAccepted)
                .ThenByDescending(a => a.VoteCount)
                .Select(a => new AnswerDto
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
                })
                .ToListAsync();

            return Ok(answers);
        }

        // POST api/answers
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateAnswerDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var question = await _context.Questions.FindAsync(dto.QuestionId);
            if (question == null || !question.IsActive)
                return NotFound(new { message = "Question not found." });

            var answer = new Answer
            {
                Body = dto.Body,
                QuestionId = dto.QuestionId,
                UserId = userId
            };

            _context.Answers.Add(answer);

            // Notify question owner
            if (question.UserId != userId)
            {
                var notification = new Notification
                {
                    UserId = question.UserId,
                    QuestionId = question.QuestionId,
                    Message = $"Your question '{question.Title}' received a new answer.",
                    Type = "Answer"
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetByQuestion), new { questionId = dto.QuestionId },
                new { message = "Answer posted.", answerId = answer.AnswerId });
        }

        // PUT api/answers/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAnswerDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role);

            var answer = await _context.Answers.FindAsync(id);
            if (answer == null || !answer.IsActive) return NotFound();

            if (answer.UserId != userId && role != "Admin") return Forbid();

            answer.Body = dto.Body;
            answer.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Answer updated." });
        }

        // DELETE api/answers/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role);

            var answer = await _context.Answers.FindAsync(id);
            if (answer == null || !answer.IsActive) return NotFound();

            if (answer.UserId != userId && role != "Admin") return Forbid();

            answer.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Answer deleted." });
        }

        // POST api/answers/{id}/vote
        [HttpPost("{id}/vote")]
        [Authorize]
        public async Task<IActionResult> Vote(int id, [FromQuery] string type)
        {
            var answer = await _context.Answers.FindAsync(id);
            if (answer == null || !answer.IsActive) return NotFound();

            if (type == "up") answer.VoteCount++;
            else if (type == "down") answer.VoteCount--;

            await _context.SaveChangesAsync();
            return Ok(new { voteCount = answer.VoteCount });
        }
    }
}
