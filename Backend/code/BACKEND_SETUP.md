# EduPay Backend Setup Guide

## Environment Variables

Before running the application, set up the following environment variables in `.env.local`:

### MongoDB
- `MONGODB_URI`: Your MongoDB connection string
  - Get it from MongoDB Atlas: https://www.mongodb.com/cloud/atlas
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/edupay?retryWrites=true&w=majority`

### IntaSend
- `INTASEND_PUBLISHABLE_KEY`: Your IntaSend publishable API key.
- `INTASEND_API_SECRET`: Your IntaSend secret API key.
- `INTASEND_WEBHOOK_SECRET`: Your IntaSend webhook secret for verifying callbacks.

### JWT (JSON Web Token)
- `JWT_SECRET`: A long, random, and secret string used for signing tokens.
  - Generate one here: https://www.grc.com/passwords.htm (use a 63-character random string)

### Email (Nodemailer)
- `EMAIL_SERVER_HOST`: SMTP host of your email provider (e.g., `smtp.gmail.com`).
- `EMAIL_SERVER_PORT`: SMTP port (e.g., `465` for SSL).
- `EMAIL_SERVER_USER`: Your email address for sending.
- `EMAIL_SERVER_PASSWORD`: Your email password or an "App Password" (recommended for Gmail).
- `EMAIL_FROM`: The email address that will appear in the "From" field (e.g., `"EduPay" <no-reply@edupay.com>`).

## Getting Started

### 1. Setup MongoDB

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Add it to `.env.local` as `MONGODB_URI`

### 2. Setup IntaSend

1. Go to https://dashboard.intasend.com
2. Sign up or login
3. Go to Settings > API Keys
4. Copy your Secret Key and Publishable Key.
5. Add them to `.env.local`

### 3. Setup Webhook

1. In your IntaSend dashboard, go to Settings > Webhooks.
2. Add a new webhook endpoint pointing to `https://your-production-domain.com/api/payments/callback`.
3. For local testing, use a tool like `ngrok` to expose your local server (`ngrok http 3000`) and use the generated URL.
4. Copy the webhook secret provided by IntaSend and add it to `.env.local` as `INTASEND_WEBHOOK_SECRET`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/otp-request` - Request a One-Time Password for login.
  - Body: `{ "identifier": "user@example.com", "role": "parent" }`
- `POST /api/auth/login` - Verify OTP and log in.
  - Body: `{ "identifier": "user@example.com", "otp": "123456" }`
- `POST /api/auth/register` - (Admin-only) Register a new user.

### Users
- `GET /api/users?id={userId}` - Get user details
- `PUT /api/users` - Update user information

### Payments
- `POST /api/payments/initiate` - Initiate a payment with IntaSend.
- `POST /api/payments/callback` - IntaSend webhook for payment status updates (automatic).

### Transactions
- `GET /api/transactions?userId={userId}` - Get user transactions
- `GET /api/transactions/{id}` - Get transaction details

### Fees
- `GET /api/fees` - Get all fees
- `POST /api/fees` - Create a new fee

## Database Collections

### users
\`\`\`json
{
  "_id": ObjectId,
  "email": "student@example.com",
  "name": "John Doe",
  "studentId": "STU123",
  "phone": "+1234567890",
  "role": "Parent",
  "otp": "123456",
  "otpExpires": ISODate,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
\`\`\`

### transactions
\`\`\`json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "amount": 100.00,
  "currency": "USD",
  "description": "Tuition Fee",
  "status": "completed",
  "intaSendTrackingId": "IVM-XXXXX-XXXX",
  "type": "payment",
  "metadata": {},
  "createdAt": ISODate,
  "updatedAt": ISODate
}
\`\`\`

### fees
\`\`\`json
{
  "_id": ObjectId,
  "name": "Tuition",
  "amount": 500.00,
  "currency": "USD",
  "description": "Monthly tuition fee",
  "dueDate": ISODate,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
\`\`\`

## Testing the Backend

### 1. Register a User
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "name": "John Doe",
    "studentId": "STU123"
  }'
\`\`\`

### 2. Initiate a Payment
\`\`\`bash
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_FROM_REGISTRATION",
    "amount": 100,
    "currency": "KES",
    "phone_number": "+254712345678",
    "description": "Tuition Payment"
  }'
\`\`\`

### 3. Get User Transactions
\`\`\`bash
curl http://localhost:3000/api/transactions?userId=USER_ID_FROM_REGISTRATION
\`\`\`

## Error Handling

All endpoints return standardized responses:

### Success
\`\`\`json
{
  "success": true,
  "data": { ... },
  "statusCode": 200
}
\`\`\`

### Error
\`\`\`json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
\`\`\`

## Security Best Practices

1. Never expose `INTASEND_API_SECRET` in client-side code.
2. Always validate input on the server
3. Use HTTPS in production
4. Keep your IntaSend webhook secret safe.
5. Implement rate limiting for production
6. Use MongoDB authentication
7. Enable IP whitelist for production
