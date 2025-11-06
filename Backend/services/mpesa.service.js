 const axios = require('axios');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.passkey = process.env.MPESA_PASSKEY;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.baseURL = 'https://sandbox.safaricom.co.ke'; // Use production URL in live
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get OAuth access token
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('M-Pesa auth error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with M-Pesa');
    }
  }

  // Initiate STK Push
  async initiateMpesaPayment({ phone, amount, accountReference }) {
    try {
      const token = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = Buffer.from(
        `${this.shortcode}${this.passkey}${timestamp}`
      ).toString('base64');

      // Format phone number
      const formattedPhone = phone.startsWith('0') 
        ? `254${phone.slice(1)}` 
        : phone.startsWith('+') 
          ? phone.slice(1) 
          : phone;

      const requestData = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.floor(amount),
        PartyA: formattedPhone,
        PartyB: this.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.BACKEND_URL}/api/payments/mpesa-callback`,
        AccountReference: accountReference,
        TransactionDesc: 'School Fees Payment'
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('M-Pesa STK Push error:', error.response?.data || error.message);
      throw new Error('Failed to initiate M-Pesa payment');
    }
  }

  // Query transaction status
  async queryTransactionStatus(checkoutRequestID) {
    try {
      const token = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = Buffer.from(
        `${this.shortcode}${this.passkey}${timestamp}`
      ).toString('base64');

      const requestData = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpushquery/v1/query`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );studentName" required>
             