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

// Global variable to track KaTeX initialization
let katexReady = false;

// Wait for KaTeX to be fully loaded
function waitForKaTeX() {
    return new Promise((resolve) => {
        if (typeof renderMathInElement !== 'undefined') {
            katexReady = true;
            resolve();
        } else {
            setTimeout(() => waitForKaTeX().then(resolve), 100);
        }
    });
}

// Improved math rendering function
function renderMath(element = document.body) {
    if (typeof renderMathInElement !== 'undefined') {
        try {
            renderMathInElement(element, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\[', right: '\\]', display: true},
                    {left: '\\(', right: '\\)', display: false}
                ],
                throwOnError: false,
                errorColor: '#cc0000',
                macros: {
                    "\\RR": "\\mathbb{R}",
                    "\\NN": "\\mathbb{N}",
                    "\\ZZ": "\\mathbb{Z}",
                    "\\CC": "\\mathbb{C}"
                }
            });
        } catch (error) {
            console.error('KaTeX rendering error:', error);
        }
    } else {
        console.warn('KaTeX renderMathInElement not available');
    }
}

// Simple loading/error display functions
function showLoading(show) {
    let loader = document.getElementById('loading-indicator');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loading-indicator';
        loader.innerHTML = '<p>Loading...</p>';
        loader.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border:1px solid #ccc;z-index:1000;';
        document.body.appendChild(loader);
    }
    loader.style.display = show ? 'block' : 'none';
}

function showError(message = 'Error loading content') {
    let errorDiv = document.getElementById('error-indicator');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-indicator';
        errorDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#ffebee;color:#c62828;padding:20px;border:1px solid #e57373;z-index:1000;';
        document.body.appendChild(errorDiv);
    }
    errorDiv.innerHTML = `<p>${message}</p>`;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
}

// Enhanced article loading with better math and image handling
window.loadArticleEnhanced = async function(articleId) {
    console.log('loadArticleEnhanced called with:', articleId);
    
    // Show loading indicator
    showLoading(true);
    
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    
    try {
        // Check if marked.js is available
        if (typeof marked === 'undefined') {
            throw new Error('marked.js library is not loaded');
        }
        
        // Fetch the markdown file
        const response = await fetch(`articles/${articleId}.md`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const markdownContent = await response.text();
        console.log('Markdown loaded successfully for:', articleId);
        
        // Convert markdown to HTML using marked.js
        const htmlContent = marked.parse(markdownContent);
        
        // Display the article
        const articleContentDiv = document.getElementById('article-content');
        if (!articleContentDiv) {
            throw new Error('article-content element not found');
        }
        
        articleContentDiv.innerHTML = htmlContent;
        
        // Process images to ensure proper loading
        const images = articleContentDiv.querySelectorAll('img');
        images.forEach(img => {
            img.onerror = function() {
                console.warn('Image failed to load:', this.src);
                this.style.border = '2px dashed #ccc';
                this.alt = 'Image failed to load: ' + this.src;
            };
            
            // Handle relative paths
            if (img.src && !img.src.startsWith('http') && !img.src.startsWith('data:')) {
                // Assume images are in an 'images' or 'assets' folder relative to articles
                if (!img.src.startsWith('images/') && !img.src.startsWith('assets/')) {
                    img.src = `articles/images/${img.getAttribute('src')}`;
                }
            }
        });
        
        // Render math with a small delay to ensure DOM is ready
        setTimeout(() => {
            renderMath(articleContentDiv);
        }, 100);
        
        // Initialize Mermaid diagrams if present
        if (typeof mermaid !== 'undefined') {
            try {
                mermaid.init(undefined, articleContentDiv.querySelectorAll('.mermaid'));
            } catch (error) {
                console.warn('Mermaid initialization error:', error);
            }
        }
        
        // Show the article display page
        const articleDisplay = document.getElementById('article-display');
        if (articleDisplay) {
            articleDisplay.classList.add('active');
        } else {
            console.error('article-display element not found');
        }
        
        // Update nav to show blog as active
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const blogNav = document.querySelector('[data-page="blog"]');
        if (blogNav) {
            blogNav.classList.add('active');
        }
        
        console.log('Article displayed successfully:', articleId);
        
    } catch (error) {
        console.error('Error loading article:', error);
        showError(`Failed to load article: ${error.message}`);
    } finally {
        showLoading(false);
    }
};
