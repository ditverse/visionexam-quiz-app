namespace QuizApp.Models
{
    /// <summary>
    /// Base entity class demonstrating OOP Inheritance principle.
    /// All entities inherit common properties from this class.
    /// </summary>
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
