using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoConnect.API.Models
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }

        [Required]
        public string Message { get; set; } = string.Empty;

        public string Type { get; set; } = "Info"; // Answer, Mention, System

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("User")]
        public int UserId { get; set; }
        public User? User { get; set; }

        public int? QuestionId { get; set; }
        public Question? Question { get; set; }
    }

    public class Review
    {
        [Key]
        public int ReviewId { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Rating { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        [ForeignKey("User")]
        public int UserId { get; set; }
        public User? User { get; set; }

        public int ReviewedUserId { get; set; }
    }
}
