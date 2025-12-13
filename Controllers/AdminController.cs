using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Models;
using QuizApp.Services;
using System.Text.Json;

namespace QuizApp.Controllers
{
    /// <summary>
    /// Admin Controller - handles admin dashboard and quiz management.
    /// Requires Admin role.
    /// </summary>
    [Authorize(Roles = "Admin")]
    public class AdminController : Controller
    {
        private readonly IQuizService _quizService;

        public AdminController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        // GET: /Admin/Dashboard
        [HttpGet]
        public async Task<IActionResult> Dashboard()
        {
            var quizzes = await _quizService.GetAllQuizzesAsync();
            return View(quizzes);
        }

        // GET: /Admin/CreateQuiz
        [HttpGet]
        public IActionResult CreateQuiz()
        {
            return View();
        }

        // POST: /Admin/CreateQuiz
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateQuiz(string title, string description, int durationMinutes)
        {
            if (string.IsNullOrWhiteSpace(title))
            {
                ViewData["Error"] = "Judul quiz harus diisi.";
                return View();
            }

            var quiz = new Quiz
            {
                Title = title,
                Description = description ?? "",
                DurationMinutes = durationMinutes > 0 ? durationMinutes : 30,
                IsActive = true
            };

            await _quizService.CreateQuizAsync(quiz);
            TempData["Success"] = "Quiz berhasil dibuat!";
            return RedirectToAction("EditQuiz", new { id = quiz.Id });
        }

        // GET: /Admin/EditQuiz/5
        [HttpGet]
        public async Task<IActionResult> EditQuiz(int id)
        {
            var quiz = await _quizService.GetQuizWithQuestionsAsync(id);
            if (quiz == null)
            {
                return NotFound();
            }
            return View(quiz);
        }

        // POST: /Admin/UpdateQuiz
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateQuiz(int id, string title, string description, int durationMinutes, bool isActive)
        {
            var quiz = new Quiz
            {
                Id = id,
                Title = title,
                Description = description ?? "",
                DurationMinutes = durationMinutes,
                IsActive = isActive
            };

            await _quizService.UpdateQuizAsync(quiz);
            TempData["Success"] = "Quiz berhasil diupdate!";
            return RedirectToAction("EditQuiz", new { id });
        }

        // POST: /Admin/DeleteQuiz
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            await _quizService.DeleteQuizAsync(id);
            TempData["Success"] = "Quiz berhasil dihapus!";
            return RedirectToAction("Dashboard");
        }

        // POST: /Admin/AddQuestion
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AddQuestion(int quizId, string text, string optionsJson, int correctOptionIndex, int points)
        {
            var question = new Question
            {
                QuizId = quizId,
                Text = text,
                OptionsJson = optionsJson ?? "[]",
                CorrectOptionIndex = correctOptionIndex,
                Points = points > 0 ? points : 1
            };

            await _quizService.AddQuestionAsync(question);
            return RedirectToAction("EditQuiz", new { id = quizId });
        }

        // POST: /Admin/UpdateQuestion
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateQuestion(int id, int quizId, string text, string optionsJson, int correctOptionIndex, int points)
        {
            var question = new Question
            {
                Id = id,
                Text = text,
                OptionsJson = optionsJson ?? "[]",
                CorrectOptionIndex = correctOptionIndex,
                Points = points > 0 ? points : 1
            };

            await _quizService.UpdateQuestionAsync(question);
            return RedirectToAction("EditQuiz", new { id = quizId });
        }

        // POST: /Admin/DeleteQuestion
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteQuestion(int id, int quizId)
        {
            await _quizService.DeleteQuestionAsync(id);
            return RedirectToAction("EditQuiz", new { id = quizId });
        }

        // GET: /Admin/AttemptDetails/5
        [HttpGet]
        public async Task<IActionResult> AttemptDetails(int id)
        {
            var attempt = await _quizService.GetAttemptByIdAsync(id);
            if (attempt == null)
            {
                return NotFound();
            }
            return View(attempt);
        }
    }
}
