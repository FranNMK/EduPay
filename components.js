const authModalTemplate = document.createElement('template');
authModalTemplate.innerHTML = `
    <style>
        .auth-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: none; /* Hidden by default */
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .auth-modal.show {
            display: flex;
        }
        .modal-content {
            background-color: #fff;
            padding: 2rem;
            border-radius: 8px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            position: relative;
        }
        .close-btn {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 1.5rem;
            cursor: pointer;
        }
        .role-selector {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
            border: 1px solid #ccc;
            border-radius: 25px;
            overflow: hidden;
        }
        .role-selector button {
            flex: 1;
            padding: 0.75rem;
            border: none;
            background-color: #f0f0f0;
            cursor: pointer;
            font-weight: 600;
            transition: background-color 0.3s;
        }
        .role-selector button.active {
            background-color: #007bff;
            color: white;
        }
        .form-container {
            display: flex;
            flex-direction: column;
        }
        .form-container input {
            padding: 0.75rem;
            margin-bottom: 1rem;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .form-container button {
            padding: 0.75rem;
            border: none;
            border-radius: 4px;
            background-color: #28a745;
            color: white;
            cursor: pointer;
            font-size: 1rem;
        }
        #admin-form, #otp-step-2 {
            display: none;
        }
    </style>
    <div class="auth-modal">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>Login to EduPay</h2>
            <div class="role-selector">
                <button id="parent-role-btn" class="active">Parent</button>
                <button id="admin-role-btn">Admin</button>
            </div>

            <!-- Parent Login Form -->
            <div id="parent-form">
                <div id="otp-step-1">
                    <div class="form-container">
                        <input type="text" id="phone-email" placeholder="Enter Email / Phone Number" required>
                        <button id="send-otp-btn">Send OTP</button>
                    </div>
                </div>
                <div id="otp-step-2">
                    <div class="form-container">
                        <input type="text" id="otp-input" placeholder="Enter OTP" required>
                        <button id="login-otp-btn">Login</button>
                    </div>
                </div>
            </div>

            <!-- Admin Login Form -->
            <div id="admin-form">
                <div class="form-container">
                    <input type="email" id="admin-email" placeholder="Admin Email" required>
                    <input type="password" id="admin-password" placeholder="Password" required>
                    <button id="login-admin-btn">Login</button>
                </div>
            </div>
        </div>
    </div>
`;

class AuthModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(authModalTemplate.content.cloneNode(true));

        this.parentBtn = this.shadowRoot.querySelector('#parent-role-btn');
        this.adminBtn = this.shadowRoot.querySelector('#admin-role-btn');
        this.parentForm = this.shadowRoot.querySelector('#parent-form');
        this.adminForm = this.shadowRoot.querySelector('#admin-form');

        this.otpStep1 = this.shadowRoot.querySelector('#otp-step-1');
        this.otpStep2 = this.shadowRoot.querySelector('#otp-step-2');
        this.sendOtpBtn = this.shadowRoot.querySelector('#send-otp-btn');
    }

    connectedCallback() {
        this.parentBtn.addEventListener('click', () => this.switchRole('parent'));
        this.adminBtn.addEventListener('click', () => this.switchRole('admin'));
        this.sendOtpBtn.addEventListener('click', () => this.handleSendOtp());

        // Logic to show/hide modal can be triggered from outside
        this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => {
            this.shadowRoot.querySelector('.auth-modal').classList.remove('show');
        });
    }

    switchRole(role) {
        if (role === 'parent') {
            this.parentBtn.classList.add('active');
            this.adminBtn.classList.remove('active');
            this.parentForm.style.display = 'block';
            this.adminForm.style.display = 'none';
        } else {
            this.adminBtn.classList.add('active');
            this.parentBtn.classList.remove('active');
            this.adminForm.style.display = 'block';
            this.parentForm.style.display = 'none';
        }
    }

    handleSendOtp() {
        // Here you would call your backend to send the OTP
        console.log('Sending OTP to:', this.shadowRoot.querySelector('#phone-email').value);
        alert('OTP has been sent (mock)!');
        this.otpStep1.style.display = 'none';
        this.otpStep2.style.display = 'block';
    }
}

customElements.define('auth-modal', AuthModal);

// You can add your other components like my-header, my-footer here as well.


// Example of how to show the modal from your index.js
// document.querySelector('.login-register-btn').addEventListener('click', () => {
//     document.querySelector('auth-modal').shadowRoot.querySelector('.auth-modal').classList.add('show');
// });