 // Show loading indicator
function showLoading(message = 'Loading...') {
  const existing = document.getElementById('loadingOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;

  overlay.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 0.5rem; text-align: center;">
      <div class="loading-spinner"></div>
      <p style="margin-top: 1rem; color: var(--gray-700);">${message}</p>
    </div>
  `;

  document.body.appendChild(overlay);
}

// Hide loading indicator
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.remove();
}

// Show toast notification
function showMessage(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  }[type];

  toast.innerHTML = `
    <span style="font-size: 1.5rem;">${icon}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Format currency
function formatCurrency(amount) {
  return `KES ${amount.toLocaleString()}`;
}

// Validate email
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validate phone (Kenyan format)
function isValidPhone(phone) {
  const regex = /^(\+254|0)[17]\d{8}$/;
  return regex.test(phone);
}

// Debounce function for search inputs
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Download file
function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showMessage('Copied to clipboard', 'success');
  } catch (error) {
    showMessage('Failed to copy', 'error');
  }
}
