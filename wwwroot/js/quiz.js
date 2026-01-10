// ====== QUIZ LIST FUNCTIONALITY ======
class QuizList {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupSearch();
        this.setupFilters();
        this.setupAnimations();
        this.setupQuizCardInteractions();
    }
    
    setupSearch() {
        const searchInput = document.getElementById('searchQuiz');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this.filterQuizCards(searchTerm);
        });
    }
    
    setupFilters() {
        const chips = document.querySelectorAll('.chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                // Remove active class from all chips
                chips.forEach(c => c.classList.remove('active'));
                // Add active class to clicked chip
                chip.classList.add('active');
                
                const filter = chip.dataset.filter;
                this.applyFilter(filter);
            });
        });
    }
    
    filterQuizCards(searchTerm) {
        const cards = document.querySelectorAll('.quiz-card');
        
        cards.forEach(card => {
            const title = card.querySelector('.quiz-title').textContent.toLowerCase();
            const description = card.querySelector('.quiz-description').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
                this.animateCard(card);
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    applyFilter(filter) {
        const cards = document.querySelectorAll('.quiz-card');
        
        cards.forEach(card => {
            let shouldShow = true;
            
            switch(filter) {
                case 'available':
                    shouldShow = card.querySelector('.quiz-footer .btn-primary') !== null;
                    break;
                case 'completed':
                    // This would need to be implemented based on user data
                    shouldShow = false;
                    break;
                case 'all':
                default:
                    shouldShow = true;
            }
            
            if (shouldShow) {
                card.style.display = 'block';
                this.animateCard(card);
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    animateCard(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 50);
    }
    
    setupAnimations() {
        // Animate quiz cards on load
        const cards = document.querySelectorAll('.quiz-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (100 * index));
        });
    }
    
    setupQuizCardInteractions() {
        const cards = document.querySelectorAll('.quiz-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.quiz-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.quiz-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new QuizList();
});