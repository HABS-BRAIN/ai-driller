document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript loaded successfully');
    
    // Initialize KaTeX
    waitForKaTeX().then(() => {
        console.log('KaTeX initialization complete');
    }).catch(error => {
        console.error('KaTeX initialization failed:', error);
    });
    
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

    // Add click event listeners to blog cards - FIXED
    document.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', function() {
            console.log('Blog card clicked');
            const articleId = this.getAttribute('data-article');
            console.log('Article ID:', articleId);
            
            if (articleId && window.loadArticleEnhanced) {
                console.log('Loading article:', articleId);
                window.loadArticleEnhanced(articleId);
            } else {
                console.error('Article ID not found or loadArticleEnhanced not available');
                // Fallback: try to extract from onclick if it exists
                const onclickAttr = this.getAttribute('onclick');
                if (onclickAttr) {
                    const match = onclickAttr.match(/loadArticleEnhanced\('([^']+)'\)/);
                    if (match) {
                        const fallbackId = match[1];
                        console.log('Using fallback article ID:', fallbackId);
                        if (window.loadArticleEnhanced) {
                            window.loadArticleEnhanced(fallbackId);
                        }
                    }
                }
            }
        });
    });

    // Add click event listeners to back buttons - FIXED
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Back button clicked');
            
            // Try to get the target page from onclick attribute
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/showPage\('([^']+)'\)/);
                if (match) {
                    const pageId = match[1];
                    console.log('Going back to:', pageId);
                    showPage(pageId);
                } else {
                    // Default fallback to blog page
                    console.log('No specific page found, going back to blog');
                    showPage('blog');
                }
            } else {
                // Default fallback to blog page
                console.log('No onclick attribute, going back to blog');
                showPage('blog');
            }
        });
    });

    // Debug: Check if blog page exists
    const blogPage = document.getElementById('blog');
    const aboutPage = document.getElementById('about');
    console.log('Blog page exists:', !!blogPage);
    console.log('About page exists:', !!aboutPage);
    console.log('Current active page:', document.querySelector('.page-section.active')?.id);
    
    // Debug: Check if blog cards exist
    const blogCards = document.querySelectorAll('.blog-card');
    console.log('Number of blog cards found:', blogCards.length);
    blogCards.forEach((card, index) => {
        console.log(`Blog card ${index}:`, card.getAttribute('data-article'));
    });
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

// Function to show main pages (about, blog) - ENHANCED
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
        console.log('Updated nav for:', pageId);
    } else {
        console.error('Nav element not found for:', pageId);
    }
}

// Global variable to track KaTeX initialization
let katexReady = false;

// Wait for KaTeX to be fully loaded - FIXED VERSION
function waitForKaTeX() {
    return new Promise((resolve) => {
        const checkKaTeX = () => {
            if (typeof renderMathInElement !== 'undefined' && typeof katex !== 'undefined') {
                katexReady = true;
                console.log('KaTeX is ready');
                resolve();
            } else {
                console.log('Waiting for KaTeX...');
                setTimeout(checkKaTeX, 100);
            }
        };
        checkKaTeX();
    });
}

// Improved math rendering function - FIXED VERSION
async function renderMath(element = document.body) {
    // Ensure KaTeX is ready
    if (!katexReady) {
        await waitForKaTeX();
    }
    
    if (typeof renderMathInElement !== 'undefined') {
        try {
            // First pass: render with standard delimiters
            renderMathInElement(element, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\[', right: '\\]', display: true},
                    {left: '\\(', right: '\\)', display: false}
                ],
                throwOnError: false,
                errorColor: '#cc0000',
                ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
                trust: true,
                strict: false, // Allow more flexible parsing
                macros: {
                    "\\RR": "\\mathbb{R}",
                    "\\NN": "\\mathbb{N}",
                    "\\ZZ": "\\mathbb{Z}",
                    "\\CC": "\\mathbb{C}",
                    "\\text": "\\textrm"
                }
            });

            console.log('Math rendered successfully');
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
        
        // Improved image processing
        const images = articleContentDiv.querySelectorAll('img');
        images.forEach(img => {
            // Set loading attributes for better performance
            img.loading = 'lazy';
            
            // Handle image loading errors
            img.onerror = function() {
                console.warn('Image failed to load:', this.src);
                this.style.border = '2px dashed #ccc';
                this.style.padding = '20px';
                this.style.background = '#f9f9f9';
                this.style.maxWidth = '100%';
                this.style.height = 'auto';
                this.alt = 'Image failed to load: ' + this.src;
                this.title = 'Failed to load: ' + this.src;
            };
            
            // Ensure images are responsive
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
            img.style.margin = '20px auto';
            
            // Handle relative paths
            if (img.src && !img.src.startsWith('http') && !img.src.startsWith('data:')) {
                if (!img.src.startsWith('images/') && !img.src.startsWith('assets/')) {
                    const originalSrc = img.getAttribute('src');
                    img.src = `articles/images/${originalSrc}`;
                }
            }
            
            // Add load event listener to ensure proper display
            img.onload = function() {
                this.style.opacity = '1';
                console.log('Image loaded successfully:', this.src);
            };
            
            // Set initial opacity for fade-in effect
            img.style.opacity = '0.8';
            img.style.transition = 'opacity 0.3s ease';
        });
        
        // FIXED: Ensure KaTeX is ready before rendering math
        await waitForKaTeX();
        
        // Render math with proper delay and error handling
        setTimeout(async () => {
            try {
                await renderMath(articleContentDiv);
                console.log('Math rendering completed for article:', articleId);
            } catch (error) {
                console.error('Math rendering failed:', error);
            }
        }, 200); // Increased delay for better reliability
        
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
