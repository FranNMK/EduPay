// FrontEnd/scripts/layout.js

async function includeLayoutParts() {
  let html = document.body.innerHTML;

  // Get the current path and normalize
  const currentPath = window.location.pathname.toLowerCase();

  // Detect if we’re inside a subfolder like /html files/ or /html-files/
  let basePath = "";
  if (currentPath.includes("html files") || currentPath.includes("html-files")) {
  } else {
    basePath = "FrontEnd/"; // for pages in the root
  }

  const parts = {
    "{header}": `${basePath}html-files/header.html`,
    "{footer}": `${basePath}html-files/footer.html`
  };

  for (const [placeholder, filePath] of Object.entries(parts)) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Failed to load ${filePath}`);
      const content = await response.text();
      html = html.replace(placeholder, content);
    } catch (error) {
      console.error("❌ Error loading layout part:", error);
      html = html.replace(
        placeholder,
        `<p style="color:red; text-align:center;">Could not load ${filePath}</p>`
      );
    }
  }

  document.body.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", includeLayoutParts);
