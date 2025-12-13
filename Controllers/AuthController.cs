using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Models;
using QuizApp.Services;
using System.Security.Claims;

namespace QuizApp.Controllers
{
    /// <summary>
    /// Authentication Controller - handles login, register, logout.
    /// </summary>
    public class AuthController : Controller
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // GET: /Auth/Login
        [HttpGet]
        public IActionResult Login(string? returnUrl = null)
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                return RedirectToAction("Index", "Home");
            }
            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        // POST: /Auth/Login
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(string username, string password, string? returnUrl = null)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                ViewData["Error"] = "Username dan password harus diisi.";
                return View();
            }

            var user = await _authService.ValidateCredentialsAsync(username, password);
            if (user == null)
            {
                ViewData["Error"] = "Username atau password salah.";
                return View();
            }

            // Create claims for the user
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(24)
            };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);

            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }

            // Redirect based on role
            if (user.Role == UserRole.Admin)
            {
                return RedirectToAction("Dashboard", "Admin");
            }

            return RedirectToAction("Index", "Quiz");
        }

        // GET: /Auth/Register
        [HttpGet]
        public IActionResult Register()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                return RedirectToAction("Index", "Home");
            }
            return View();
        }

        // POST: /Auth/Register
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(string username, string email, string password, string confirmPassword)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(email) || 
                string.IsNullOrWhiteSpace(password))
            {
                ViewData["Error"] = "Semua field harus diisi.";
                return View();
            }

            if (password != confirmPassword)
            {
                ViewData["Error"] = "Password tidak cocok.";
                return View();
            }

            if (password.Length < 6)
            {
                ViewData["Error"] = "Password minimal 6 karakter.";
                return View();
            }

            if (await _authService.UsernameExistsAsync(username))
            {
                ViewData["Error"] = "Username sudah digunakan.";
                return View();
            }

            if (await _authService.EmailExistsAsync(email))
            {
                ViewData["Error"] = "Email sudah digunakan.";
                return View();
            }

            var user = await _authService.RegisterAsync(username, email, password);
            if (user == null)
            {
                ViewData["Error"] = "Gagal mendaftarkan akun.";
                return View();
            }

            TempData["Success"] = "Registrasi berhasil! Silakan login.";
            return RedirectToAction("Login");
        }

        // POST: /Auth/Logout
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Index", "Home");
        }

        // GET: /Auth/AccessDenied
        [HttpGet]
        public IActionResult AccessDenied()
        {
            return View();
        }
    }
}
