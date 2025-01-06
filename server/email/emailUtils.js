// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
// // Generate a 6-digit OTP
// const generateOTP = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// };
// // Send OTP via email
// const sendEmail = async (email, otp) => {
//     try {
//         // Create a test SMTP service account from Ethereal
//         const testAccount = await nodemailer.createTestAccount();
//         // Create a transporter
//         const transporter = nodemailer.createTransport({
//             host: "smtp.gmail.com",
//             port: 465, // For SSL
//             secure: true, // Set true for SSL
//             auth: {
//                 user: "cumulus545@gmail.com",
//                 pass: "capr cvjb vrxf ygbt",
//             },
//         });
        
        
        
        
        
//         // Email content
//         const mailOptions = {
//             from: '"Cumulus" <cumulus545@gmail.com>', // sender address
//             to: email, // recipient's email
//             subject: "Your OTP Code", // subject line
//             text: `Your OTP is ${otp}`, // plain text body
//             html: `<p>Your OTP is <strong>${otp}</strong>.</p>`, // HTML body
//         };
//         // Send email
//         const info = await transporter.sendMail(mailOptions);
//         console.log("Message sent: %s", info.messageId);
//         console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info)); // Preview URL for testing
//         return { success: true, previewURL: nodemailer.getTestMessageUrl(info) };
//     } catch (error) {
//         console.error("Error sending email:", error);
//         return { success: false, error };
//     }
// };
// module.exports = { generateOTP, sendEmail };
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const sendEmail = async (data) => {
    try {
        // Create a test SMTP service account from Ethereal
        const testAccount = await nodemailer.createTestAccount();
        // Create a transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465, // For SSL
            secure: true, // Set true for SSL
            auth: {
                user: "cumulus545@gmail.com",
                pass: "capr cvjb vrxf ygbt",
            },
        });
        // Email content
        const mailOptions = {
            from: '"Cumulus" <cumulus545@gmail.com>', // sender address
            to: data.to, // recipient's email
            subject: data.subject, // subject line
            //text: data.body, // plain text body
            html: data.body, // HTML body
        };
        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info)); // Preview URL for testing
        return { success: true, previewURL: nodemailer.getTestMessageUrl(info) };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
};
// Email sending function
const sendQuestionEmail = async (query, userEmail) => {
    try {
        if (!query) {
            throw new Error('Query cannot be empty');
        }
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465, // For SSL
            secure: true,
            auth: {
                user: "cumulus545@gmail.com", // Your email
                pass: "capr cvjb vrxf ygbt", // Replace with your actual app password
            },
        });
        const mailOptions = {
            from: `"${userEmail}" <${userEmail}>`, // Use logged-in user's email
            to: "cumulus545@gmail.com", // Replace with your email
            subject: `New Query from ${userEmail}`,
            text: `You have received a new query:\n\n${query}`,
        };
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
router.post('/sendhelpqueries', async (req, res) => {
    const { query, email } = req.body; // Extract query and email from request body
    if (!query || !email) {
        return res.status(400).json({ message: 'Query and email are required' });
    }
    try {
        // Send the query via email
        await sendQuestionEmail(query, email);
        res.status(200).json({ message: 'Query submitted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting query. Please try again later.' });
    }
});
module.exports = { 
    router, 
    generateOTP, 
    sendEmail 
  };