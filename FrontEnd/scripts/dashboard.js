// js/dashboard.js

// --- GLOBAL STATE AND HELPERS ---
let studentsData = {}; 
let currentStudentId = null;
let currentDueAmount = 0;

// Utility functions
const formatKES = (amount) => `KES ${new Intl.NumberFormat('en-KE').format(amount)}`;
const getToken = () => localStorage.getItem('edupayToken');


/**
 * Global function to switch content sections and trigger data loading for non-overview tabs.
 * @param {string} targetId - The ID of the section to activate (e.g., 'overview', 'history').
 */
const switchContent = (targetId) => {
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.dashboard-nav a');

    // 1. Switch visibility
    sections.forEach(section => {
        section.classList.remove('active-content');
        if (section.id === targetId) {
            section.classList.add('active-content');
        }
    });

    // 2. Update nav links
    navLinks.forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('href').substring(1) === targetId) {
             l.classList.add('active');
        }
    });

    // 3. Trigger data fetching based on the active tab
    if (targetId === 'overview') {
        // Re-fetch to ensure stats are fresh (especially after a payment)
        fetchDashboardData(); 
    } else if (targetId === 'history') {
        fetchPaymentHistory();
    } else if (targetId === 'students') {
        fetchLinkedStudents();
    } else if (targetId === 'profile') {
        fetchProfileData();
    }
}


// --- 1. CORE API FETCHER (OVERVIEW & STUDENTS DROPDOWN) ---
async function fetchDashboardData() {
    const token = getToken();
    // --- Live Preview Guard ---
    // For development, if we're on dash_pare.html and there's no token,
    // we'll proceed with mock data instead of redirecting.
    const isPreviewMode = window.location.pathname.includes('dash_pare.html');

    if (!token) {
        // If not in preview mode, redirect to the actual login page.
        if (!isPreviewMode) window.location.href = '../../../Backend/frontend/index.html';
        return;
    }

    try {
        // --- MOCK DATA FOR FRONTEND DEVELOPMENT ---
        const overviewData = {
            fullName: "Jane Doe",
            institutionsLinked: 2,
            totalPaidThisYear: 150000,
            nextFeeDue: { amount: 25000, date: "2025-10-15" },
            recentPayments: [
                { id: "TX123", date: "2025-09-01", studentName: "John Doe", schoolName: "Prestige Academy", amount: 50000, status: "Completed" },
                { id: "TX124", date: "2025-08-28", studentName: "Emily Doe", schoolName: "Bright Minds School", amount: 25000, status: "Completed" }
            ]
        };

        const studentsList = [
            { _id: "student1", fullName: "John Doe", admissionNumber: "1234", schoolName: "Prestige Academy", feesTotal: 75000, feesDue: 25000, lastPaymentDate: "2025-09-01", class: "Grade 5" },
            { _id: "student2", fullName: "Emily Doe", admissionNumber: "5678", schoolName: "Bright Minds School", feesTotal: 50000, feesDue: 0, lastPaymentDate: "2025-08-28", class: "Grade 3" }
        ];

        
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
                        <td><a href="/api/receipt/${payment.id}" target="_blank">View</a></td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }

        // Store and Populate Students Dropdown
        const studentSelect = document.getElementById('student-select');
        if (studentSelect) {
            studentSelect.innerHTML = '<option value="">-- Choose Student --</option>';
            studentsList.forEach(student => {
                // Index the student data for quick lookup
                studentsData[student._id] = student; 
                const option = document.createElement('option');
                option.value = student._id;
                option.textContent = `${student.fullName} (ADM ${student.admissionNumber} - ${student.schoolName})`;
                studentSelect.appendChild(option);
            });
        }

        // Attach listeners after data load
        attachDashboardListeners();
        // Set the initial active content (in case the user didn't have one set)
        const initialActiveLink = document.querySelector('.dashboard-nav a.active');
        if (initialActiveLink) {
             switchContent(initialActiveLink.getAttribute('href').substring(1));
        } else {
             switchContent('overview');
        }


    } catch (error) {
        console.error('CRITICAL ERROR: Dashboard initialization failed!', error);
        localStorage.removeItem('edupayToken');
        alert('Authentication failed or session expired. Please log in.');
        window.location.href = '../../../Backend/frontend/index.html'; // Redirect to the correct login page
    }
}


