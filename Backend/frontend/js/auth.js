 let currentUserId = null;

// Login form handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    showLoading('Logging in...');
    
    const response = await api.login(email, password);
    
    if (response.requires2FA) {
      currentUserId = response.userId;
      // Show OTP form
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('otpForm').style.display = 'block';
      showMessage('OTP sent to your phone', 'success');
    }
    
    hideLoading();
  } catch (error) {
    hideLoading();
    showMessage(error.message || 'Login failed', 'error');
  }
});

// OTP form handler
document.getElementById('otpForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const otp = document.getElementById('otp').value;

  try {
    showLoading('Verifying OTP...');
    
    const response = await api.verifyOTP(currentUserId, otp);
    
    // Save token
    api.setToken(response.token);
    
    // Save user data
    localStorage.setItem('user', JSON.stringify(response.user));
    
    hideLoading();
    showMessage('Login successful!', 'success');
    
    // Redirect based on role
    setTimeout(() => {
      switch (response.user.role) {
        case 'parent':
          window.location.href = 'parent-dashboard.html';
          break;
        case 'school_admin':
          window.location.href = 'admin-dashboard.html';
          break;
        case 'super_admin':
          window.location.href = 'super-dashboard.html';
          break;
        default:
          window.location.href = 'parent-dashboard.html';
      }
    }, 1000);
    
  } catch (error) {
    hideLoading();
    showMessage(error.message || 'OTP verification failed', 'error');
  }
});

// Utility functions
function showLoading(message) {
  // Implement loading indicator
  console.log('Loading:', message);
}

function hideLoading() {
  // Hide loading indicator
  console.log('Loading complete');
}

function showMessage(message, type) {
  // Show toast/alert message
  alert(message);
}
