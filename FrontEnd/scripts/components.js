import { API_BASE_URL } from './config.js';

class MyHeader extends HTMLElement {
    connectedCallback() {
        // Determine the correct base path for links and assets
        const isSubfolder = window.location.pathname.includes('/html-files/');
        const basePath = isSubfolder ? '../../' : './';
        const assetsPath = isSubfolder ? '../Assets/' : 'FrontEnd/Assets/';
        const pagesPath = isSubfolder ? '' : 'FrontEnd/html-files/';

        this.innerHTML = `
            <header class="main-header">
                <div class="logo">
                    <!-- Use the dynamic path for the logo -->
                    <a href="${basePath}index.html"><img src="${assetsPath}Images/logo edu pay.jpg" alt="EduPay Logo"></a>
                </div>
                <nav class="main-nav">
                    <ul>
                        <!-- Use dynamic paths for navigation -->
                        <li><a href="${basePath}index.html">Home</a></li>
                        <li><a href="${pagesPath}About.html">About</a></li>
                        <li><a href="${pagesPath}Faqs.html">FAQ'S</a></li>
                        <li><a href="${pagesPath}privacy.html">Privacy Policy</a></li>
                        <li><a href="${pagesPath}contact.html">Contact Us</a></li>
                        <li><button class="cta-button small-cta login-register-btn">Login / Register</button></li>
                    </ul>
                </nav>
                <button class="menu-toggle" aria-label="Toggle navigation"  aria-expanded="false" aria-controls="main-nav"><span></span></button>
            </header>
        `;

        // --- Logic to highlight the active navigation link ---
        const navLinks = this.querySelectorAll('.main-nav a');
        const currentPagePath = window.location.pathname;

        navLinks.forEach(link => {
            // Create a URL object to easily access the path of the link's href
            const linkPath = new URL(link.href).pathname;

            // Check if the link's path is the same as the current page's path.
            // The second condition handles the case where the root path might be '/' instead of '/index.html'.
            if (linkPath === currentPagePath || (currentPagePath === '/' && linkPath.endsWith('/index.html'))) {
                // Exclude the "Pay Fees" button from getting the standard active style
                if (!link.classList.contains('nav-cta')) {
                    link.classList.add('active');
                }
            }
        });

        // Mobile menu toggle functionality
        const menuToggle = this.querySelector('.menu-toggle');
        const mainNav = this.querySelector('.main-nav');

        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
            mainNav.classList.toggle('open');
            menuToggle.classList.toggle('open');
        });


    }
}

customElements.define('my-header', MyHeader);

class MyFooter extends HTMLElement {
    connectedCallback() {
        // Determine the correct base path for links
        const isSubfolder = window.location.pathname.includes('/html-files/');
        const basePath = isSubfolder ? '../../' : '';
        const pagesPath = isSubfolder ? '' : 'FrontEnd/html-files/';

        this.innerHTML = `
            <footer class="main-footer">
                <div class="footer-links">
                    <a href="${basePath}index.html">Home</a>
                    <a href="${pagesPath}About.html">About</a>
                    <a href="${pagesPath}Faqs.html">FAQ'S</a>
                    <a href="${pagesPath}privacy.html">Privacy Policy</a>
                    <a href="${pagesPath}contact.html">Contact Us</a>
                    <button class="cta-button nav-cta login-register-btn">Pay Fees</button>
                </div>
                <div class="social-links">
                    <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                    <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                </div>
                <p>&copy; 2025 EduPay. All rights reserved. </p>
            </footer>
        `;
    }
}

customElements.define('my-footer', MyFooter);

