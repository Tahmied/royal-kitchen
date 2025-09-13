import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config({path :'./.env'})

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // smtp.gmail.com
    port : process.env.SMTP_PORT, // 587
    secure : process.env.SMTP_SECURE, // true for 465 and false for other
    auth : {
        user : `${process.env.SMTP_USER}`, // smtp username
        pass : `${process.env.SMTP_PASS}` // smtp password
    }
})

async function sendEmail({to, subject, text, html}) {
    const msg = {
        from : `"Royal Kitchen" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html
    }
    return transporter.sendMail(msg)
}

export { sendEmail }
