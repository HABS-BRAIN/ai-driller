// Navigation functionality
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all nav links and page sections
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked nav link
        this.classList.add('active');
        
        // Show corresponding page section
        const targetPage = this.getAttribute('data-page');
        document.getElementById(targetPage).classList.add('active');
    });
});

// Modal functionality
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking the X button
document.querySelectorAll('.close-modal').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        const modal = this.closest('.blog-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
});

// Close modal when clicking outside the modal content
document.querySelectorAll('.blog-modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.blog-modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }
});