// --- 2. PAYMENT STEP LOGIC AND LISTENERS ---

function attachDashboardListeners() {
    // C. Pay Fees Step Flow Logic
    const payFeesSection = document.getElementById('pay-fees'); 
    if (!payFeesSection) return; // Exit if Pay Fees section is missing

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
                payFeesSection.scrollIntoView({ behavior: 'smooth' }); 
            }
        });
    }

    // Handle Student Selection
    if (studentSelect) {
        studentSelect.addEventListener('change', (e) => {
            currentStudentId = e.target.value;
            const student = studentsData[currentStudentId];

            if (student) {
                document.getElementById('summary-student-name').textContent = student.fullName;
                document.getElementById('summary-total-fees').textContent = formatKES(student.feesTotal || 0);
                document.getElementById('summary-due-amount').textContent = formatKES(student.feesDue);
                document.getElementById('summary-last-payment').textContent = student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString() : 'N/A';
                
                currentDueAmount = student.feesDue;
                
                document.getElementById('amount-remaining-balance').textContent = formatKES(currentDueAmount);
                if (finalAmountInput) {
                    finalAmountInput.setAttribute('max', currentDueAmount);
                    finalAmountInput.value = currentDueAmount > 0 ? currentDueAmount : ''; 
                }
                if (continueBtnStep1) continueBtnStep1.disabled = (currentDueAmount <= 0);

            } else {
                document.getElementById('summary-student-name').textContent = '...';
                if (continueBtnStep1) continueBtnStep1.disabled = true;
            }
        });
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
            showStep('step-1');
            if (studentSelect) studentSelect.value = '';
            currentStudentId = null;
            const summaryStudentName = document.getElementById('summary-student-name');
            if (summaryStudentName) summaryStudentName.textContent = '...';
        });
    }

    // Final Pay Button Logic (API Call Simulation)
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
                // --- API CALL 3: PAYMENT INITIATION (SIMULATED) ---
                const responseOk = true; 
                const result = { message: 'Payment initiated successfully (simulated).' };
                
                if (responseOk) {
                    if (statusElement) statusElement.textContent = `Success! ${result.message || 'Check your phone now to complete the transaction.'}`;
                    
                    // Simulate payment completion
                    setTimeout(() => {
                        if (statusElement) statusElement.textContent = `Payment Verified! KES ${new Intl.NumberFormat('en-KE').format(amount)} successfully paid. Digital receipt sent to your email.`;
                        switchContent('overview'); 
                    }, 10000); 
                    
                } else {
                    if (statusElement) statusElement.textContent = `Payment Initiation Failed: ${result.message || 'A server error occurred.'}`;
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
    }

} // End of attachDashboardListeners


// --- 3. PAYMENT HISTORY LOGIC ---

async function fetchPaymentHistory(filters = {}) {
    // const token = getToken(); // Not used for mock data
    const tbody = document.getElementById('full-payment-history-body');
    if (!tbody) return;
    
    // --- MOCK HISTORY DATA ---
    const mockHistory = [
        { id: "TX123", date: "2025-09-01", studentName: "John Doe", schoolName: "Prestige Academy", amount: 50000, status: "Completed" },
        { id: "TX124", date: "2025-08-28", studentName: "Emily Doe", schoolName: "Bright Minds School", amount: 25000, status: "Completed" },
        { id: "TX125", date: "2025-07-15", studentName: "John Doe", schoolName: "Prestige Academy", amount: 25000, status: "Pending" },
        { id: "TX126", date: "2025-07-01", studentName: "Emily Doe", schoolName: "Bright Minds School", amount: 1000, status: "Failed" },
    ];
    
    // --- MOCK FILTERING ---
    let history = mockHistory.filter(p => {
        if (filters.search && !p.studentName.toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.status && p.status !== filters.status) return false;
        if (filters.date && p.date.split('T')[0] !== filters.date) return false;
        return true;
    });

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
}

