using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuizApp.Models
{
    /// <summary>
    /// Violation types enumeration - demonstrates OOP principles
    /// with clear type safety for violation categories.
    /// </summary>
    public enum ViolationType
    {
        LookLeft,       // User looked to the left
        LookRight,      // User looked to the right
        NoFace,         // No face detected in frame
        MultipleFaces   // Multiple faces detected
    }

    /// <summary>
    /// ViolationLog entity for recording face detection violations.
    /// Each violation is timestamped and associated with a quiz attempt.
    /// </summary>
    public class ViolationLog : BaseEntity
    {
        [Required]
        public int QuizAttemptId { get; set; }

        /// <summary>
        /// Type of violation detected by face-api.js.
        /// </summary>
        [Required]
        public ViolationType Type { get; set; }

        /// <summary>
        /// When the violation was detected.
        /// </summary>
        public DateTime DetectedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Optional additional data from face detection (e.g., confidence score).
        /// </summary>
        public string? MetadataJson { get; set; }

        // Navigation property
        [ForeignKey("QuizAttemptId")]
        public virtual QuizAttempt? QuizAttempt { get; set; }
    }
}
