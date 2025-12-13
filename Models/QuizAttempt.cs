using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuizApp.Models
{
    /// <summary>
    /// QuizAttempt entity representing a user's attempt at a quiz.
    /// </summary>
    public class QuizAttempt : BaseEntity
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int QuizId { get; set; }

        /// <summary>
        /// When the attempt started.
        /// </summary>
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// When the attempt was completed (null if not finished).
        /// </summary>
        public DateTime? CompletedAt { get; set; }

        /// <summary>
        /// JSON serialized array of user answers.
        /// Example: [{"questionId": 1, "selectedOption": 2}, ...]
        /// </summary>
        public string AnswersJson { get; set; } = "[]";

        /// <summary>
        /// Total score obtained.
        /// </summary>
        public int Score { get; set; } = 0;

        /// <summary>
        /// Maximum possible score.
        /// </summary>
        public int MaxScore { get; set; } = 0;

        /// <summary>
        /// Whether the attempt is still in progress.
        /// </summary>
        public bool IsCompleted => CompletedAt.HasValue;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("QuizId")]
        public virtual Quiz? Quiz { get; set; }

        public virtual ICollection<ViolationLog> Violations { get; set; } = new List<ViolationLog>();
    }
}
