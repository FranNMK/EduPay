# EduPay Backend Setup Guide

## Environment Variables

Before running the application, set up the following environment variables in `.env.local`:

### MongoDB
- `MONGODB_URI`: Your MongoDB connection string
  - Get it from MongoDB Atlas: https://www.mongodb.com/cloud/atlas
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/edupay?retryWrites=true&w=majority`

### Stripe
- `STRIPE_SECRET_KEY`: Your Stripe secret key (from Stripe Dashboard)
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Public key (for client-side)
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret 

## Getting Started

### 1. Setup MongoDB

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Add it to `.env.local` as `MONGODB_URI`

### 2. Setup Stripe

1. Go to https://dashboard.stripe.com
2. Sign up or login
3. Go to Developers > API Keys
4. Copy your Secret Key and Publishable Key
5. Add them to `.env.local`

### 3. Setup Webhook (for local testing use Stripe CLI)

\`\`\`bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Listen for webhooks
stripe listen --forward-to localhost:3000/api/payments/webhook

# This will output your webhook signing secret
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user

### Users
- `GET /api/users?id={userId}` - Get user details
- `PUT /api/users` - Update user information

### Payments
- `POST /api/payments/create-intent` - Create a payment intent
- `POST /api/payments/webhook` - Stripe webhook (automatic)

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
  "stripeCustomerId": "cus_xxx",
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
  "stripePaymentIntentId": "pi_xxx",
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

### 2. Create a Payment Intent
\`\`\`bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_FROM_REGISTRATION",
    "amount": 100.00,
    "currency": "USD",
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

1. Never expose `STRIPE_SECRET_KEY` in client-side code
2. Always validate input on the server
3. Use HTTPS in production
4. Keep webhook secret safe
5. Implement rate limiting for production
6. Use MongoDB authentication
7. Enable IP whitelist for production
