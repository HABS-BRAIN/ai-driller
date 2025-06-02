document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript loaded successfully');
    
    // Navigation functionality
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Nav link clicked:', this.getAttribute('data-page'));
            
            // Remove active class from all nav links and page sections
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked nav link
            this.classList.add('active');
            
            // Show corresponding page section
            const targetPage = this.getAttribute('data-page');
            const pageElement = document.getElementById(targetPage);
            
            if (pageElement) {
                pageElement.classList.add('active');
                console.log('Successfully navigated to:', targetPage);
            } else {
                console.error('Page element not found:', targetPage);
            }
        });
    });

    // Add click event listeners to blog cards
    document.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', function() {
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr) {
                // Extract the page ID from onclick attribute
                const match = onclickAttr.match(/showResearchPage\('([^']+)'\)/);
                if (match) {
                    const pageId = match[1];
                    console.log('Navigating to research page:', pageId);
                    showResearchPage(pageId);
                }
            }
        });
    });

    // Add click event listeners to back buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/showPage\('([^']+)'\)/);
                if (match) {
                    const pageId = match[1];
                    console.log('Going back to:', pageId);
                    showPage(pageId);
                }
            }
        });
    });

    // Debug: Check if blog page exists
    const blogPage = document.getElementById('blog');
    const aboutPage = document.getElementById('about');
    console.log('Blog page exists:', !!blogPage);
    console.log('About page exists:', !!aboutPage);
    console.log('Current active page:', document.querySelector('.page-section.active')?.id);
});

// Function to show individual research pages
function showResearchPage(pageId) {
    console.log('showResearchPage called with:', pageId);
    
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    
    // Show the selected research page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log('Showed research page:', pageId);
    } else {
        console.error('Research page not found:', pageId);
    }
    
    // Update nav to show blog as active (since research pages are part of blog section)
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const blogNav = document.querySelector('[data-page="blog"]');
    if (blogNav) {
        blogNav.classList.add('active');
    }
}

// Function to show main pages (about, blog)
function showPage(pageId) {
    console.log('showPage called with:', pageId);
    
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    
    // Show the selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log('Showed main page:', pageId);
    } else {
        console.error('Main page not found:', pageId);
    }
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const targetNav = document.querySelector(`[data-page="${pageId}"]`);
    if (targetNav) {
        targetNav.classList.add('active');
    }
}
