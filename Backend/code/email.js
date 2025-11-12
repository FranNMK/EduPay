import nodemailer from 'nodemailer';

// Create a reusable transporter object using the SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    secure: process.env.EMAIL_SERVER_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

/**
 * Sends an OTP email to the user.
 * @param {string} to - The recipient's email address.
 * @param {string} otp - The One-Time Password.
 * @returns {Promise<void>}
 */
export async function sendOtpEmail(to, otp) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: to,
        subject: 'Your EduPay Login Code',
        html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
}