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
                        <li><a href="${pagesPath}pay-fees.html" class="cta-button nav-cta">Pay Fees</a></li>
                    </ul>
                </nav>
                <button class="menu-toggle" aria-label="Toggle navigation">&#9776;</button>
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
                    <a href="${pagesPath}pay-fees.html" class="cta-button nav-cta">Pay Fees</a>
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