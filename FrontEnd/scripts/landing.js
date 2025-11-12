// --- MODAL CONTROL ---
const authModal = document.getElementById('auth-modal');

function showAuthModal(initialForm = 'login') {
    if (authModal) {
        authModal.style.display = 'block';
        switchForm(initialForm);
    }
}

function closeAuthModal() {
    if (authModal) {
        authModal.style.display = 'none';
    }
}

// Close modal if user clicks outside of the content
window.onclick = function (event) {
    if (event.target == authModal) {
        closeAuthModal();
    }
}

// --- FORM & ROLE SWITCHING ---

function selectRole(selectedRole) {
    // 1. Update Role Buttons UI
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.role === selectedRole) {
            btn.classList.add('active');
        }
    });

    // 2. Change Register Form Title based on Role
    const registerTitle = document.querySelector('#register-form h3');
    if (registerTitle) {
        if (selectedRole === 'parent') {
            registerTitle.textContent = 'Create a Parent/Student Account';
        } else if (selectedRole === 'admin') {
            registerTitle.textContent = 'Register a School Admin Account';
        } else {
            registerTitle.textContent = 'Super Admin Registration';
        }
    }

    // Note: Actual registration logic would differ based on role on the backend.
    // This is a UI simulation.
}

function switchForm(formName) {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active-form');
    });

    const activeForm = document.getElementById(`${formName}-form`);
    if (activeForm) {
        activeForm.classList.add('active-form');
    }
}

function resendOtp() {
    alert("SIMULATION: A new OTP has been sent.");
    // In a real app, this would trigger an API call.
}


// --- FORM SUBMISSION (SIMULATION) ---

document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = document.getElementById('login-status');
    status.textContent = 'Attempting to log in...';
    status.style.color = 'var(--color-pending)';
    status.style.display = 'block';

    // Simulate API call
    setTimeout(() => {
        // On success, you would redirect. For now, show success.
        status.textContent = 'Login successful! Redirecting...';
        status.style.color = 'var(--color-success)';
        // window.location.href = '/dashboard.html'; // Example redirect
    }, 1500);
});

document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = document.getElementById('reg-phone').value;
    const status = document.getElementById('register-status');
    status.textContent = 'Registering...';
    status.style.color = 'var(--color-pending)';
    status.style.display = 'block';

    // Simulate API call
    setTimeout(() => {
        // On success, switch to OTP form
        document.getElementById('otp-phone-display').textContent = phone;
        switchForm('otp');
    }, 1500);
});

document.getElementById('otp-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = document.getElementById('otp-status');
    status.textContent = 'Verifying code...';
    status.style.color = 'var(--color-pending)';
    status.style.display = 'block';

    // Simulate API call
    setTimeout(() => {
        status.textContent = 'Account verified! You can now log in.';
        status.style.color = 'var(--color-success)';
        setTimeout(() => switchForm('login'), 2000); // Switch to login after a delay
    }, 1500);
});