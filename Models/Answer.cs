using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoConnect.API.Models
{
    public class Answer
    {
        [Key]
        public int AnswerId { get; set; }

        [Required]
        public string Body { get; set; } = string.Empty;

        public int VoteCount { get; set; } = 0;

        public bool IsAccepted { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // FK
        [ForeignKey("User")]
        public int UserId { get; set; }
        public User? User { get; set; }

        [ForeignKey("Question")]
        public int QuestionId { get; set; }
        public Question? Question { get; set; }
    }
}
