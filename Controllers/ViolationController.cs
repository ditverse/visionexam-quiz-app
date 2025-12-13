using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Models;
using QuizApp.Services;

namespace QuizApp.Controllers
{
    /// <summary>
    /// Violation Controller - API endpoint for logging face detection violations.
    /// Called via AJAX from face-api.js in the browser.
    /// </summary>
    [Authorize]
    public class ViolationController : Controller
    {
        private readonly IQuizService _quizService;

        public ViolationController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        /// <summary>
        /// Log a face detection violation via AJAX.
        /// </summary>
        /// <param name="attemptId">Quiz attempt ID</param>
        /// <param name="violationType">Type of violation (0=LookLeft, 1=LookRight, 2=NoFace, 3=MultipleFaces)</param>
        /// <param name="metadata">Optional JSON metadata</param>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Log(int attemptId, int violationType, string? metadata = null)
        {
            try
            {
                // Validate violation type
                if (!Enum.IsDefined(typeof(ViolationType), violationType))
                {
                    return BadRequest(new { success = false, message = "Invalid violation type" });
                }

                var type = (ViolationType)violationType;
                var violation = await _quizService.LogViolationAsync(attemptId, type, metadata);

                return Json(new 
                { 
                    success = true, 
                    violationId = violation.Id,
                    message = GetWarningMessage(type)
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get violation count for an attempt.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Count(int attemptId)
        {
            var violations = await _quizService.GetAttemptViolationsAsync(attemptId);
            return Json(new 
            { 
                total = violations.Count,
                lookLeft = violations.Count(v => v.Type == ViolationType.LookLeft),
                lookRight = violations.Count(v => v.Type == ViolationType.LookRight),
                noFace = violations.Count(v => v.Type == ViolationType.NoFace),
                multipleFaces = violations.Count(v => v.Type == ViolationType.MultipleFaces)
            });
        }

        private static string GetWarningMessage(ViolationType type)
        {
            return type switch
            {
                ViolationType.LookLeft => "Peringatan: Anda terdeteksi melihat ke kiri!",
                ViolationType.LookRight => "Peringatan: Anda terdeteksi melihat ke kanan!",
                ViolationType.NoFace => "Peringatan: Wajah tidak terdeteksi!",
                ViolationType.MultipleFaces => "Peringatan: Terdeteksi lebih dari satu wajah!",
                _ => "Peringatan: Aktivitas mencurigakan terdeteksi!"
            };
        }
    }
}
