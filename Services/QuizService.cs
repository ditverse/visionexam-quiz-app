using Microsoft.EntityFrameworkCore;
using QuizApp.Data;
using QuizApp.Models;
using System.Text.Json;

namespace QuizApp.Services
{
    /// <summary>
    /// Quiz service implementation.
    /// Implements IQuizService interface - demonstrates OOP Polymorphism.
    /// </summary>
    public class QuizService : IQuizService
    {
        private readonly AppDbContext _context;

        public QuizService(AppDbContext context)
        {
            _context = context;
        }

        #region Quiz CRUD

        public async Task<List<Quiz>> GetAllQuizzesAsync()
        {
            return await _context.Quizzes
                .Include(q => q.Questions)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Quiz>> GetActiveQuizzesAsync()
        {
            return await _context.Quizzes
                .Where(q => q.IsActive)
                .Include(q => q.Questions)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();
        }

        public async Task<Quiz?> GetQuizByIdAsync(int id)
        {
            return await _context.Quizzes.FindAsync(id);
        }

        public async Task<Quiz?> GetQuizWithQuestionsAsync(int id)
        {
            return await _context.Quizzes
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Id == id);
        }

        public async Task<Quiz> CreateQuizAsync(Quiz quiz)
        {
            _context.Quizzes.Add(quiz);
            await _context.SaveChangesAsync();
            return quiz;
        }

        public async Task<Quiz?> UpdateQuizAsync(Quiz quiz)
        {
            var existing = await _context.Quizzes.FindAsync(quiz.Id);
            if (existing == null) return null;

            existing.Title = quiz.Title;
            existing.Description = quiz.Description;
            existing.DurationMinutes = quiz.DurationMinutes;
            existing.IsActive = quiz.IsActive;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteQuizAsync(int id)
        {
            var quiz = await _context.Quizzes.FindAsync(id);
            if (quiz == null) return false;

            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Question CRUD

        public async Task<Question?> GetQuestionByIdAsync(int id)
        {
            return await _context.Questions.FindAsync(id);
        }

        public async Task<Question> AddQuestionAsync(Question question)
        {
            _context.Questions.Add(question);
            await _context.SaveChangesAsync();
            return question;
        }

        public async Task<Question?> UpdateQuestionAsync(Question question)
        {
            var existing = await _context.Questions.FindAsync(question.Id);
            if (existing == null) return null;

            existing.Text = question.Text;
            existing.OptionsJson = question.OptionsJson;
            existing.CorrectOptionIndex = question.CorrectOptionIndex;
            existing.Points = question.Points;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteQuestionAsync(int id)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null) return false;

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Quiz Attempt

        public async Task<QuizAttempt> StartQuizAttemptAsync(int userId, int quizId)
        {
            var quiz = await GetQuizWithQuestionsAsync(quizId);
            if (quiz == null)
            {
                throw new ArgumentException("Quiz not found");
            }

            var attempt = new QuizAttempt
            {
                UserId = userId,
                QuizId = quizId,
                StartedAt = DateTime.UtcNow,
                MaxScore = quiz.Questions.Sum(q => q.Points)
            };

            _context.QuizAttempts.Add(attempt);
            await _context.SaveChangesAsync();
            return attempt;
        }

        public async Task<QuizAttempt?> GetAttemptByIdAsync(int id)
        {
            return await _context.QuizAttempts
                .Include(a => a.Quiz)
                    .ThenInclude(q => q!.Questions)
                .Include(a => a.Violations)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<QuizAttempt?> GetActiveAttemptAsync(int userId, int quizId)
        {
            return await _context.QuizAttempts
                .Include(a => a.Quiz)
                    .ThenInclude(q => q!.Questions)
                .FirstOrDefaultAsync(a => 
                    a.UserId == userId && 
                    a.QuizId == quizId && 
                    a.CompletedAt == null);
        }

        public async Task<QuizAttempt?> SubmitAnswerAsync(int attemptId, int questionId, int selectedOption)
        {
            var attempt = await _context.QuizAttempts.FindAsync(attemptId);
            if (attempt == null || attempt.IsCompleted) return null;

            // Parse existing answers
            var answers = JsonSerializer.Deserialize<List<AnswerEntry>>(attempt.AnswersJson) ?? new List<AnswerEntry>();

            // Update or add answer
            var existingAnswer = answers.FirstOrDefault(a => a.QuestionId == questionId);
            if (existingAnswer != null)
            {
                existingAnswer.SelectedOption = selectedOption;
            }
            else
            {
                answers.Add(new AnswerEntry { QuestionId = questionId, SelectedOption = selectedOption });
            }

            attempt.AnswersJson = JsonSerializer.Serialize(answers);
            await _context.SaveChangesAsync();

            return attempt;
        }

        public async Task<QuizAttempt?> CompleteAttemptAsync(int attemptId)
        {
            var attempt = await _context.QuizAttempts
                .Include(a => a.Quiz)
                    .ThenInclude(q => q!.Questions)
                .FirstOrDefaultAsync(a => a.Id == attemptId);

            if (attempt == null || attempt.IsCompleted) return null;

            // Calculate score
            var answers = JsonSerializer.Deserialize<List<AnswerEntry>>(attempt.AnswersJson) ?? new List<AnswerEntry>();
            var score = 0;

            foreach (var answer in answers)
            {
                var question = attempt.Quiz?.Questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                if (question != null && question.CorrectOptionIndex == answer.SelectedOption)
                {
                    score += question.Points;
                }
            }

            attempt.Score = score;
            attempt.CompletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return attempt;
        }

        public async Task<List<QuizAttempt>> GetUserAttemptsAsync(int userId)
        {
            return await _context.QuizAttempts
                .Where(a => a.UserId == userId)
                .Include(a => a.Quiz)
                .Include(a => a.Violations)
                .OrderByDescending(a => a.StartedAt)
                .ToListAsync();
        }

        #endregion

        #region Violation

        public async Task<ViolationLog> LogViolationAsync(int attemptId, ViolationType type, string? metadata = null)
        {
            var violation = new ViolationLog
            {
                QuizAttemptId = attemptId,
                Type = type,
                DetectedAt = DateTime.UtcNow,
                MetadataJson = metadata
            };

            _context.ViolationLogs.Add(violation);
            await _context.SaveChangesAsync();
            return violation;
        }

        public async Task<List<ViolationLog>> GetAttemptViolationsAsync(int attemptId)
        {
            return await _context.ViolationLogs
                .Where(v => v.QuizAttemptId == attemptId)
                .OrderBy(v => v.DetectedAt)
                .ToListAsync();
        }

        #endregion

        /// <summary>
        /// Helper class for serializing answers.
        /// </summary>
        private class AnswerEntry
        {
            public int QuestionId { get; set; }
            public int SelectedOption { get; set; }
        }
    }
}