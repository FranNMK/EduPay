# EduPay Backend (Node.js + Express + MongoDB) - Scaffold

This scaffold implements a backend for the EduPay web app using PesaPal for payments and Twilio (optional) for OTP SMS.
It includes authentication (JWT + OTP), models, controllers, payment integration, and example routes.

## Features
- User registration & login (roles: parent, school-admin, super-admin)
- OTP support (Twilio SMS or mock)
- PesaPal integration (initiate payment, check status)
- MongoDB models: User, School, Payment, Receipt
- Role-based middleware and JWT auth

## Setup

1. Extract the project:
   - Files are in this folder.

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file at project root with:

```
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret

# PesaPal (sandbox or production)
PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret
PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3/api/

# Twilio (optional for OTP)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_FROM=+1234567890
```

4. Run dev server:
```bash
npm run dev
```

5. Test endpoints with Postman or Thunder Client.

## Notes
- If you don't have Twilio credentials, OTP will fallback to a mock mode that logs OTP codes on the server (useful for development).
- PesaPal sandbox base URL is included, change to production endpoint when ready.