class AuthModal extends HTMLElement {
    connectedCallback() {
        const isSubfolder = window.location.pathname.includes('/html-files/');
        const assetsPath = isSubfolder ? '../Assets/' : 'FrontEnd/Assets/';

        this.innerHTML = `
            <div id="auth-modal" class="modal">
                <div class="modal-content" style="text-align: center;">
                    <span class="close-button">&times;</span>
                    <!-- 1. EduPay Logo Added with corrected dynamic path -->
                    <img src="${assetsPath}Images/logo edu pay.jpg" alt="EduPay Logo" style="width: 80px; margin-bottom: 10px;">
                    <div class="modal-header">
                        <h2 id="modal-title">Welcome to EduPay</h2>
                        <div class="role-selector">
                            <button class="role-btn active" data-role="parent">Parent/Student</button>
                            <button class="role-btn" data-role="admin">School Admin</button>
                            <button class="role-btn" data-role="super-admin">Super Admin</button>
                        </div>
                    </div>
                    <div class="auth-box">
                        <!-- 2. Updated Login Form Structure -->
                        <form id="login-form" class="auth-form active-form" autocomplete="off">
                            <div class="form-group">
                                <label for="login-identifier">Email or Phone Number</label>
                                <input type="text" id="login-identifier" placeholder="e.g., user@example.com or +2547..." required>
                            </div>
                            <!-- OTP field - shown for parents -->
                            <div id="otp-group" class="form-group" style="display: none;">
                                <label for="otp-code">Verification Code</label>
                                <input type="text" id="otp-code" pattern="\\d{6}" maxlength="6" placeholder="Enter 6-digit code">
                            </div>
                            <!-- Password field - shown for admins -->
                            <div id="password-group" class="form-group" style="display: none;">
                                <label for="login-password">Password</label>
                                <input type="password" id="login-password" placeholder="Enter your password">
                            </div>
                            <button type="submit" class="large-cta" id="login-submit-btn">Request OTP</button>
                            <p class="auth-switch">Don't have an account? <a href="#" class="switch-to-register">Request Registration</a></p>
                            <p id="login-status" class="status-message"></p>
                        </form>

                        <form id="register-form" class="auth-form" style="display: none;">
                            <h3 id="register-title">Request Parent/Student Registration</h3>
                            <div class="form-group">
                                <label for="reg-name">Full Name</label>
                                <input type="text" id="reg-name" required>
                            </div>
                            <div class="form-group">
                                <label for="reg-email">Your Email Address</label>
                                <input type="email" id="reg-email" required>
                            </div>
                            <div class="form-group">
                                <label for="reg-school">School Name</label>
                                <input type="text" id="reg-school" required>
                            </div>
                            <div class="form-group">
                                <label for="reg-phone">Your Phone Number</label>
                                <input type="tel" id="reg-phone" placeholder="+2547XXXXXXXX" required>
                            </div>
                            <button type="submit" class="large-cta">Submit Request</button>
                            <p class="auth-switch">Already registered? <a href="#" class="switch-to-login">Login Here</a></p>
                            <p id="register-status" class="status-message"></p>
                        </form>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const modal = this.querySelector('#auth-modal');
        const closeButton = this.querySelector('.close-button');

        const showAuthModal = (initialForm = 'login') => {
            modal.style.display = 'block';
            this.switchForm(initialForm);
        };

        const closeAuthModal = () => {
            modal.style.display = 'none';
        };

        // Global event listener to open the modal
        document.body.addEventListener('show-auth-modal', () => showAuthModal());

        // Event listeners within the component
        closeButton.addEventListener('click', closeAuthModal);
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeAuthModal();
            }
        });

        this.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectRole(btn.dataset.role));
        });

        this.querySelector('.switch-to-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchForm('register');
        });

        this.querySelector('.switch-to-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchForm('login');
        });

        // Form submission simulations
        this.querySelector('#login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifierInput = this.querySelector('#login-identifier');
            const otpGroup = this.querySelector('#otp-group');
            const otpInput = this.querySelector('#otp-code');
            const status = this.querySelector('#login-status');
            const submitButton = this.querySelector('#login-form button[type="submit"]');
            const passwordGroup = this.querySelector('#password-group');

            status.style.display = 'block';

            if (otpGroup.style.display === 'block') {
                // --- STEP 2: VERIFY OTP ---
                const otpCode = otpInput.value;
                if (!otpCode || otpCode.length < 6) {
                    status.textContent = 'Please enter the 6-digit OTP.';
                    status.style.color = 'var(--color-error)';
                    return;
                }

                // --- SIMULATION CHECK FOR OTP VERIFICATION ---
                const testEmails = ['parent@test.com', 'student@test.com'];
                const enteredEmail = identifierInput.value.trim();

                if (testEmails.includes(enteredEmail) && otpCode === '123456') {
                    status.textContent = 'SIMULATION: Login successful! Redirecting...';
                    status.style.color = 'var(--color-success)';
                    submitButton.disabled = true;
                    setTimeout(() => {
                        // Redirect test users to the parent dashboard
                        window.location.href = 'FrontEnd/html-files/dasbboard/dash_pare.html';
                    }, 1000);
                    return; // Stop execution to prevent real API call
                }
                // --- END SIMULATION CHECK ---

                status.textContent = 'Verifying OTP...';
                status.style.color = 'var(--color-pending)';
                submitButton.disabled = true;

                try {
                    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: identifierInput.value, otp: otpCode })
                    });
                    const data = await response.json();

                    if (response.ok) {
                        localStorage.setItem('edupayToken', data.token);
                        status.textContent = 'Login successful! Redirecting...';
                        status.style.color = 'var(--color-success)';
                        setTimeout(() => {
                            if (data.role === 'parent') window.location.href = 'FrontEnd/html-files/dasbboard/dash_pare.html';
                            else if (data.role === 'admin' || data.role === 'super-admin') window.location.href = 'FrontEnd/html-files/dasbboard/admin.html';
                            else window.location.href = 'FrontEnd/html-files/dasbboard/dash_pare.html';
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
            } else if (passwordGroup.style.display === 'block') {
                // --- ADMIN/SUPER-ADMIN LOGIN (PASSWORD) ---
                const passwordInput = this.querySelector('#login-password');
                status.textContent = 'Logging in...';
                status.style.color = 'var(--color-pending)';
                submitButton.disabled = true;

                try {
                    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: identifierInput.value, password: passwordInput.value })
                    });
                    const data = await response.json();

                    if (response.ok) {
                        localStorage.setItem('edupayToken', data.token);
                        status.textContent = 'Login successful! Redirecting...';
                        status.style.color = 'var(--color-success)';
                        setTimeout(() => {
                            window.location.href = 'FrontEnd/html-files/dasbboard/admin.html';
                        }, 1000);
                    } else {
                        status.textContent = `Login failed: ${data.message || 'Invalid credentials.'}`;
                        status.style.color = 'var(--color-error)';
                    }
                } catch (error) {
                    status.textContent = 'A network error occurred. Please try again.';
                    status.style.color = 'var(--color-error)';
                } finally {
                    submitButton.disabled = false;
                }

            } else {
                // --- STEP 1: ROLE-BASED INITIAL ACTION (OTP for Parent, Email Check for Admin) ---
                const selectedRole = this.querySelector('.role-btn.active')?.dataset.role;
                
                if (selectedRole === 'parent') {
                    // --- Parent OTP Request ---
                    const testEmails = ['parent@test.com', 'student@test.com']; // Test emails for simulation
                    const enteredEmail = identifierInput.value.trim();

                    if (testEmails.includes(enteredEmail)) {
                        // --- SIMULATED SUCCESS FOR TEST EMAILS ---
                        status.textContent = `SIMULATION: An OTP has been sent to ${enteredEmail}. (Test OTP is 123456)`;
                        status.style.color = 'var(--color-success)';
                        otpGroup.style.display = 'block';
                        otpInput.value = '123456'; // Pre-fill for convenience
                        otpInput.focus();
                        submitButton.textContent = 'Verify & Login';
                        identifierInput.readOnly = true;
                    } else {
                        // --- REAL API CALL for non-test emails ---
                        try {
                            // For parents, we now use the /login endpoint to request OTP
                            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    email: identifierInput.value,
                                    // No password for parent OTP request
                                })
                            });

                            status.textContent = 'Requesting OTP...';
                            status.style.color = 'var(--color-pending)';
                            submitButton.disabled = true;

                            if (response.ok) {
                                status.textContent = `An OTP has been sent to ${identifierInput.value}.`;
                                status.style.color = 'var(--color-success)';
                                otpGroup.style.display = 'block';
                                otpInput.focus();
                                submitButton.textContent = 'Verify & Login';
                                identifierInput.readOnly = true;
                            } else {
                                const error = await response.json();
                                status.textContent = `Error: ${error.message || 'User not found or invalid input.'}`;
                                status.style.color = 'var(--color-error)';
                            }
                        } catch (error) {
                            status.textContent = 'A network error occurred. Please check your connection.';
                            status.style.color = 'var(--color-error)';
                        } finally {
                            submitButton.disabled = false;
                        }
                    }
                } else {
                    // --- Admin Email Validation ---
                    status.textContent = 'Validating admin email...';
                    status.style.color = 'var(--color-pending)';
                    submitButton.disabled = true;

                    try {
                        // We use the same login endpoint; the backend logic handles it.
                        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: identifierInput.value })
                        });

                        if (response.ok) {
                            status.textContent = 'Admin verified. Please enter your password.';
                            status.style.color = 'var(--color-success)';
                            passwordGroup.style.display = 'block';
                            this.querySelector('#login-password').focus();
                            submitButton.textContent = 'Login';
                            identifierInput.readOnly = true;
                        } else {
                            const error = await response.json();
                            status.textContent = `Error: ${error.message || 'This email is not registered as an admin.'}`;
                            status.style.color = 'var(--color-error)';
                        }
                    } catch (error) {
                        status.textContent = 'A network error occurred. Please try again.';
                        status.style.color = 'var(--color-error)';
                    } finally {
                        submitButton.disabled = false;
                    }
                }
            }
        });

        this.querySelector('#register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const status = this.querySelector('#register-status');
            const name = this.querySelector('#reg-name').value;
            const email = this.querySelector('#reg-email').value;
            const phone = this.querySelector('#reg-phone').value;
            status.textContent = 'Submitting your request...';
            status.style.color = 'var(--color-pending)';
            status.style.display = 'block';
            setTimeout(() => {
                status.textContent = 'Request received! Your school admin will contact you upon registration.';
                status.style.color = 'var(--color-success)';
                setTimeout(() => this.switchForm('login'), 3000);
            }, 1500);
        });
    }

    selectRole(selectedRole) {
        const registerTitle = this.querySelector('#register-title');
        const otpGroup = this.querySelector('#otp-group');
        const passwordGroup = this.querySelector('#password-group');
        const submitButton = this.querySelector('#login-submit-btn');
        const identifierInput = this.querySelector('#login-identifier');
        const status = this.querySelector('#login-status');
        const allFormGroups = this.querySelectorAll('.form-group');

        this.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.role === selectedRole);
        });

        // Dynamically change the form based on the selected role
        if (selectedRole === 'parent') {
            passwordGroup.style.display = 'none';
            submitButton.textContent = 'Request OTP';
        } else { // admin or super-admin
            passwordGroup.style.display = 'none'; // Hide password until email is validated
            submitButton.textContent = 'Continue';
        }

        // Reset form state when role changes
        identifierInput.readOnly = false;
        identifierInput.value = '';
        this.querySelector('#otp-code').value = '';
        this.querySelector('#login-password').value = '';
        status.style.display = 'none';
        otpGroup.style.display = 'none'; // Always hide OTP group on role switch
        passwordGroup.style.display = 'none'; // Always hide password group on role switch

        // Update registration form title
        if (registerTitle) {
            if (selectedRole === 'parent') registerTitle.textContent = 'Request Parent/Student Registration';
            else if (selectedRole === 'admin') registerTitle.textContent = 'Request School Admin Registration';
            else registerTitle.textContent = 'Request Super Admin Registration'; // super-admin
        }
    }

    switchForm(formName) {
        this.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active-form');
        });
        this.querySelector(`#${formName}-form`).classList.add('active-form');
    }
}

customElements.define('auth-modal', AuthModal);

class MyWhatapp extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
           <a href="https://wa.me/254710217048" class="whatsapp-fixed" target="_blank" aria-label="Chat on WhatsApp">
                <i class="fab fa-whatsapp"></i>
            </a>
        `;
    }
}

customElements.define('my-whatapp', MyWhatapp);

// --- Global Event Dispatcher for Header Button ---
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', function(event) {
        if (event.target.matches('.login-register-btn')) {
            document.body.dispatchEvent(new CustomEvent('show-auth-modal'));
        }
    });
});