 // API configuration
const API_BASE_URL = 'http://localhost:5000/api';

class API {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Get auth headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async verifyOTP(userId, otp) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ userId, otp })
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Payment methods
  async initiatePayment(paymentData) {
    return this.request('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async getMyPayments() {
    return this.request('/payments/my-payments');
  }

  // Set token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Clear token
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }
}

// Create global API instance
const api = new API();
