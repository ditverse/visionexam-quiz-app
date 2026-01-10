// ====== ADMIN DASHBOARD FUNCTIONALITY ======
class AdminDashboard {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupSearch();
        this.setupFilter();
        this.setupAnimations();
        this.setupDeleteConfirmation();
    }
    
    setupSearch() {
        const searchInput = document.getElementById('searchQuiz');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this.filterQuizCards(searchTerm);
        });
    }
    
    setupFilter() {
        const filterSelect = document.getElementById('filterStatus');
        if (!filterSelect) return;
        
        filterSelect.addEventListener('change', (e) => {
            const status = e.target.value;
            this.filterByStatus(status);
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
    
    filterByStatus(status) {
        const cards = document.querySelectorAll('.quiz-card');
        
        cards.forEach(card => {
            if (!status || card.dataset.status === status) {
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
        // Animate stat cards on load
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 * index);
        });
        
        // Animate quiz cards
        const quizCards = document.querySelectorAll('.quiz-card');
        quizCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 200 + (50 * index));
        });
    }
    
    setupDeleteConfirmation() {
        const deleteButtons = document.querySelectorAll('.btn-danger');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (!confirm('Apakah Anda yakin ingin menghapus quiz ini?')) {
                    e.preventDefault();
                }
            });
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});