/**
 * PesaPal Service (basic)
 * Note: Adjust endpoints to match the PesaPal API version you are using.
 * This implementation uses the sandbox endpoints pattern for token, submit order, and status check.
 */
const axios = require('axios');

const BASE = process.env.PESAPAL_BASE_URL;
const KEY = process.env.PESAPAL_CONSUMER_KEY;
const SECRET = process.env.PESAPAL_CONSUMER_SECRET;

let accessToken = null;

exports.getAccessToken = async () => {
  try {
    const url = `${BASE}Auth/RequestToken`;
    const res = await axios.post(url, {
      consumer_key: KEY,
      consumer_secret: SECRET
    });
    if (res.data && res.data.token) {
      accessToken = res.data.token;
      return accessToken;
    }
    throw new Error('No token in PesaPal response');
  } catch (err) {
    console.error('getAccessToken error', err.response?.data || err.message);
    throw err;
  }
};

exports.submitOrder = async (order) => {
  try {
    if (!accessToken) await this.getAccessToken();
    const url = `${BASE}Transactions/SubmitOrderRequest`;
    const res = await axios.post(url, order, { headers: { Authorization: `Bearer ${accessToken}` } });
    return res.data;
  } catch (err) {
    console.error('submitOrder error', err.response?.data || err.message);
    throw err;
  }
};

exports.getStatus = async (orderTrackingId) => {
  try {
    if (!accessToken) await this.getAccessToken();
    const url = `${BASE}Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`;
    const res = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    return res.data;
  } catch (err) {
    console.error('getStatus error', err.response?.data || err.message);
    throw err;
  }
};
