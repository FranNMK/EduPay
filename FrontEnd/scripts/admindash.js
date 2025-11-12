// js/dashboard-admin.js

// --- GLOBAL STATE AND MOCK DATA ---
const formatKES = (amount) => `KES ${new Intl.NumberFormat('en-KE').format(amount)}`;
const getToken = () => localStorage.getItem('edupayToken');

// Mock Data Structures
const adminOverviewData = {
    fullName: "Super Admin",
    totalRevenue: 3250000,
    activeInstitutions: 45,
    pendingVerifications: 5,
    totalUsers: 2580,
    recentActivity: [
        { time: "2025-10-14 10:30", action: "Payment Approved", user: "Admin (School A)", details: "TXN1234 verified." },
        { time: "2025-10-14 09:15", action: "New School Registered", user: "Super Admin", details: "Acme High School added." },
        { time: "2025-10-13 16:45", action: "API Update", user: "Super Admin", details: "M-Pesa credentials refreshed." }
    ]
};

let pendingVerifications = [
    { id: "TXN501", date: "2025-10-14", phone: "+254701000001", amount: 15000, status: "Pending", reason: "Callback Timeout" },
    { id: "TXN502", date: "2025-10-14", phone: "+254701000002", amount: 5000, status: "Pending", reason: "Shortcode Mismatch" },
    { id: "TXN503", date: "2025-10-13", phone: "+254701000003", amount: 45000, status: "Pending", reason: "Manual Bank Deposit" }
];

let mockSchools = [
    { id: "S001", name: "Prestige Academy", paybill: "400123", admins: 3, status: "Active" },
    { id: "S002", name: "Bright Minds School", paybill: "400456", admins: 2, status: "Active" },
    { id: "S003", name: "Coastal University", paybill: "400789", admins: 1, status: "Inactive" }
];

let mockUsers = [
    { id: "U001", name: "Jane Doe", role: "Super Admin", linked: "EduPay Platform", status: "Active" },
    { id: "U002", name: "Mark Smith", role: "School Admin", linked: "Prestige Academy", status: "Active" },
    { id: "U003", name: "Kevin Otieno", role: "Parent/Guardian", linked: "2 Students", status: "Active" },
    { id: "U004", name: "Sarah Mwaura", role: "School Admin", linked: "Coastal University", status: "Suspended" }
];

// --- CORE NAVIGATION AND INITIALIZATION ---

/**
 * Global function to switch content sections and dynamically load data.
 * @param {string} targetId - The ID of the section to activate (e.g., 'overview').
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

    // 3. Trigger specific data fetching/rendering
    switch (targetId) {
        case 'overview':
            fetchAdminDashboardData();
            break;
        case 'verification':
            fetchVerificationQueue();
            break;
        case 'reports':
            initReportsSection();
            break;
        case 'schools':
            fetchSchools();
            break;
        case 'users':
            fetchUsers();
            break;
        case 'settings':
            // Settings are static forms, no API fetch needed initially
            break;
    }
}

/**
 * Loads the main admin overview data and stats.
 */
