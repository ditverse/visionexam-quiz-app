using System.ComponentModel.DataAnnotations;

namespace QuizApp.Models
{
    /// <summary>
    /// User roles enumeration - demonstrates OOP Encapsulation
    /// by restricting valid role values.
    /// </summary>
    public enum UserRole
    {
        Participant,
        Admin
    }

    /// <summary>
    /// User entity representing application users.
    /// Demonstrates Encapsulation with private setter for PasswordHash.
    /// </summary>
    public class User : BaseEntity
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Password hash - encapsulated with validation in setter.
        /// </summary>
        private string _passwordHash = string.Empty;
        public string PasswordHash 
        { 
            get => _passwordHash;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("Password hash cannot be empty");
                _passwordHash = value;
            }
        }

        public UserRole Role { get; set; } = UserRole.Participant;

        // Navigation properties
        public virtual ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
    }
}
