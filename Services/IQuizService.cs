using QuizApp.Models;

namespace QuizApp.Services
{
    /// <summary>
    /// Quiz service interface - demonstrates OOP Abstraction.
    /// Defines contract for quiz-related operations.
    /// </summary>
    public interface IQuizService
    {
        // Quiz CRUD
        Task<List<Quiz>> GetAllQuizzesAsync();
        Task<List<Quiz>> GetActiveQuizzesAsync();
        Task<Quiz?> GetQuizByIdAsync(int id);
        Task<Quiz?> GetQuizWithQuestionsAsync(int id);
        Task<Quiz> CreateQuizAsync(Quiz quiz);
        Task<Quiz?> UpdateQuizAsync(Quiz quiz);
        Task<bool> DeleteQuizAsync(int id);

        // Question CRUD
        Task<Question?> GetQuestionByIdAsync(int id);
        Task<Question> AddQuestionAsync(Question question);
        Task<Question?> UpdateQuestionAsync(Question question);
        Task<bool> DeleteQuestionAsync(int id);

        // Quiz Attempt
        Task<QuizAttempt> StartQuizAttemptAsync(int userId, int quizId);
        Task<QuizAttempt?> GetAttemptByIdAsync(int id);
        Task<QuizAttempt?> GetActiveAttemptAsync(int userId, int quizId);
        Task<QuizAttempt?> SubmitAnswerAsync(int attemptId, int questionId, int selectedOption);
        Task<QuizAttempt?> CompleteAttemptAsync(int attemptId);
        Task<List<QuizAttempt>> GetUserAttemptsAsync(int userId);

        // Violation
        Task<ViolationLog> LogViolationAsync(int attemptId, ViolationType type, string? metadata = null);
        Task<List<ViolationLog>> GetAttemptViolationsAsync(int attemptId);
    }
}