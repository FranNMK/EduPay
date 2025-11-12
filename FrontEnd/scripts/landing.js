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

const loginForm = document.getElementById('login-form');
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifierInput = document.getElementById('login-identifier');
    const otpGroup = document.getElementById('otp-group');
    const otpInput = document.getElementById('otp-code');
    const status = document.getElementById('login-status');
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const selectedRole = document.querySelector('.role-btn.active')?.dataset.role || 'parent';

    // Check if we are in the OTP entry step
    if (otpGroup.style.display === 'block') {
        // --- STEP 2: VERIFY OTP ---
        const otpCode = otpInput.value;
        if (!otpCode || otpCode.length < 6) {
            status.textContent = 'Please enter the 6-digit OTP.';
            status.style.color = 'var(--color-error)';
            status.style.display = 'block';
            return;
        }

        status.textContent = 'Verifying OTP...';
        status.style.color = 'var(--color-pending)';
        submitButton.disabled = true;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: identifierInput.value, otp: otpCode })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('edupayToken', data.token);
                status.textContent = 'Login successful! Redirecting...';
                status.style.color = 'var(--color-success)';

                setTimeout(() => {
                    // Redirect based on the role from the backend response
                    if (data.role === 'Parent') {
                        window.location.href = 'dash_pare.html'; // Matches dashboard.js
                    } else if (data.role === 'Admin') {
                        window.location.href = 'admin.html'; // Matches admindash.js
                    } else if (data.role === 'Super Admin') {
                        window.location.href = 'admin.html'; // Super Admin might use the same dash
                    } else {
                        window.location.href = 'dash_pare.html'; // Default fallback
                    }
                }, 1000);
            } else {
                status.textContent = `Login failed: ${data.msg || 'Invalid or expired OTP.'}`;
                status.style.color = 'var(--color-error)';
            }
        } catch (error) {
            status.textContent = 'A network error occurred. Please try again.';
            status.style.color = 'var(--color-error)';
        } finally {
            submitButton.disabled = false;
        }

    } else {
        // --- STEP 1: REQUEST OTP ---
        status.textContent = 'Requesting OTP...';
        status.style.color = 'var(--color-pending)';
        status.style.display = 'block';
        submitButton.disabled = true;

        try {
            const response = await fetch('/api/auth/otp-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: identifierInput.value, role: selectedRole })
            });

            if (response.ok) {
                status.textContent = `An OTP has been sent to ${identifierInput.value}.`;
                status.style.color = 'var(--color-success)';
                otpGroup.style.display = 'block';
                otpInput.focus();
                submitButton.textContent = 'Verify & Login';
                identifierInput.readOnly = true;
            } else {
                const error = await response.json();
                status.textContent = `Error: ${error.msg || 'User not found or invalid input.'}`;
                status.style.color = 'var(--color-error)';
            }
        } catch (error) {
            status.textContent = 'A network error occurred. Please check your connection.';
            status.style.color = 'var(--color-error)';
        } finally {
            submitButton.disabled = false;
        }
    }
});

document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('register-status');
    const name = document.getElementById('reg-name').value;
    const phone = document.getElementById('reg-phone').value;
    const email = document.getElementById('reg-email').value;

    if (!name || !phone || !email) {
        status.textContent = 'Please fill in all fields.';
        status.style.color = 'var(--color-error)';
        status.style.display = 'block';
        return;
    }

    status.textContent = 'Submitting your request...';
    status.style.color = 'var(--color-pending)';
    status.style.display = 'block';

    // Simulate sending the request to the backend
    setTimeout(() => {
        status.textContent = 'Request received! Your school admin will contact you upon registration.';
        status.style.color = 'var(--color-success)';
        // Optionally, switch back to login after a delay
        setTimeout(() => switchForm('login'), 3000);
    }, 1500);
});