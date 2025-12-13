using QuizApp.Models;

namespace QuizApp.Services
{
    /// <summary>
    /// Authentication service interface - demonstrates OOP Abstraction.
    /// Defines contract for authentication operations.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Register a new user.
        /// </summary>
        Task<User?> RegisterAsync(string username, string email, string password);

        /// <summary>
        /// Validate user credentials and return user if valid.
        /// </summary>
        Task<User?> ValidateCredentialsAsync(string username, string password);

        /// <summary>
        /// Get user by ID.
        /// </summary>
        Task<User?> GetUserByIdAsync(int id);

        /// <summary>
        /// Get user by username.
        /// </summary>
        Task<User?> GetUserByUsernameAsync(string username);

        /// <summary>
        /// Check if username already exists.
        /// </summary>
        Task<bool> UsernameExistsAsync(string username);

        /// <summary>
        /// Check if email already exists.
        /// </summary>
        Task<bool> EmailExistsAsync(string email);
    }
}