// History Filter Listener (Must be attached globally after DOMContentLoaded)
const applyFiltersButton = document.getElementById('apply-history-filters');
if (applyFiltersButton) {
    applyFiltersButton.addEventListener('click', () => {
        const search = document.getElementById('history-search').value;
        const status = document.getElementById('history-filter-status').value;
        const date = document.getElementById('history-filter-date').value;

        const filters = {};
        if (search) filters.search = search;
        if (status) filters.status = status;
        if (date) filters.date = date;
        
        fetchPaymentHistory(filters);
    });
}


// --- 4. MY STUDENTS LOGIC ---

async function fetchLinkedStudents() {
    // const token = getToken(); // Not used for mock data
    const container = document.getElementById('students-list-container');
    if (!container) return;
    
    // Mock data for students (includes class property now)
    const students = [
        { _id: "student1", fullName: "John Doe", admissionNumber: "1234", schoolName: "Prestige Academy", feesTotal: 75000, feesDue: 25000, lastPaymentDate: "2025-09-01", class: "Grade 5" },
        { _id: "student2", fullName: "Emily Doe", admissionNumber: "5678", schoolName: "Bright Minds School", feesTotal: 50000, feesDue: 0, lastPaymentDate: "2025-08-28", class: "Grade 3" }
    ];

    container.innerHTML = '<div class="student-card placeholder-card"><i class="fas fa-spinner fa-spin"></i> Loading students...</div>';
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500)); 

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
}

// Global helper function to link back to the payment flow from the 'My Students' section
function activatePayFees(studentId) {
    // 1. Activate the Pay Fees tab
    document.querySelector('.dashboard-nav a[href="#pay-fees"]').click();
    // 2. Select the student in the dropdown
    const studentSelect = document.getElementById('student-select');
    if (studentSelect) studentSelect.value = studentId;
    // 3. Trigger the change event to load the fee summary
    if (studentSelect) studentSelect.dispatchEvent(new Event('change'));
}


// --- 5. PROFILE & SETTINGS LOGIC ---

async function fetchProfileData() {
    // const token = getToken(); // Not used for mock data
    
    // Mock data for profile
    const user = {
        fullName: "Jane Doe",
        phoneNumber: "+254712345678",
        email: "jane.doe@example.com"
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    const profileName = document.getElementById('profile-name');
    const profilePhone = document.getElementById('profile-phone');
    const profileEmail = document.getElementById('profile-email');

    if (profileName) profileName.value = user.fullName || '';
    if (profilePhone) profilePhone.value = user.phoneNumber || '';
    if (profileEmail) profileEmail.value = user.email || '';
}

// Profile Update Form Listener
const profileForm = document.getElementById('profile-form');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        alert('Profile update is simulated. No actual changes will be saved without a backend.');
        // const token = getToken(); // Not used
        const statusElement = document.getElementById('profile-status');
        if (statusElement) {
             statusElement.textContent = 'Updating...';
             statusElement.style.color = 'orange';
        }

        // Simulate success
        setTimeout(() => {
            if (statusElement) {
                statusElement.textContent = 'Profile updated successfully (simulated)!';
                statusElement.style.color = 'green';
            }
        }, 1500);
    });
}

// Password Change Form Listener
const passwordForm = document.getElementById('password-form');
if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        alert('Password change is simulated. No actual changes will be saved without a backend.');
        // const token = getToken(); // Not used
        const statusElement = document.getElementById('password-status');
        
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            if (statusElement) {
                statusElement.textContent = 'New passwords do not match.';
                statusElement.style.color = 'red';
            }
            return;
        }

        if (statusElement) {
            statusElement.textContent = 'Changing password...';
            statusElement.style.color = 'orange';
        }

        // Simulate success
        setTimeout(() => {
            if (statusElement) {
                statusElement.textContent = 'Password changed successfully (simulated)! Please log in again.';
                statusElement.style.color = 'green';
            }
            e.target.reset(); 
        }, 1500);
    });
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', fetchDashboardData);