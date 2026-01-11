using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Models;
using QuizApp.Services;
using System.Security.Claims;
using System.Text.Json;

namespace QuizApp.Controllers
{
    /// <summary>
    /// Quiz Controller - handles quiz listing, taking quiz, and results.
    /// </summary>
    [Authorize]
    public class QuizController : Controller
    {
        private readonly IQuizService _quizService;

        public QuizController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(userIdClaim?.Value ?? "0");
        }

        // GET: /Quiz
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var quizzes = await _quizService.GetActiveQuizzesAsync();
            return View(quizzes);
        }

        // GET: /Quiz/Take/5
        [HttpGet]
        public async Task<IActionResult> Take(int id)
        {
            var quiz = await _quizService.GetQuizWithQuestionsAsync(id);
            if (quiz == null || !quiz.IsActive)
            {
                return NotFound();
            }

            var userId = GetUserId();
            
            // Check for existing active attempt
            var activeAttempt = await _quizService.GetActiveAttemptAsync(userId, id);
            if (activeAttempt == null)
            {
                // Start new attempt
                activeAttempt = await _quizService.StartQuizAttemptAsync(userId, id);
            }

            ViewData["AttemptId"] = activeAttempt.Id;
            ViewData["StartedAt"] = activeAttempt.StartedAt;
            return View(quiz);
        }

        // POST: /Quiz/SubmitAnswer
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SubmitAnswer(int attemptId, int questionId, int selectedOption)
        {
            var attempt = await _quizService.SubmitAnswerAsync(attemptId, questionId, selectedOption);
            if (attempt == null)
            {
                return BadRequest(new { success = false, message = "Failed to submit answer" });
            }
            return Json(new { success = true });
        }

        // POST: /Quiz/Complete
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Complete(int attemptId)
        {
            var attempt = await _quizService.CompleteAttemptAsync(attemptId);
            if (attempt == null)
            {
                return BadRequest();
            }
            return RedirectToAction("Result", new { id = attemptId });
        }

        // GET: /Quiz/Result/5
        [HttpGet]
        public async Task<IActionResult> Result(int id)
        {
            var attempt = await _quizService.GetAttemptByIdAsync(id);
            if (attempt == null)
            {
                return NotFound();
            }

            // Verify this attempt belongs to current user
            var userId = GetUserId();
            if (attempt.UserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            return View(attempt);
        }

        // GET: /Quiz/History
        [HttpGet]
        public async Task<IActionResult> History()
        {
            var userId = GetUserId();
            var attempts = await _quizService.GetUserAttemptsAsync(userId);
            return View(attempts);
        }
    }
}