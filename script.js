// Function to switch between pages
function showPage(pageId) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.remove("active");
  });
  document.getElementById(pageId).classList.add("active");

  // Hide loading/error on other pages
  document.getElementById("loading").style.display = pageId === "loading" ? "block" : "none";
  document.getElementById("error-message").style.display = pageId === "error-message" ? "block" : "none";
}

// Add click listeners to blog cards
document.querySelectorAll('.blog-card').forEach(card => {
  card.addEventListener('click', async () => {
    const article = card.dataset.article;

    showPage('loading');

    try {
      const response = await fetch(`articles/${article}.md`);
      if (!response.ok) throw new Error("Not found");

      const markdown = await response.text();
      const html = marked.parse(markdown);

      const contentDiv = document.getElementById("article-content");
      contentDiv.innerHTML = html;

      renderMathInElement(contentDiv, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ]
      });

      showPage('article-display');
    } catch (error) {
      showPage('error-message');
    }
  });
});
