// --- Mock Data for Super Admin Dashboard ---
const mockAdminData = {
    overview: {
        totalRevenue30d: 1250000,
        activeSchools: 15,
        pendingVerifications: 3,
        totalUsers: 2500
    },
    activityLog: [
        { timestamp: "2024-05-21 14:30", action: "SCHOOL_ADDED", user: "Super Admin", details: "Greenwood High registered." },
        { timestamp: "2024-05-21 14:05", action: "PAYMENT_VERIFIED", user: "Super Admin", details: "Txn #MP24... for KES 5,000 approved." },
        { timestamp: "2024-05-21 13:50", action: "LOGIN_FAILURE", user: "Unknown", details: "Failed admin login attempt from IP 192.168.1.5" },
        { timestamp: "2024-05-21 12:00", action: "REPORT_GENERATED", user: "Super Admin", details: "Revenue Trend report for May." }
    ],
    verificationQueue: [
        { txnId: "MP240521.1405.A1B2C3", date: "2024-05-21 14:00", phone: "+254712345678", amount: 5000, status: "Pending" },
        { txnId: "BK240520.1130.D4E5F6", date: "2024-05-20 11:25", phone: "N/A (Bank)", amount: 75000, status: "Pending" },
        { txnId: "MP240519.0900.G7H8I9", date: "2024-05-19 08:55", phone: "+254722987654", amount: 12500, status: "Pending" }
    ]
};

// --- Helper Functions ---
const formatCurrency = (amount) => `KES ${new Intl.NumberFormat().format(amount)}`;

/**
 * Global function to switch content sections in the admin dashboard.
 * @param {string} targetId - The ID of the section to activate.
 */
function switchContent(targetId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active-content', section.id === targetId);
    });

    document.querySelectorAll('.dashboard-nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href').substring(1) === targetId);
    });
}

// --- DOM Population Functions ---

function populateAdminOverview(data) {
    // Populate stats cards
    document.getElementById('stat-total-revenue').textContent = formatCurrency(data.overview.totalRevenue30d);
    document.getElementById('stat-active-schools').textContent = `${data.overview.activeSchools} Schools`;
    document.getElementById('stat-pending-payments').textContent = data.overview.pendingVerifications;
    document.getElementById('stat-total-users').textContent = data.overview.totalUsers;

    // Populate recent activity log
    const activityBody = document.getElementById('admin-recent-activity-body');
    activityBody.innerHTML = '';
    data.activityLog.forEach(log => {
        activityBody.innerHTML += `
            <tr>
                <td>${log.timestamp}</td>
                <td><span class="tag action-${log.action.toLowerCase()}">${log.action.replace('_', ' ')}</span></td>
                <td>${log.user}</td>
                <td>${log.details}</td>
            </tr>
        `;
    });
}

function populateVerificationQueue(data) {
    const queueBody = document.getElementById('verification-queue-body');
    queueBody.innerHTML = '';

    if (data.verificationQueue.length === 0) {
        queueBody.innerHTML = '<tr><td colspan="6">No pending verifications.</td></tr>';
        return;
    }

    data.verificationQueue.forEach(item => {
        queueBody.innerHTML += `
            <tr>
                <td>${item.txnId}</td>
                <td>${item.date}</td>
                <td>${item.phone}</td>
                <td>${formatCurrency(item.amount)}</td>
                <td><span class="status-tag pending">${item.status}</span></td>
                <td class="action-buttons">
                    <button class="action-btn approve"><i class="fas fa-check"></i> Approve</button>
                    <button class="action-btn reject"><i class="fas fa-times"></i> Reject</button>
                </td>
            </tr>
        `;
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Populate initial data
    populateAdminOverview(mockAdminData);
    populateVerificationQueue(mockAdminData);

    // Set up navigation
    const navLinks = document.querySelectorAll('.dashboard-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            switchContent(targetId);
        });
    });

    // Set initial active content
    switchContent('overview');
});