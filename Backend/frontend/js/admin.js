 // Check authentication
const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'school_admin') {
  window.location.href = 'index.html';
}

document.getElementById('userName').textContent = user.full_name;

// Tab switching
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (item.classList.contains('logout')) {
      logout();
      return;
    }

    const tabName = item.dataset.tab;
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  document.getElementById(`tab-${tabName}`).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  const titles = {
    'overview': 'Dashboard Overview',
    'payments': 'All Payments',
    'students': 'Manage Students',
    'receipt-config': 'Receipt Design',
    'reports': 'Reports',
    'settings': 'Settings'
  };
  document.getElementById('pageTitle').textContent = titles[tabName];

  loadTabData(tabName);
}

async function loadTabData(tabName) {
  switch(tabName) {
    case 'overview':
      await loadDashboardStats();
      break;
    case 'payments':
      await loadAllPayments();
      break;
    case 'students':
      await loadStudents();
      break;
    case 'receipt-config':
      await loadReceiptConfig();
      break;
  }
}

// Load dashboard statistics
async function loadDashboardStats() {
  try {
    const stats = await api.request('/admin/statistics');
    
    // Update stat cards
    document.getElementById('totalRevenue').textContent = 
      `KES ${stats.totalRevenue.toLocaleString()}`;
    
    const completed = stats.paymentsByStatus.find(s => s._id === 'completed');
    const pending = stats.paymentsByStatus.find(s => s._id === 'pending');
    
    document.getElementById('completedPayments').textContent = completed?.count || 0;
    document.getElementById('pendingPayments').textContent = pending?.count || 0;

    // Load charts
    loadPaymentsByClassChart(stats.paymentsByClass);
    
    // Load recent payments
    await loadRecentPayments();
    
  } catch (error) {
    console.error('Failed to load statistics:', error);
    showMessage('Failed to load dashboard statistics', 'error');
  }
}

