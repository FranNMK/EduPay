// layout.js
async function includeLayoutParts() {
  let html = document.body.innerHTML;

  // Define reusable parts (you can add more later)
  const parts = {
    "{header}": "FrontEnd/html files/header.html",
    "{footer}": "FrontEnd/html files/footer.html"
  };

  // Loop through each part and replace the placeholder
  for (const [placeholder, filePath] of Object.entries(parts)) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Failed to load ${filePath}`);
      const content = await response.text();
      html = html.replace(placeholder, content);
    } catch (error) {
      console.error(error);
    }
  }

  // Update the page
  document.body.innerHTML = html;
}

// Run after the page is loaded
document.addEventListener("DOMContentLoaded", includeLayoutParts);
