using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuizApp.Models
{
    /// <summary>
    /// Question entity representing a quiz question.
    /// Options are stored as JSON array in OptionsJson property.
    /// </summary>
    public class Question : BaseEntity
    {
        [Required]
        public int QuizId { get; set; }

        [Required]
        [StringLength(1000)]
        public string Text { get; set; } = string.Empty;

        /// <summary>
        /// JSON serialized array of options.
        /// Example: ["Option A", "Option B", "Option C", "Option D"]
        /// </summary>
        [Required]
        public string OptionsJson { get; set; } = "[]";

        /// <summary>
        /// Zero-based index of the correct option.
        /// </summary>
        [Range(0, 9)]
        public int CorrectOptionIndex { get; set; }

        /// <summary>
        /// Points awarded for correct answer.
        /// </summary>
        public int Points { get; set; } = 1;

        // Navigation property
        [ForeignKey("QuizId")]
        public virtual Quiz? Quiz { get; set; }
    }
}
