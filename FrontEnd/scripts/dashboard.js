// js/dashboard.js

// Mock data structure to simulate student fee details fetched from the API
let studentsData = {}; 
let currentStudentId = null;
let currentDueAmount = 0;

// Global function to switch content sections
const switchContent = (targetId) => {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active-content');
        if (section.id === targetId) {
            section.classList.add('active-content');
        }
    });
}


const formatKES = (amount) => `KES ${new Intl.NumberFormat('en-KE').format(amount)}`;
const getToken = () => localStorage.getItem('edupayToken');

// --- 1. CORE API FETCHER ---
async function fetchDashboardData() {
    const token = getToken();
    if (!token) {
        // Correct the redirect path to go up one level
        window.location.href = '../pay-fees.html';
        return;
    }

    try {
        // --- MOCK DATA FOR FRONTEND DEVELOPMENT ---
        // We are commenting out the real API calls and using mock data instead.
        // This prevents the "Cannot GET" error and allows the dashboard to display.
        
        const overviewData = {
            fullName: "Jane Doe",
            institutionsLinked: 2,
            totalPaidThisYear: 150000,
            nextFeeDue: { amount: 25000, date: "2025-10-15" },
            recentPayments: [
                { date: "2025-09-01", studentName: "John Doe", schoolName: "Prestige Academy", amount: 50000, status: "Completed" },
                { date: "2025-08-28", studentName: "Emily Doe", schoolName: "Bright Minds School", amount: 25000, status: "Completed" }
            ]
        };

        const studentsList = [
            { _id: "student1", fullName: "John Doe", admissionNumber: "1234", schoolName: "Prestige Academy", feesTotal: 75000, feesDue: 25000, lastPaymentDate: "2025-09-01" },
            { _id: "student2", fullName: "Emily Doe", admissionNumber: "5678", schoolName: "Bright Minds School", feesTotal: 50000, feesDue: 0, lastPaymentDate: "2025-08-28" }
        ];

        // --- REAL API CALLS (COMMENTED OUT) ---
        // const overviewResponse = await fetch('/api/parent/dashboard', {
        //     headers: { 'Authorization': `Bearer ${token}` }
        // });
        // const studentsResponse = await fetch('/api/parent/students', {
        //      headers: { 'Authorization': `Bearer ${token}` }
        // });
        // if (overviewResponse.status === 401 || studentsResponse.status === 401) {
        //      throw new Error('Session expired.');
        // }
        // const overviewData = await overviewResponse.json();
        // const studentsList = await studentsResponse.json();
        // --- END OF MOCK DATA SECTION ---
        
        // Populate Welcome Message and Overview Stats
        const welcomeUser = document.getElementById('welcome-user');
        if (welcomeUser) welcomeUser.textContent = `Welcome, ${overviewData.fullName || 'Parent'}!`;

        const statInstitutions = document.getElementById('stat-institutions');
        if (statInstitutions) statInstitutions.textContent = `${overviewData.institutionsLinked || 0} Schools`;

        const statTotalPaid = document.getElementById('stat-total-paid');
        if (statTotalPaid) statTotalPaid.textContent = formatKES(overviewData.totalPaidThisYear || 0);

        const statNextDue = document.getElementById('stat-next-due');
        if (statNextDue) statNextDue.innerHTML = `${formatKES(overviewData.nextFeeDue.amount)} <br> (${new Date(overviewData.nextFeeDue.date).toLocaleDateString()})`;
        
        // Populate Recent Activity
        const tbody = document.getElementById('recent-payments-body');
        if (tbody) {
            tbody.innerHTML = '';
            overviewData.recentPayments.forEach(payment => {
                const statusClass = payment.status === 'Completed' ? 'status-success' : 'status-pending';
                const row = `
                    <tr>
                        <td>${new Date(payment.date).toLocaleDateString()}</td>
                        <td>${payment.studentName}</td>
                        <td>${payment.schoolName}</td>
                        <td>${formatKES(payment.amount)}</td>
                        <td class="${statusClass}">${payment.status}</td>
                        <td><a href="#" target="_blank">View</a></td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            console.warn('Element with ID "recent-payments-body" not found.');
        }

        // Store and Populate Students Dropdown
        const studentSelect = document.getElementById('student-select');
        if (studentSelect) {
            studentSelect.innerHTML = '<option value="">-- Choose Student --</option>';
            studentsList.forEach(student => {
                // Index the student data for quick lookup in a global object
                studentsData[student._id] = student; 
                const option = document.createElement('option');
                option.value = student._id;
                option.textContent = `${student.fullName} (ADM ${student.admissionNumber} - ${student.schoolName})`;
                studentSelect.appendChild(option);
            });
        } else {
            console.warn('Element with ID "student-select" not found.');
        }

        // Attach listeners after data load
        attachDashboardListeners();

        // Ensure the initial overview section is displayed after everything is loaded
        switchContent('overview');

    } catch (error) {
        console.error('CRITICAL ERROR: Dashboard initialization failed!', error);
        localStorage.removeItem('edupayToken');
        alert('Authentication failed or session expired. Please log in.');
        window.location.href = '../pay-fees.html';
    }
}

// --- 2. PAYMENT STEP LOGIC ---
function attachDashboardListeners() {
    // A. Dashboard Navigation Logic
    const navLinks = document.querySelectorAll('.dashboard-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Fetch data for tabs only when they are clicked for the first time
            if (targetId === 'students' && !link.dataset.loaded) {
                fetchLinkedStudents();
                link.dataset.loaded = true;
            } else if (targetId === 'profile' && !link.dataset.loaded) {
                fetchProfileData();
                link.dataset.loaded = true;
            }

            switchContent(targetId);
        });
    });

    // C. Pay Fees Step Flow Logic
    const payFeesSection = document.getElementById('pay-fees'); // Check if this exists
    if (payFeesSection) {
        const paySteps = payFeesSection.querySelectorAll('.payment-step');
        const finalAmountInput = document.getElementById('payment-amount');
        const studentSelect = document.getElementById('student-select');
        const continueBtnStep1 = document.getElementById('continue-to-amount');
        const startNewPaymentBtn = document.getElementById('start-new-payment-btn');

        const showStep = (targetId) => {
            paySteps.forEach(step => {
                step.classList.remove('active-step');
                if (step.id === targetId) {
                    step.classList.add('active-step');
                    // Ensure scroll to top of form when step changes
                    payFeesSection.scrollIntoView({ behavior: 'smooth' }); 
                }
            });
        }

        // Step 1: Handle Student Selection
        if (studentSelect) {
            studentSelect.addEventListener('change', (e) => {
                currentStudentId = e.target.value;
                const student = studentsData[currentStudentId];

                const summaryStudentName = document.getElementById('summary-student-name');
                const summaryTotalFees = document.getElementById('summary-total-fees');
                const summaryDueAmount = document.getElementById('summary-due-amount');
                const summaryLastPayment = document.getElementById('summary-last-payment');

                if (student) {
                    if (summaryStudentName) summaryStudentName.textContent = student.fullName;
                    if (summaryTotalFees) summaryTotalFees.textContent = formatKES(student.feesTotal || 0);
                    if (summaryDueAmount) summaryDueAmount.textContent = formatKES(student.feesDue);
                    if (summaryLastPayment) summaryLastPayment.textContent = student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString() : 'N/A';
                    
                    currentDueAmount = student.feesDue;
                    
                    // Update inputs for Step 2
                    const amountRemainingBalance = document.getElementById('amount-remaining-balance');
                    if (amountRemainingBalance) amountRemainingBalance.textContent = formatKES(currentDueAmount);
                    if (finalAmountInput) {
                        finalAmountInput.setAttribute('max', currentDueAmount);
                        finalAmountInput.value = currentDueAmount > 0 ? currentDueAmount : ''; // Pre-fill or clear
                    }
                    if (continueBtnStep1) continueBtnStep1.disabled = (currentDueAmount <= 0);

                } else {
                    // Reset if nothing is selected
                    if (summaryStudentName) summaryStudentName.textContent = '...';
                    if (continueBtnStep1) continueBtnStep1.disabled = true;
                }
            });
        } else {
            console.warn('Element with ID "student-select" not found for event listener.');
        }

        // Step Transition Handlers
        payFeesSection.querySelectorAll('.next-step-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const nextStepId = btn.getAttribute('data-next');
                
                if (nextStepId === 'step-3') {
                    const amount = finalAmountInput ? parseFloat(finalAmountInput.value) : 0;
                    if (amount <= 0 || amount > currentDueAmount) {
                         alert("Please enter a valid amount (between KES 100 and the due balance).");
                         return;
                    }
                    const finalAmountElement = document.getElementById('final-amount');
                    if (finalAmountElement) finalAmountElement.textContent = formatKES(amount);
                }
                showStep(nextStepId);
            });
        });

        payFeesSection.querySelectorAll('.prev-step-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                showStep(btn.getAttribute('data-prev'));
            });
        });
        
        // Start New Payment Button
        if (startNewPaymentBtn) {
            startNewPaymentBtn.addEventListener('click', () => {
                // Reset form state and return to step 1
                showStep('step-1');
                if (studentSelect) studentSelect.value = '';
                currentStudentId = null;
                const summaryStudentName = document.getElementById('summary-student-name');
                if (summaryStudentName) summaryStudentName.textContent = '...';
            });
        } else {
            console.warn('Element with ID "start-new-payment-btn" not found for event listener.');
        }

        // D. Final Pay Button Logic (API Call Simulation)
        const finalPayBtn = document.getElementById('final-pay-btn');
        if (finalPayBtn) {
            finalPayBtn.addEventListener('click', async () => {
                const amount = finalAmountInput ? parseFloat(finalAmountInput.value) : 0;
                const selectedGateway = document.querySelector('input[name="gateway"]:checked');
                const gatewayValue = selectedGateway ? selectedGateway.value : '';
                
                if (!currentStudentId || amount <= 0) {
                    alert("Error: Please select a student and enter a valid amount.");
                    return;
                }
                
                showStep('step-4');
                const statusElement = document.getElementById('payment-status');
                if (statusElement) statusElement.textContent = `Initiating KES ${new Intl.NumberFormat('en-KE').format(amount)} payment via ${gatewayValue.toUpperCase()}...`;

                try {
                    // --- API CALL 3: INITIATE PAYMENT ---
                    // This part is still commented out, so it won't actually make a network request.
                    // We'll simulate success for now.
                    
                    // Simulate a successful API response
                    const result = { message: 'Payment initiated successfully (simulated).' };
                    const responseOk = true; // Simulate response.ok
                    
                    if (responseOk) {
                        // Successful API initiation (e.g., STK Push sent)
                        if (statusElement) statusElement.textContent = `Success! ${result.message || 'Check your phone now to complete the transaction.'}`;
                        
                        // Set a timer to visually indicate success completion (in real app, this is done by M-Pesa Callback)
                        setTimeout(() => {
                            if (statusElement) statusElement.textContent = `Payment Verified! KES ${new Intl.NumberFormat('en-KE').format(amount)} successfully paid. Digital receipt sent to your email.`;
                            // Redirect back to overview after successful payment simulation
                            switchContent('overview'); 
                            // Re-fetch data to update balances
                            fetchDashboardData(); 
                        }, 10000); // 10 seconds to simulate human confirmation time
                        
                    } else {
                        if (statusElement) statusElement.textContent = result.message || 'Payment Initiation Failed: ${result.message || 'A server error occurred.'}';
                        // Allow user to try again
                        const startNewPaymentBtnElement = document.getElementById('start-new-payment-btn');
                        if (startNewPaymentBtnElement) startNewPaymentBtnElement.style.display = 'block';
                    }

                } catch (error) {
                    if (statusElement) statusElement.textContent = `Network Error. Please try again.`;
                    const startNewPaymentBtnElement = document.getElementById('start-new-payment-btn');
                    if (startNewPaymentBtnElement) startNewPaymentBtnElement.style.display = 'block';
                    console.error(error);
                }
            });
        } else {
            console.warn('Element with ID "final-pay-btn" not found for event listener.');
        }
    } else {
        console.warn('Element with ID "pay-fees" not found. Pay Fees flow listeners not attached.');
    }

} // End of attachDashboardListeners

// Initialize data fetching when the page loads
document.addEventListener('DOMContentLoaded', fetchDashboardData);

// Function to fetch and render full payment history
async function fetchPaymentHistory(filters = {}) {
    const token = getToken();
    const tbody = document.getElementById('full-payment-history-body');
    tbody.innerHTML = '<tr><td colspan="6">Loading payment history...</td></tr>';
    
    // Construct query string from filters object
    const params = new URLSearchParams(filters).toString();
    
    try {
        const response = await fetch(`/api/parent/history?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status !== 200) throw new Error('Failed to fetch history.');
        const history = await response.json();
        
        tbody.innerHTML = '';
        if (history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No payments found matching your criteria.</td></tr>';
            return;
        }

        history.forEach(payment => {
            const statusClass = payment.status === 'Completed' ? 'status-success' : payment.status === 'Pending' ? 'status-pending' : 'status-failed';
            const row = `
                <tr>
                    <td>${new Date(payment.date).toLocaleDateString()}</td>
                    <td>${payment.studentName}</td>
                    <td>${payment.schoolName}</td>
                    <td>${formatKES(payment.amount)}</td>
                    <td class="${statusClass}">${payment.status}</td>
                    <td><a href="/api/receipt/${payment.id}" target="_blank" class="download-link">Download</a></td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (error) {
        console.error('History fetch error:', error);
        tbody.innerHTML = '<tr><td colspan="6" style="color: red;">Error loading history. Please try again.</td></tr>';
    }
}

// Add the filter logic to the event listeners section in js/dashboard.js
document.getElementById('apply-history-filters').addEventListener('click', () => {
    const search = document.getElementById('history-search').value;
    const status = document.getElementById('history-filter-status').value;
    const date = document.getElementById('history-filter-date').value;

    const filters = {};
    if (search) filters.search = search;
    if (status) filters.status = status;
    if (date) filters.date = date;
    
    fetchPaymentHistory(filters);
});

// Ensure fetchPaymentHistory() runs when the #history tab is clicked (add this to the switchContent function in dashboard.js)
// NOTE: You'll need to modify the existing switchContent function in dashboard.js to include this call:
/*
const switchContent = (targetId) => {
    // ... existing section switching logic ...
    if (targetId === 'history') {
        fetchPaymentHistory();
    }
    // ...
}
*/

// Function to fetch and render student cards
async function fetchLinkedStudents() {
    const token = getToken();
    // Mock data for students
    const students = [
        { _id: "student1", fullName: "John Doe", admissionNumber: "1234", schoolName: "Prestige Academy", feesTotal: 75000, feesDue: 25000, lastPaymentDate: "2025-09-01", class: "Grade 5" },
        { _id: "student2", fullName: "Emily Doe", admissionNumber: "5678", schoolName: "Bright Minds School", feesTotal: 50000, feesDue: 0, lastPaymentDate: "2025-08-28", class: "Grade 3" }
    ];
    const container = document.getElementById('students-list-container');
    container.innerHTML = '<div class="student-card placeholder-card"><i class="fas fa-spinner fa-spin"></i> Loading students...</div>';
    
    try {
        const response = await fetch('/api/parent/linked-students', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // if (response.status !== 200) throw new Error('Failed to fetch students.'); // Commented out for mock data
        // const students = await response.json(); // Commented out for mock data
        
        container.innerHTML = '';
        if (students.length === 0) {
            container.innerHTML = '<p class="info-message">You have no students linked to this account. Please contact your school admin for registration.</p>';
            return;
        }

        students.forEach(student => {
            const card = document.createElement('div');
            card.classList.add('student-card');
            
            const statusColor = student.feesDue > 0 ? 'red' : 'green';
            const statusText = student.feesDue > 0 ? 'Balance Due' : 'Fees Cleared';
            
            card.innerHTML = `
                <div class="student-header">
                    <i class="fas fa-user-graduate"></i>
                    <h3>${student.fullName}</h3>
                </div>
                <p><strong>School:</strong> ${student.schoolName}</p>
                <p><strong>Admission No:</strong> ${student.admissionNumber}</p>
                <p><strong>Class/Grade:</strong> ${student.class || 'N/A'}</p>
                <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 600;">${statusText}</span></p>
                <p><strong>Fees Due:</strong> ${formatKES(student.feesDue)}</p>
                <button class="cta-button small-cta" onclick="activatePayFees('${student._id}')">Pay Now</button>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Students fetch error:', error);
        container.innerHTML = '<p style="color: red;">Error loading student list.</p>';
    }
}

// Global helper function to link back to the payment flow
function activatePayFees(studentId) {
    // 1. Activate the Pay Fees tab
    document.querySelector('.dashboard-nav a[href="#pay-fees"]').click();
    // 2. Select the student in the dropdown (requires setting the value)
    document.getElementById('student-select').value = studentId;
    // 3. Trigger the change event to load the fee summary
    document.getElementById('student-select').dispatchEvent(new Event('change'));
}

// Function to fetch and pre-fill profile data
async function fetchProfileData() {
    const token = getToken();
    
    // Mock data for profile
    const user = {
        fullName: "Jane Doe",
        phoneNumber: "+254712345678",
        email: "jane.doe@example.com"
    };

    try {
        // const response = await fetch('/api/parent/profile', { // Commented out for mock data
        //     headers: { 'Authorization': `Bearer ${token}` }
        // });
        // if (response.status !== 200) throw new Error('Failed to fetch profile.'); // Commented out for mock data
        // const user = await response.json(); // Commented out for mock data
        
        document.getElementById('profile-name').value = user.fullName || '';
        document.getElementById('profile-phone').value = user.phoneNumber || '';
        document.getElementById('profile-email').value = user.email || '';

    } catch (error) {
        console.error('Profile fetch error:', error);
    }
}

// Function to handle profile update form
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    // This form will not work without a backend.
    alert('Profile update is simulated. No actual changes will be saved without a backend.');
    const token = getToken();
    const statusElement = document.getElementById('profile-status');
    statusElement.textContent = 'Updating...';
    statusElement.style.color = 'orange';

    const updateData = {
        fullName: document.getElementById('profile-name').value,
        email: document.getElementById('profile-email').value
    };

    try { // Simulate success
        // const response = await fetch('/api/parent/profile', { // Commented out for mock data
        //     method: 'POST',
        //     headers: { 
        //         'Content-Type': 'application/json', 
        //         'Authorization': `Bearer ${token}` 
        //     },
        //     body: JSON.stringify(updateData)
        // });
        // const result = await response.json(); // Commented out for mock data
        
        // Simulate success
        const result = { message: 'Profile updated successfully (simulated)!' };
        const responseOk = true;

        if (responseOk) {
            if (statusElement) statusElement.textContent = result.message || 'Profile updated successfully!';
            if (statusElement) statusElement.style.color = 'green';
        } else {
            if (statusElement) statusElement.textContent = result.message || 'Update failed.';
            if (statusElement) statusElement.style.color = 'red';
        }
    } catch (error) {
        statusElement.textContent = 'Network error during update.';
        statusElement.style.color = 'red';
    }
});

// Function to handle password change form
document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    // This form will not work without a backend.
    alert('Password change is simulated. No actual changes will be saved without a backend.');
    const token = getToken();
    const statusElement = document.getElementById('password-status');
    statusElement.textContent = 'Changing password...';
    statusElement.style.color = 'orange';

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        statusElement.textContent = 'New passwords do not match.';
        statusElement.style.color = 'red';
        return;
    }

    try { // Simulate success
        // const response = await fetch('/api/parent/change-password', { // Commented out for mock data
        //     method: 'POST',
        //     headers: { 
        //         'Content-Type': 'application/json', 
        //         'Authorization': `Bearer ${token}` 
        //     },
        //     body: JSON.stringify({ currentPassword, newPassword })
        // });
        // const result = await response.json(); // Commented out for mock data

        // Simulate success
        const result = { message: 'Password changed successfully (simulated)!' };
        const responseOk = true;

        if (responseOk) {
            if (statusElement) statusElement.textContent = result.message || 'Password changed successfully! Please log in again.';
            if (statusElement) statusElement.style.color = 'green';
            // Clear form fields
            e.target.reset(); 
            // Optional: Force logout for security (commented out for now)
            // setTimeout(() => { localStorage.removeItem('edupayToken'); window.location.href = 'pay-fees.html'; }, 3000);
        } else {
            statusElement.textContent = result.message || 'Password change failed. Check current password.';
            statusElement.style.color = 'red';
        }
    } catch (error) {
        statusElement.textContent = 'Network error during password change.';
        statusElement.style.color = 'red';
    }
});

// Add CSS to dashboard.css for profile layout
/*

*/