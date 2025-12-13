using System.ComponentModel.DataAnnotations;

namespace QuizApp.Models
{
    /// <summary>
    /// Quiz entity representing a quiz/exam.
    /// </summary>
    public class Quiz : BaseEntity
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Duration in minutes for the quiz.
        /// </summary>
        public int DurationMinutes { get; set; } = 30;

        /// <summary>
        /// Whether the quiz is active and can be taken.
        /// </summary>
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
        public virtual ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
    }
}
