 // Check authentication
const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'parent') {
  window.location.href = 'index.html';
}

// Display user name
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
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active from nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(`tab-${tabName}`).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update page title
  const titles = {
    'pay-fees': 'Pay Fees',
    'payment-history': 'Payment History',
    'institutions': 'My Institutions',
    'receipts': 'Receipts',
    'profile': 'Profile'
  };
  document.getElementById('pageTitle').textContent = titles[tabName];

  // Load tab data
  loadTabData(tabName);
}

async function loadTabData(tabName) {
  switch(tabName) {
    case 'payment-history':
      await loadPaymentHistory();
      break;
    case 'institutions':
      await loadInstitutions();
      break;
    case 'receipts':
      await loadReceipts();
      break;
  }
}

// Payment form handler
document.getElementById('paymentForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const paymentData = {
    institution_id: document.getElementById('institution').value,
    student_id: document.getElementById('student').value,
    amount: parseInt(document.getElementById('amount').value),
    payment_method: document.getElementById('paymentMethod').value,
    metadata: {
      purpose: document.getElementById('purpose').value
    }
  };

  try {
    showLoading('Processing payment...');
    
    const response = await api.initiatePayment(paymentData);
    
    hideLoading();
    showMessage('Payment initiated! Check your phone for M-Pesa prompt.', 'success');
    
    // Reload payment history
    await loadPaymentHistory();
    
    // Reset form
    e.target.reset();
    
  } catch (error) {
    hideLoading();
    showMessage(error.message || 'Payment initiation failed', 'error');
  }
});

// Load payment history
async function loadPaymentHistory() {
  try {
    const response = await api.getMyPayments();
    const tbody = document.getElementById('paymentsTableBody');
    
    if (response.payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No payments yet</td></tr>';
      return;
    }

    tbody.innerHTML = response.payments.map(payment => `
      <tr>
        <td>${formatDate(payment.created_at)}</td>
        <td>${payment.transaction_id}</td>
        <td>${payment.institution_id.name}</td>
        <td>KES ${payment.amount.toLocaleString()}</td>
        <td><span class="status status-${payment.status}">${payment.status}</span></td>
        <td>
          ${payment.receipt_url ? 
            `<button onclick="downloadReceipt('${payment.receipt_url}')" class="btn btn-sm">Download</button>` : 
            '<span class="text-muted">Processing...</span>'
          }
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load payments:', error);
    showMessage('Failed to load payment history', 'error');
  }
}

// Download receipt
function downloadReceipt(url) {
  window.open(url, '_blank');
}

// Format date helper
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

// Logout
function logout() {
  api.clearToken();
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Load initial data
loadPaymentHistory();
