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
              {left: '$', right: '$', display: true},
              {left: '
</html>, right: '
</html>, display: false},
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

    // Enhanced article loading with better math and image handling
    window.loadArticleEnhanced = async function(articleId) {
      console.log('loadArticleEnhanced called with:', articleId);
      
      // Show loading indicator
      if (window.showLoading) window.showLoading(true);
      
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
        if (window.showError) window.showError();
      } finally {
        if (window.showLoading) window.showLoading(false);
      }
    };

    document.addEventListener("DOMContentLoaded", async () => {
      // Wait for KaTeX to be ready
      await waitForKaTeX();
      
      // Initial math rendering
      renderMath();
      
      // Override the loadArticle function if it exists
      if (window.loadArticle) {
        window.loadArticle = window.loadArticleEnhanced;
      }
      
      // Add enhanced click handlers to blog cards if the original script hasn't
      setTimeout(() => {
        document.querySelectorAll('.blog-card').forEach(card => {
          // Remove existing listeners and add enhanced ones
          const articleId = card.getAttribute('data-article');
          if (articleId) {
            card.onclick = () => window.loadArticleEnhanced(articleId);
          }
        });
      }, 500);
    });
