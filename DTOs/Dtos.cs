namespace DoConnect.API.DTOs
{
    // ===== AUTH DTOs =====
    public class RegisterDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int UserId { get; set; }
    }

    // ===== USER DTOs =====
    public class UserDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? ProfilePicture { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public int QuestionCount { get; set; }
        public int AnswerCount { get; set; }
    }

    public class UpdateUserDto
    {
        public string? Username { get; set; }
        public string? Bio { get; set; }
        public string? ProfilePicture { get; set; }
    }

    // ===== QUESTION DTOs =====
    public class CreateQuestionDto
    {
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? Tags { get; set; }
    }

    public class UpdateQuestionDto
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        public string? Tags { get; set; }
    }

    public class QuestionDto
    {
        public int QuestionId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? Tags { get; set; }
        public int ViewCount { get; set; }
        public int VoteCount { get; set; }
        public bool IsResolved { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int AnswerCount { get; set; }
        public int? AcceptedAnswerId { get; set; }
    }

    // ===== ANSWER DTOs =====
    public class CreateAnswerDto
    {
        public string Body { get; set; } = string.Empty;
        public int QuestionId { get; set; }
    }

    public class UpdateAnswerDto
    {
        public string Body { get; set; } = string.Empty;
    }

    public class AnswerDto
    {
        public int AnswerId { get; set; }
        public string Body { get; set; } = string.Empty;
        public int VoteCount { get; set; }
        public bool IsAccepted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int QuestionId { get; set; }
    }

    // ===== NOTIFICATION DTOs =====
    public class NotificationDto
    {
        public int NotificationId { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? QuestionId { get; set; }
    }

    // ===== REVIEW DTOs =====
    public class CreateReviewDto
    {
        public string Content { get; set; } = string.Empty;
        public int Rating { get; set; }
        public int ReviewedUserId { get; set; }
    }

    public class ReviewDto
    {
        public int ReviewId { get; set; }
        public string Content { get; set; } = string.Empty;
        public int Rating { get; set; }
        public DateTime CreatedAt { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int ReviewedUserId { get; set; }
    }
}
