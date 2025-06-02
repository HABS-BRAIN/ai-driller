document.addEventListener('DOMContentLoaded', function() {
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
});

// Function to show individual research pages
function showResearchPage(pageId) {
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    
    // Show the selected research page
    document.getElementById(pageId).classList.add('active');
    
    // Update nav to show blog as active (since research pages are part of blog section)
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-page="blog"]').classList.add('active');
}

// Function to show main pages (about, blog)
function showPage(pageId) {
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    
    // Show the selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
}
