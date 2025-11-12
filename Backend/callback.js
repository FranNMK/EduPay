import dbConnect from '../../../lib/dbConnect';
import Transaction from '../../../models/Transaction';
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, msg: 'Method Not Allowed' });
    }

    // --- 1. Handle IntaSend's initial challenge for webhook verification ---
    if (req.body.challenge) {
        console.log('Received IntaSend webhook challenge.');
        return res.status(200).send(req.body.challenge);
    }

    // --- 2. Verify the incoming request is from IntaSend ---
    const signature = req.headers['x-intasend-signature'];
    const webhookSecret = process.env.INTASEND_WEBHOOK_SECRET;

    if (!signature) {
        console.error('Webhook Error: Missing signature.');
        return res.status(401).json({ success: false, msg: 'Missing signature.' });
    }

    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(JSON.stringify(req.body, Object.keys(req.body).sort()));
    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature !== signature) {
        console.error('Webhook Error: Invalid signature.');
        return res.status(401).json({ success: false, msg: 'Invalid signature.' });
    }

    // --- 3. Process the validated webhook payload ---
    const { state, tracking_id, invoice_id } = req.body;

    console.log(`Received webhook for tracking_id: ${tracking_id}, state: ${state}`);

    if (!tracking_id && !invoice_id) {
        console.warn('Webhook received without tracking_id or invoice_id.');
        return res.status(400).json({ success: false, msg: 'Missing tracking ID.' });
    }

    await dbConnect();

    try {
        // Find the transaction using the tracking ID from IntaSend
        const transaction = await Transaction.findOne({ intaSendTrackingId: tracking_id || invoice_id });

        if (!transaction) {
            console.warn(`Transaction with tracking_id ${tracking_id || invoice_id} not found.`);
            // Respond with 200 OK so IntaSend doesn't retry for a transaction we don't have.
            return res.status(200).json({ success: true, msg: 'Transaction not found, but acknowledged.' });
        }

        // Update transaction status based on the webhook state
        if (state === 'COMPLETE') {
            transaction.status = 'completed';
        } else if (state === 'FAILED' || state === 'CANCELLED') {
            transaction.status = 'failed';
        } else {
            // You can handle other states like 'PROCESSING' if needed
            transaction.status = state.toLowerCase();
        }

        await transaction.save();
        console.log(`Transaction ${transaction._id} status updated to ${transaction.status}`);

        // Acknowledge receipt to IntaSend
        res.status(200).json({ success: true, msg: 'Webhook processed successfully.' });

    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ success: false, msg: 'Server error while processing webhook.' });
    }
}