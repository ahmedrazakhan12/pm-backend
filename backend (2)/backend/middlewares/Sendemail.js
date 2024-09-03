require('dotenv').config();
const nodemailer = require('nodemailer');

const sendMail = async (email, username , text) => {
    console.log(email, username , text);
    
    try {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'valerichekalina17@gmail.com',
                pass: 'oufj bkez htzg ocqp'
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        const email_address = "valerichekalina17@gmail.com";

        const mailOptions = {
            from: email_address,
            to: email,
            subject: 'Gmg Solutions',
            html: `
                <p>Dear,</p>
                <p>We received a new Notification from Gmg Solutions Project Management System:</p>
                <p style="font-weight: bold; text-transform: uppercase;">${text}</p>
                <p>For any questions or support, please contact our team at ${email_address}.</p>
                <br>
                <p>Best Regards,</p>
                <p>Gmg Solutions</p>
            `
        };

        // Send mail
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Mail sent successfully:', info.response);
            }
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendMail;