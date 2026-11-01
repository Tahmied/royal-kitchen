import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ path: './.env' });

const parseBoolean = (value, fallback = false) => {
    if (value === undefined || value === null || value === '') return fallback;
    return String(value).toLowerCase() === 'true';
};

const parseRecipients = (value) => {
    if (!value) return [];
    return String(value)
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
};

const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: parseBoolean(process.env.SMTP_SECURE, false),
    auth: process.env.SMTP_USER
        ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
          }
        : undefined,
    tls: {
        rejectUnauthorized: parseBoolean(process.env.SMTP_TLS_REJECT_UNAUTHORIZED, true),
    },
};

let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;
    if (!smtpConfig.host) {
        console.warn('SMTP is not configured (SMTP_HOST missing); email notifications are disabled.');
        return null;
    }
    transporter = nodemailer.createTransport(smtpConfig);
    return transporter;
};

const escapeHtml = (value) => {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

export const verifyTransporter = async () => {
    const instance = getTransporter();
    if (!instance) return false;
    try {
        await instance.verify();
        return true;
    } catch (error) {
        console.error('SMTP verification failed:', error?.message || error);
        return false;
    }
};

export const sendEmail = async ({ to, subject, text, html }) => {
    const instance = getTransporter();
    if (!instance) {
        throw new Error('SMTP is not configured');
    }

    const recipients = Array.isArray(to) ? to : parseRecipients(to);
    if (!recipients.length) {
        throw new Error('No email recipients provided');
    }

    const fromAddress =
        process.env.SMTP_FROM ||
        (process.env.SMTP_USER
            ? `"${process.env.SMTP_FROM_NAME || 'Royal Kitchen'}" <${process.env.SMTP_USER}>`
            : undefined);

    const message = {
        from: fromAddress,
        to: recipients.join(', '),
        subject: subject || '(no subject)',
        text,
        html,
    };

    return instance.sendMail(message);
};

export const sendLeadNotification = async (lead) => {
    const recipients = parseRecipients(process.env.LEAD_NOTIFICATION_EMAILS);
    if (!recipients.length) {
        console.warn('LEAD_NOTIFICATION_EMAILS is not set; skipping lead email notification.');
        return { success: false, reason: 'no_recipients' };
    }

    const subject = `New contact form submission: ${lead?.name || 'Unknown'}`;

    const text = [
        `Name: ${lead?.name || ''}`,
        `Email: ${lead?.email || ''}`,
        `Phone: ${lead?.phone || ''}`,
        `Message: ${lead?.message || ''}`,
        `Submitted: ${lead?.createdAt || new Date().toISOString()}`,
    ].join('\n');

    const html = `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(lead?.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(lead?.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(lead?.phone)}</p>
        <p><strong>Message:</strong><br>${escapeHtml(lead?.message).replace(/\n/g, '<br>')}</p>
        <p><em>Submitted: ${escapeHtml(lead?.createdAt || new Date().toISOString())}</em></p>
    `;

    try {
        await sendEmail({ to: recipients, subject, text, html });
        return { success: true };
    } catch (error) {
        console.error('Failed to send lead notification email:', error?.message || error);
        return { success: false, reason: error?.message || 'send_failed' };
    }
};

export { sendEmail as default };