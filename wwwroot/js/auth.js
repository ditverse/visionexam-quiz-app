// ====== AUTH FUNCTIONALITY ======
class AuthHandler {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupPasswordStrength();
        this.setupFormValidation();
        this.setupAnimations();
    }
    
    setupPasswordStrength() {
        const passwordInput = document.getElementById('password');
        if (!passwordInput) return;
        
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strength = this.calculatePasswordStrength(password);
            this.updatePasswordStrength(strength);
        });
    }
    
    calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        return strength;
    }
    
    updatePasswordStrength(strength) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (!strengthFill || !strengthText) return;
        
        const strengthLevels = [
            { width: '20%', color: '#ef4444', text: 'Sangat Lemah' },
            { width: '40%', color: '#f59e0b', text: 'Lemah' },
            { width: '60%', color: '#eab308', text: 'Sedang' },
            { width: '80%', color: '#84cc16', text: 'Kuat' },
            { width: '100%', color: '#10b981', text: 'Sangat Kuat' }
        ];
        
        const level = strengthLevels[Math.min(strength, 4)];
        strengthFill.style.width = level.width;
        strengthFill.style.background = level.color;
        strengthText.textContent = level.text;
        strengthText.style.color = level.color;
    }
    
    setupFormValidation() {
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
        });
    }
    
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, 'Field ini wajib diisi');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });
        
        // Password confirmation check
        const password = form.querySelector('#password');
        const confirmPassword = form.querySelector('#confirmPassword');
        
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            this.showFieldError(confirmPassword, 'Password tidak cocok');
            isValid = false;
        }
        
        return isValid;
    }
    
    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    setupAnimations() {
        // Animate auth card on load
        const authCard = document.querySelector('.auth-card');
        if (authCard) {
            authCard.style.opacity = '0';
            authCard.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                authCard.style.transition = 'all 0.6s ease';
                authCard.style.opacity = '1';
                authCard.style.transform = 'translateY(0)';
            }, 100);
        }
        
        // Animate background circles
        this.animateBackgroundCircles();
    }
    
    animateBackgroundCircles() {
        const circles = document.querySelectorAll('.bg-circle');
        circles.forEach((circle, index) => {
            circle.style.animation = `float ${6 + index * 2}s ease-in-out infinite`;
        });
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    const icon = toggle.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new AuthHandler();
});