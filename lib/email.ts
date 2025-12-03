import { ContactFormData } from './types';
import { sanitizeText, stripHtmlTags } from './sanitize';

/**
 * Validates and sanitizes contact form data
 * @param data - The contact form data to validate
 * @returns Object with validation result and any error messages
 */
export function validateContactForm(data: ContactFormData): { 
  valid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];

  // Sanitize inputs first
  const sanitizedName = data.name ? stripHtmlTags(data.name.trim()) : '';
  const sanitizedEmail = data.email ? data.email.trim().toLowerCase() : '';
  const sanitizedMessage = data.message ? stripHtmlTags(data.message.trim()) : '';
  const sanitizedPreferredTime = data.preferredTime ? stripHtmlTags(data.preferredTime.trim()) : '';

  // Validate name
  if (!sanitizedName || sanitizedName.length === 0) {
    errors.push('Name is required');
  } else if (sanitizedName.length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (sanitizedName.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  // Validate email
  if (!sanitizedEmail || sanitizedEmail.length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      errors.push('Email must be a valid email address');
    }
  }

  // Validate message
  if (!sanitizedMessage || sanitizedMessage.length === 0) {
    errors.push('Message is required');
  } else if (sanitizedMessage.length < 10) {
    errors.push('Message must be at least 10 characters long');
  } else if (sanitizedMessage.length > 5000) {
    errors.push('Message must be less than 5000 characters');
  }

  // Validate preferredTime (optional)
  if (sanitizedPreferredTime && sanitizedPreferredTime.length > 200) {
    errors.push('Preferred time must be less than 200 characters');
  }

  // Update data with sanitized values
  if (errors.length === 0) {
    data.name = sanitizedName;
    data.email = sanitizedEmail;
    data.message = sanitizedMessage;
    data.preferredTime = sanitizedPreferredTime;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sends contact email using configured email service
 * @param data - The contact form data to send
 * @returns Promise that resolves to true if email sent successfully, false otherwise
 */
export async function sendContactEmail(data: ContactFormData): Promise<boolean> {
  try {
    // Check if email service is configured
    const emailService = process.env.EMAIL_SERVICE;
    
    if (!emailService) {
      console.error('Email service not configured. Set EMAIL_SERVICE environment variable.');
      return false;
    }

    // For now, we'll use a simple approach that can be extended
    // This can be replaced with actual email service integration (Nodemailer, SendGrid, Resend, etc.)
    
    if (emailService === 'console') {
      // Development mode - log to console
      console.log('=== Contact Form Submission ===');
      console.log('From:', data.name, `<${data.email}>`);
      console.log('Preferred Time:', data.preferredTime || 'Not specified');
      console.log('Message:', data.message);
      console.log('==============================');
      return true;
    }

    if (emailService === 'resend') {
      return await sendViaResend(data);
    }

    if (emailService === 'sendgrid') {
      return await sendViaSendGrid(data);
    }

    if (emailService === 'nodemailer') {
      return await sendViaNodemailer(data);
    }

    console.error(`Unknown email service: ${emailService}`);
    return false;

  } catch (error) {
    console.error('Error sending contact email:', error);
    return false;
  }
}

/**
 * Send email via Resend API
 */
async function sendViaResend(data: ContactFormData): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_EMAIL;

    if (!apiKey || !toEmail) {
      console.error('Resend configuration missing. Set RESEND_API_KEY and CONTACT_EMAIL.');
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'ACME <onboarding@resend.dev>',
        to: toEmail,
        reply_to: data.email,
        subject: `Contact Form: ${data.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Preferred Time:</strong> ${escapeHtml(data.preferredTime || 'Not specified')}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending via Resend:', error);
    return false;
  }
}

/**
 * Send email via SendGrid API
 */
async function sendViaSendGrid(data: ContactFormData): Promise<boolean> {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const toEmail = process.env.CONTACT_EMAIL;
    const fromEmail = process.env.FROM_EMAIL;

    if (!apiKey || !toEmail || !fromEmail) {
      console.error('SendGrid configuration missing. Set SENDGRID_API_KEY, CONTACT_EMAIL, and FROM_EMAIL.');
      return false;
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: toEmail }],
          subject: `Contact Form: ${data.name}`,
        }],
        from: { email: fromEmail },
        reply_to: { email: data.email },
        content: [{
          type: 'text/html',
          value: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
            <p><strong>Preferred Time:</strong> ${escapeHtml(data.preferredTime || 'Not specified')}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>
          `,
        }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SendGrid API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending via SendGrid:', error);
    return false;
  }
}

/**
 * Send email via Nodemailer (SMTP)
 */
async function sendViaNodemailer(data: ContactFormData): Promise<boolean> {
  try {
    // Note: This requires nodemailer to be installed
    // For now, we'll return false and log that it needs implementation
    console.error('Nodemailer integration requires nodemailer package to be installed.');
    console.error('Install with: npm install nodemailer');
    console.error('Then configure SMTP settings in environment variables.');
    return false;
  } catch (error) {
    console.error('Error sending via Nodemailer:', error);
    return false;
  }
}

/**
 * Escape HTML to prevent XSS attacks
 * Uses centralized sanitization utility
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
