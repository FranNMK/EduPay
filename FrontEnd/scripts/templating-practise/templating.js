class MyHeader extends HTMLElement {
    connectedCallback() {
        // Determine the correct base path for links and assets
        const isSubfolder = window.location.pathname.includes('/html-files/');
        const basePath = isSubfolder ? '../../' : '';
        const assetsPath = isSubfolder ? '../../Assets/' : 'Assets/';
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
                    <a href="${basePath}Backend/frontend/index.html" class="cta-button nav-cta">Pay Fees</a>
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
        this.innerHTML = `
            <div id="auth-modal" class="modal">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <div class="modal-header">
                        <h2 id="modal-title">Welcome to EduPay</h2>
                        <div class="role-selector">
                            <button class="role-btn active" data-role="parent">Parent/Student</button>
                            <button class="role-btn" data-role="admin">School Admin</button>
                        </div>
                    </div>
                    <div class="auth-box">
                        <form id="login-form" class="auth-form">
                            <h3>Login to Your Account</h3>
                            <div class="form-group">
                                <label for="login-email">Email Address</label>
                                <input type="email" id="login-email" required>
                            </div>
                            <div class="form-group">
                                <label for="login-password">Password</label>
                                <input type="password" id="login-password" required>
                            </div>
                            <button type="submit" class="large-cta">Login</button>
                            <p class="auth-switch">Don't have an account? <a href="#" class="switch-to-register">Request Registration</a></p>
                            <p id="login-status" class="status-message"></p>
                        </form>
                        <form id="register-form" class="auth-form">
                            <h3>Request Registration</h3>
                            <p style="text-align: center; font-size: 0.9rem; margin-bottom: 15px;">Submit your details and our team will create your account and contact you.</p>
                            <div class="form-group">
                                <label for="reg-name">Full Name</label>
                                <input type="text" id="reg-name" required>
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
        this.querySelector('#login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const status = this.querySelector('#login-status');
            status.textContent = 'Attempting to log in...';
            status.style.display = 'block';
            setTimeout(() => {
                status.textContent = 'Login successful! Redirecting...';
            }, 1500);
        });

        this.querySelector('#register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const status = this.querySelector('#register-status');
            status.textContent = 'Submitting your request...';
            status.style.display = 'block';
            setTimeout(() => {
                status.textContent = 'Request received! Our team will contact you shortly.';
                setTimeout(() => this.switchForm('login'), 3000);
            }, 1500);
        });
    }

    selectRole(selectedRole) {
        this.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.role === selectedRole);
        });
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