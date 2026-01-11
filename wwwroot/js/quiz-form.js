// ====== QUIZ FORM FUNCTIONALITY ======
class QuizForm {
    constructor() {
        this.questionCount = 0;
        this.init();
    }
    
    init() {
        this.setupExistingQuestions();
        this.setupFormValidation();
    }
    
    setupExistingQuestions() {
        const questionsContainer = document.getElementById('questionsContainer');
        if (questionsContainer) {
            this.questionCount = questionsContainer.children.length;
        }
    }
    
    addQuestion() {
        const questionsContainer = document.getElementById('questionsContainer');
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <div class="question-header">
                <h3>Soal ${this.questionCount + 1}</h3>
                <div class="question-actions">
                    <button type="button" class="btn btn-sm btn-danger" onclick="quizForm.removeQuestion(this)">
                        <i class="fas fa-trash"></i>
                        Hapus
                    </button>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Pertanyaan</label>
                <textarea name="questions[${this.questionCount}].Text" class="form-control" rows="2" required placeholder="Masukkan pertanyaan"></textarea>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Poin</label>
                    <input type="number" name="questions[${this.questionCount}].Points" class="form-control" value="1" min="1" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Jawaban Benar</label>
                    <select name="questions[${this.questionCount}].CorrectOptionIndex" class="form-control" required>
                        <option value="0">Opsi A</option>
                        <option value="1">Opsi B</option>
                        <option value="2">Opsi C</option>
                        <option value="3">Opsi D</option>
                    </select>
                </div>
            </div>

            <div class="options-container">
                <label class="form-label">Opsi Jawaban</label>
                <div class="options-list">
                    <div class="option-input-group">
                        <span class="option-label">A.</span>
                        <input type="text" name="questions[${this.questionCount}].Options[0]" class="form-control" placeholder="Opsi A" required>
                        <button type="button" class="btn btn-sm btn-danger" onclick="quizForm.removeOption(this)" disabled>
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="option-input-group">
                        <span class="option-label">B.</span>
                        <input type="text" name="questions[${this.questionCount}].Options[1]" class="form-control" placeholder="Opsi B" required>
                        <button type="button" class="btn btn-sm btn-danger" onclick="quizForm.removeOption(this)" disabled>
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-secondary" onclick="quizForm.addOption(this)">
                    <i class="fas fa-plus"></i>
                    Tambah Opsi
                </button>
            </div>
        `;
        
        questionsContainer.appendChild(questionDiv);
        this.questionCount++;
        this.updateQuestionNumbers();
    }
    
    removeQuestion(button) {
        if (confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
            button.closest('.question-item').remove();
            this.updateQuestionNumbers();
        }
    }
    
    addOption(button) {
        const optionsList = button.previousElementSibling;
        const optionCount = optionsList.children.length;
        
        if (optionCount >= 6) {
            alert('Maksimal 6 opsi jawaban');
            return;
        }
        
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-input-group';
        optionDiv.innerHTML = `
            <span class="option-label">${String.fromCharCode(65 + optionCount)}.</span>
            <input type="text" name="questions[${this.getQuestionIndex(button)}].Options[${optionCount}]" class="form-control" placeholder="Opsi ${String.fromCharCode(65 + optionCount)}" required>
            <button type="button" class="btn btn-sm btn-danger" onclick="quizForm.removeOption(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        optionsList.appendChild(optionDiv);
        this.updateOptions(button);
        this.updateRemoveButtons(optionsList);
    }
    
    removeOption(button) {
        const optionsList = button.parentElement;
        if (optionsList.children.length > 2) {
            button.parentElement.remove();
            this.updateOptions(button.closest('.options-container').querySelector('.btn-secondary'));
            this.updateRemoveButtons(optionsList);
        }
    }
    
    updateQuestionNumbers() {
        const questions = document.querySelectorAll('.question-item');
        questions.forEach((question, index) => {
            const titleElement = question.querySelector('.question-header h3');
            if (titleElement) {
                titleElement.textContent = `Soal ${index + 1}`;
            }
            
            // Update all input names
            const inputs = question.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                const name = input.getAttribute('name');
                if (name) {
                    const newName = name.replace(/questions\[\d+\]/, `questions[${index}]`);
                    input.setAttribute('name', newName);
                }
            });
        });
    }
    
    updateOptions(button) {
        const questionIndex = this.getQuestionIndex(button);
        const optionsList = button.previousElementSibling;
        const options = optionsList.querySelectorAll('.option-input-group');
        const selectElement = button.closest('.question-item').querySelector('select');
        
        // Clear select options
        selectElement.innerHTML = '';
        
        // Update option labels and select options
        options.forEach((option, index) => {
            const label = option.querySelector('.option-label');
            const input = option.querySelector('input');
            const letter = String.fromCharCode(65 + index);
            
            label.textContent = letter + '.';
            input.placeholder = `Opsi ${letter}`;
            
            // Add to select
            const optionElement = document.createElement('option');
            optionElement.value = index;
            optionElement.textContent = `Opsi ${letter}`;
            selectElement.appendChild(optionElement);
        });
    }
    
    updateRemoveButtons(optionsList) {
        const buttons = optionsList.querySelectorAll('.btn-danger');
        buttons.forEach(button => {
            button.disabled = optionsList.children.length <= 2;
        });
    }
    
    getQuestionIndex(element) {
        const questionItem = element.closest('.question-item');
        const questions = Array.from(document.querySelectorAll('.question-item'));
        return questions.indexOf(questionItem);
    }
    
    setupFormValidation() {
        const form = document.querySelector('.quiz-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm()) {
                    e.preventDefault();
                }
            });
        }
    }
    
    validateForm() {
        const questions = document.querySelectorAll('.question-item');
        if (questions.length === 0) {
            alert('Quiz harus memiliki minimal 1 soal');
            return false;
        }
        
        let isValid = true;
        questions.forEach((question, index) => {
            const questionText = question.querySelector('textarea[name*="Text"]');
            const options = question.querySelectorAll('input[name*="Options"]');
            
            if (!questionText.value.trim()) {
                this.showFieldError(questionText, `Pertanyaan soal ${index + 1} wajib diisi`);
                isValid = false;
            }
            
            options.forEach((option, optionIndex) => {
                if (!option.value.trim()) {
                    this.showFieldError(option, `Opsi ${String.fromCharCode(65 + optionIndex)} soal ${index + 1} wajib diisi`);
                    isValid = false;
                }
            });
        });
        
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
}

// Global functions for onclick handlers
let quizForm;

function addQuestion() {
    quizForm.addQuestion();
}

function removeQuestion(button) {
    quizForm.removeQuestion(button);
}

function addOption(button) {
    quizForm.addOption(button);
}

function removeOption(button) {
    quizForm.removeOption(button);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    quizForm = new QuizForm();
});