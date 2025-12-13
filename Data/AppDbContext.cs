using Microsoft.EntityFrameworkCore;
using QuizApp.Models;

namespace QuizApp.Data
{
    /// <summary>
    /// Application Database Context for Entity Framework Core.
    /// Configured to use Supabase PostgreSQL.
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuizAttempt> QuizAttempts { get; set; }
        public DbSet<ViolationLog> ViolationLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Quiz configuration
            modelBuilder.Entity<Quiz>(entity =>
            {
                entity.HasMany(q => q.Questions)
                      .WithOne(q => q.Quiz)
                      .HasForeignKey(q => q.QuizId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // QuizAttempt configuration
            modelBuilder.Entity<QuizAttempt>(entity =>
            {
                entity.HasOne(qa => qa.User)
                      .WithMany(u => u.QuizAttempts)
                      .HasForeignKey(qa => qa.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(qa => qa.Quiz)
                      .WithMany(q => q.Attempts)
                      .HasForeignKey(qa => qa.QuizId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(qa => qa.Violations)
                      .WithOne(v => v.QuizAttempt)
                      .HasForeignKey(v => v.QuizAttemptId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Seed admin user
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                Username = "admin",
                Email = "admin@quizapp.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }
}