async function fetchAdminDashboardData() {
    // --- Live Preview Guard ---
    // For development, if we're on admin.html and there's no token,
    // we'll proceed with mock data instead of redirecting.
    const isPreviewMode = window.location.pathname.includes('admin.html');
    const token = getToken();

    if (!token && !isPreviewMode) {
        // If not in preview mode and no token, redirect to the actual login page.
        window.location.href = '../../../Backend/frontend/index.html';
        return;
    }

    // Populate Welcome Message and Overview Stats
    document.getElementById('welcome-admin').textContent = `Welcome, ${adminOverviewData.fullName}!`;
    document.getElementById('stat-total-revenue').textContent = formatKES(adminOverviewData.totalRevenue);
    document.getElementById('stat-active-schools').textContent = `${adminOverviewData.activeInstitutions} Schools`;
    document.getElementById('stat-pending-payments').textContent = adminOverviewData.pendingVerifications;
    document.getElementById('stat-total-users').textContent = adminOverviewData.totalUsers;

    // Populate Recent Activity
    const tbody = document.getElementById('admin-recent-activity-body');
    if (tbody) {
        tbody.innerHTML = '';
        adminOverviewData.recentActivity.forEach(activity => {
            const row = `
                <tr>
                    <td>${activity.time}</td>
                    <td>${activity.action}</td>
                    <td>${activity.user}</td>
                    <td>${activity.details}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }
}

// --- 2. PAYMENT VERIFICATION LOGIC ---

async function fetchVerificationQueue() {
    const tbody = document.getElementById('verification-queue-body');
    if (!tbody) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500)); 

    if (pendingVerifications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No pending verifications.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    pendingVerifications.forEach(payment => {
        const row = `
            <tr>
                <td>${payment.id}</td>
                <td>${new Date(payment.date).toLocaleDateString()}</td>
                <td>${payment.phone}</td>
                <td>${formatKES(payment.amount)}</td>
                <td class="status-pending">${payment.status} (${payment.reason})</td>
                <td>
                    <button class="small-cta accent-green-bg" onclick="handleVerificationAction('${payment.id}', 'approve')">Approve</button>
                    <button class="small-cta secondary-cta" onclick="handleVerificationAction('${payment.id}', 'reject')">Reject</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function handleVerificationAction(id, action) {
    // 1. Simulate API call to process verification
    alert(`SIMULATION: Transaction ${id} ${action.toUpperCase()}D.`);
    
    // 2. Update mock data (filter out the processed item)
    pendingVerifications = pendingVerifications.filter(p => p.id !== id);
    
    // 3. Update overview count
    adminOverviewData.pendingVerifications = pendingVerifications.length;

    // 4. Re-render the queue
    fetchVerificationQueue();
    // 5. Re-render overview stats
    fetchAdminDashboardData();
}

// --- 3. REPORTS & ANALYTICS LOGIC ---

function initReportsSection() {
    // This is where a chart library (like Chart.js) would be initialized.
    const placeholder = document.getElementById('chart-placeholder');
    if (placeholder) {
        placeholder.textContent = 'A revenue trend line chart would be dynamically rendered here using Chart.js or D3.js.';
        placeholder.style.textAlign = 'center';
    }
}

// Reports button listener (Mocked)
document.querySelector('#reports .secondary-cta').addEventListener('click', () => {
    const reportType = document.getElementById('report-type').value;
    const start = document.getElementById('report-start-date').value;
    const end = document.getElementById('report-end-date').value;
    alert(`SIMULATION: Generating report type "${reportType}" from ${start || 'Start'} to ${end || 'End'}.`);
});


// --- 4. SCHOOL MANAGEMENT LOGIC ---

async function fetchSchools(searchTerm = '') {
    const tbody = document.getElementById('school-list-body');
    const countElement = document.getElementById('school-count');
    if (!tbody || !countElement) return;
    
    // Simulate filtering
    const schools = mockSchools.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.paybill.includes(searchTerm)
    );

    countElement.textContent = schools.length;
    tbody.innerHTML = '';

    if (schools.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No schools found.</td></tr>';
        return;
    }

    schools.forEach(school => {
        const statusClass = school.status === 'Active' ? 'status-success' : 'status-failed';
        const row = `
            <tr>
                <td>${school.name}</td>
                <td>${school.paybill}</td>
                <td>${school.admins}</td>
                <td>
                    <span class="${statusClass}" style="font-weight: 600;">${school.status}</span>
                    <button class="small-cta secondary-cta" onclick="toggleSchoolStatus('${school.id}', '${school.status}')">Toggle</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

document.getElementById('school-search').addEventListener('input', (e) => {
    fetchSchools(e.target.value);
});

function toggleSchoolStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    alert(`SIMULATION: School ${id} status toggled to ${newStatus}.`);
    // Update mock data
    const school = mockSchools.find(s => s.id === id);
    if (school) school.status = newStatus;
    fetchSchools(document.getElementById('school-search').value);
}

document.getElementById('add-school-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('school-name').value;
    const paybill = document.getElementById('school-paybill').value;
    const statusElement = document.getElementById('add-school-status');

    statusElement.textContent = 'Registering...';
    statusElement.style.color = 'orange';

    // Simulate API call and success
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const newSchoolId = `S${Math.floor(Math.random() * 1000)}`;
    mockSchools.push({ id: newSchoolId, name, paybill, admins: 0, status: 'Active' });

    statusElement.textContent = `SUCCESS: ${name} registered with ID ${newSchoolId}.`;
    statusElement.style.color = 'green';
    e.target.reset();
    fetchSchools(); // Refresh the list
    fetchAdminDashboardData(); // Update stats
});

// --- 5. USER MANAGEMENT LOGIC ---

async function fetchUsers(filters = {}) {
    const tbody = document.getElementById('user-list-body');
    if (!tbody) return;
    
    // Simulate filtering
    let users = mockUsers.filter(u => {
        if (filters.search && !u.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.role && filters.role !== u.role.toLowerCase().replace(/[^a-z0-9]/g, '-')) return false;
        return true;
    });

    tbody.innerHTML = '';
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No users found matching criteria.</td></tr>';
        return;
    }

    users.forEach(user => {
        const statusClass = user.status === 'Active' ? 'status-success' : 'status-failed';
        const row = `
            <tr>
                <td>${user.name}</td>
                <td>${user.role}</td>
                <td>${user.linked}</td>
                <td>
                    <span class="${statusClass}" style="font-weight: 600;">${user.status}</span>
                </td>
                <td>
                    <button class="small-cta secondary-cta" onclick="editUser('${user.id}')">Edit</button>
                    <button class="small-cta accent-pink-bg" onclick="suspendUser('${user.id}', '${user.status}')">${user.status === 'Active' ? 'Suspend' : 'Activate'}</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

document.querySelector('#users .secondary-cta').addEventListener('click', () => {
    const search = document.getElementById('user-search').value;
    const role = document.getElementById('user-filter-role').value;

    fetchUsers({ search, role });
});

function editUser(id) {
    alert(`SIMULATION: Opening edit modal for user ${id}.`);
}

function suspendUser(id, currentStatus) {
    const action = currentStatus === 'Active' ? 'Suspend' : 'Activate';
    alert(`SIMULATION: User ${id} set to ${action}.`);
    // Update mock data
    const user = mockUsers.find(u => u.id === id);
    if (user) user.status = (action === 'Suspend' ? 'Suspended' : 'Active');
    fetchUsers({ 
        search: document.getElementById('user-search').value, 
        role: document.getElementById('user-filter-role').value 
    });
}


// --- 6. PLATFORM SETTINGS LOGIC ---

document.getElementById('api-settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const statusElement = document.getElementById('api-status');
    statusElement.textContent = 'Updating API credentials (Simulated)...';
    statusElement.style.color = 'orange';

    setTimeout(() => {
        statusElement.textContent = 'SUCCESS: M-Pesa credentials updated and verified.';
        statusElement.style.color = 'green';
    }, 2000);
});

document.getElementById('default-settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fee = document.getElementById('default-fee-percentage').value;
    const statusElement = document.getElementById('defaults-status');
    statusElement.textContent = 'Saving defaults (Simulated)...';
    statusElement.style.color = 'orange';

    setTimeout(() => {
        statusElement.textContent = `SUCCESS: Default transaction fee set to ${fee}%.`;
        statusElement.style.color = 'green';
    }, 2000);
});


// --- INITIALIZATION AND EVENT LISTENERS ---

function initAdminDashboard() {
    // Check if the current user is an admin before proceeding (mocked)
    const isAdmin = true; // Assume true for this file
    if (!isAdmin) {
        window.location.href = 'index.html';
        return;
    }

    // 1. Attach navigation listeners
    const navLinks = document.querySelectorAll('.dashboard-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            switchContent(targetId);
        });
    });

    // 2. Load the initial content section (Overview)
    fetchAdminDashboardData();
    switchContent('overview');
}

document.addEventListener('DOMContentLoaded', initAdminDashboard);