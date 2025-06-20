
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
      }
    }

    document.addEventListener('DOMContentLoaded', async function() {
      console.log('JavaScript loaded successfully');
      
      // Wait for KaTeX to be ready
      await waitForKaTeX();
      
      // Initial math rendering
      renderMath();
      
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

      // Add click event listeners to blog cards for loading markdown articles
      document.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', function() {
          const articleId = this.getAttribute('data-article');
          if (articleId) {
            console.log('Loading article:', articleId);
            loadArticle(articleId);
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

    // Function to load and display markdown articles
    async function loadArticle(articleId) {
      console.log('loadArticle called with:', articleId);
      
      // Show loading indicator
      showLoading(true);
      
      // Hide all page sections
      document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
      
      try {
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
        if (articleContentDiv) {
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
            mermaid.init(undefined, articleContentDiv.querySelectorAll('.mermaid'));
          }
          
          // Show the article display page
          document.getElementById('article-display').classList.add('active');
          
          // Update nav to show blog as active
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          const blogNav = document.querySelector('[data-page="blog"]');
          if (blogNav) {
            blogNav.classList.add('active');
          }
          
          console.log('Article displayed successfully:', articleId);
        }
        
      } catch (error) {
        console.error('Error loading article:', error);
        showError();
      } finally {
        showLoading(false);
      }
    }

    // Function to show/hide loading indicator
    function showLoading(show) {
      const loadingDiv = document.getElementById('loading');
      if (loadingDiv) {
        loadingDiv.style.display = show ? 'block' : 'none';
      }
      
      if (show) {
        // Hide all other page sections when loading
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        loadingDiv.classList.add('active');
      } else {
        loadingDiv.classList.remove('active');
      }
    }

    // Function to show error message
    function showError() {
      // Hide all page sections
      document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
      
      // Show error message
      const errorDiv = document.getElementById('error-message');
      if (errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.classList.add('active');
      }
    }

    // Function to show main pages (about, blog)
    function showPage(pageId) {
      console.log('showPage called with:', pageId);
      
      // Hide loading and error states
      showLoading(false);
      const errorDiv = document.getElementById('error-message');
      if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.classList.remove('active');
      }
      
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

    // Legacy function for backward compatibility
    function showResearchPage(pageId) {
      loadArticle(pageId);
    }