// Load payments by class chart
function loadPaymentsByClassChart(data) {
  const ctx = document.getElementById('paymentsByClassChart').getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d._id || 'Unknown'),
      datasets: [{
        label: 'Total Amount (KES)',
        data: data.map(d => d.total),
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'KES ' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
}

// Load recent payments
async function loadRecentPayments() {
  try {
    const response = await api.request('/admin/payments?limit=10');
    const tbody = document.getElementById('recentPaymentsBody');
    
    if (response.payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No payments yet</td></tr>';
      return;
    }

    tbody.innerHTML = response.payments.map(payment => `
      <tr>
        <td>${formatDate(payment.created_at)}</td>
        <td>${payment.student_id?.full_name || 'N/A'}</td>
        <td>${payment.metadata?.class || 'N/A'}</td>
        <td>KES ${payment.amount.toLocaleString()}</td>
        <td>${payment.payment_method.toUpperCase()}</td>
        <td><span class="status status-${payment.status}">${payment.status}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load recent payments:', error);
  }
}

// Refresh payments (for real-time updates)
async function refreshPayments() {
  showMessage('Refreshing payments...', 'info');
  await loadRecentPayments();
  await loadDashboardStats();
  showMessage('Payments refreshed', 'success');
}

// Load all payments with filters
async function loadAllPayments() {
  try {
    const status = document.getElementById('filterPaymentStatus').value;
    const className = document.getElementById('filterClass').value;
    
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    if (className) query.append('class', className);

    const response = await api.request(`/admin/payments?${query.toString()}`);
    const tbody = document.getElementById('allPaymentsBody');
    
    if (response.payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">No payments found</td></tr>';
      return;
    }

    tbody.innerHTML = response.payments.map(payment => `
      <tr>
        <td>${formatDate(payment.created_at)}</td>
        <td>${payment.transaction_id}</td>
        <td>${payment.student_id?.full_name || 'N/A'}</td>
        <td>${payment.metadata?.class || 'N/A'}</td>
        <td>KES ${payment.amount.toLocaleString()}</td>
        <td>${payment.payment_method.toUpperCase()}</td>
        <td><span class="status status-${payment.status}">${payment.status}</span></td>
        <td>
          <button onclick="viewPaymentDetails('${payment._id}')" class="btn btn-sm">View</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load all payments:', error);
    showMessage('Failed to load payments', 'error');
  }
}

// Add event listeners for filters
document.getElementById('filterPaymentStatus')?.addEventListener('change', loadAllPayments);
document.getElementById('filterClass')?.addEventListener('change', loadAllPayments);

// Add student form handler
document.getElementById('addStudentForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const studentData = {
    full_name: document.getElementById('studentName').value,
    email: document.getElementById('studentEmail').value,
    phone: document.getElementById('studentPhone').value,
    class: document.getElementById('studentClass').value
  };

  try {
    showLoading('Adding student...');
    
    await api.request('/admin/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
    
    hideLoading();
    showMessage('Student added successfully!', 'success');
    
    // Reset form and reload students list
    e.target.reset();
    await loadStudents();
    
  } catch (error) {
    hideLoading();
    showMessage(error.message || 'Failed to add student', 'error');
  }
});

// Load students list
async function loadStudents() {
  try {
    const response = await api.request('/admin/students');
    const tbody = document.getElementById('studentsTableBody');
    
    if (response.students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No students yet</td></tr>';
      return;
    }

    tbody.innerHTML = response.students.map(student => `
      <tr>
        <td>${student.full_name}</td>
        <td>${student.email}</td>
        <td>${student.phone}</td>
        <td>${student.metadata?.class || 'N/A'}</td>
        <td><span class="status status-${student.status}">${student.status}</span></td>
        <td>
          <button onclick="editStudent('${student._id}')" class="btn btn-sm">Edit</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load students:', error);
    showMessage('Failed to load students', 'error');
  }
}

// Receipt configuration
document.getElementById('receiptConfigForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const configData = {
    logo_url: document.getElementById('receiptLogo').value,
    header_text: document.getElementById('receiptHeader').value,
    footer_text: document.getElementById('receiptFooter').value,
    breakdown: {
      tuition: parseInt(document.getElementById('breakdownTuition').value),
      facilities: parseInt(document.getElementById('breakdownFacilities').value),
      activities: parseInt(document.getElementById('breakdownActivities').value),
      other: parseInt(document.getElementById('breakdownOther').value)
    }
  };

  // Validate total equals 100%
  const total = Object.values(configData.breakdown).reduce((a, b) => a + b, 0);
  if (total !== 100) {
    showMessage('Breakdown percentages must total 100%', 'error');
    return;
  }

  try {
    showLoading('Saving configuration...');
    
    await api.request('/admin/institution/receipt-config', {
      method: 'PUT',
      body: JSON.stringify(configData)
    });
    
    hideLoading();
    showMessage('Receipt configuration saved!', 'success');
    
  } catch (error) {
    hideLoading();
    showMessage(error.message || 'Failed to save configuration', 'error');
  }
});

// Update breakdown total in real-time
['breakdownTuition', 'breakdownFacilities', 'breakdownActivities', 'breakdownOther'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', updateBreakdownTotal);
});

function updateBreakdownTotal() {
  const tuition = parseInt(document.getElementById('breakdownTuition').value) || 0;
  const facilities = parseInt(document.getElementById('breakdownFacilities').value) || 0;
  const activities = parseInt(document.getElementById('breakdownActivities').value) || 0;
  const other = parseInt(document.getElementById('breakdownOther').value) || 0;
  
  const total = tuition + facilities + activities + other;
  document.getElementById('breakdownTotal').textContent = total;
  
  // Update preview
  updateReceiptPreview();
}

// Update receipt preview
function updateReceiptPreview() {
  const sampleAmount = 50000;
  const tuition = parseInt(document.getElementById('breakdownTuition').value) || 0;
  const facilities = parseInt(document.getElementById('breakdownFacilities').value) || 0;
  const activities = parseInt(document.getElementById('breakdownActivities').value) || 0;
  const other = parseInt(document.getElementById('breakdownOther').value) || 0;

  document.getElementById('previewTuition').textContent = 
    `KES ${((sampleAmount * tuition) / 100).toLocaleString()}`;
  document.getElementById('previewFacilities').textContent = 
    `KES ${((sampleAmount * facilities) / 100).toLocaleString()}`;
  document.getElementById('previewActivities').textContent = 
    `KES ${((sampleAmount * activities) / 100).toLocaleString()}`;
  document.getElementById('previewOther').textContent = 
    `KES ${((sampleAmount * other) / 100).toLocaleString()}`;

  const headerText = document.getElementById('receiptHeader').value;
  const footerText = document.getElementById('receiptFooter').value;
  
  if (headerText) {
    document.getElementById('previewHeader').textContent = headerText;
  }
  if (footerText) {
    document.getElementById('previewFooter').textContent = footerText;
  }
}

// Export payments to CSV
async function exportPayments() {
  try {
    const response = await api.request('/admin/payments');
    const payments = response.payments;

    // Create CSV content
    const headers = ['Date', 'Transaction ID', 'Student', 'Class', 'Amount', 'Method', 'Status'];
    const rows = payments.map(p => [
      formatDate(p.created_at),
      p.transaction_id,
      p.student_id?.full_name || 'N/A',
      p.metadata?.class || 'N/A',
      p.amount,
      p.payment_method,
      p.status
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showMessage('Payments exported successfully', 'success');
  } catch (error) {
    console.error('Export failed:', error);
    showMessage('Failed to export payments', 'error');
  }
}

// Helper functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function logout() {
  api.clearToken();
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Load initial dashboard data
loadDashboardStats();
