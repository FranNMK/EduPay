class MyHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="main-header">
                <div class="logo">
                    <img src="Assets\Images\logo edu pay.jpg" alt="EduPay Logo">
                </div>
                <nav class="main-nav">
                    <ul>
                        <li><a href="index.html" class="active">Home</a></li>
                        <li><a href="FrontEnd/html files/About.html">About</a></li>
                        <li><a href="FrontEnd\html-files\Faqs.html">FAQ'S</a></li>
                        <li><a href="FrontEnd\html-files\privacy.html">Privacy Policy</a></li>
                        <li><a href="FrontEnd\html-files\contact.html">Contact Us</a></li>
                        <li><a href="FrontEnd\html-files\pay-fees.html" class="cta-button nav-cta">Pay Fees</a></li>
                    </ul>
                </nav>
                <button class="menu-toggle" aria-label="Toggle navigation">&#9776;</button>
            </header>
        `;
    }
}

customElements.define('my-header', MyHeader);

class MyFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="main-footer">
                <div class="footer-links">
                    <a href="index.html" class="active">Home</a>
                    <a href="FrontEnd/html files/About.html">About</a>
                    <a href="FrontEnd\html-files\Faqs.html">FAQ'S</a>
                    <a href="FrontEnd\html-files\privacy.html">Privacy Policy</a>
                    <a href="FrontEnd\html-files\contact.html">Contact Us</a>
                    <a href="FrontEnd\html-files\pay-fees.html" class="cta-button nav-cta">Pay Fees</a>
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

customElements.define('my-whatapp', MyFooter);
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