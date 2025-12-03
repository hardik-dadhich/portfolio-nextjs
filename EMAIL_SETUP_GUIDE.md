# Email Setup Guide - Resend Integration

## Overview

Your contact form is configured to send emails to **hardikdadhich26@gmail.com** using **Resend** - a free, reliable email service.

### Why Resend?

- ✅ **Free Tier**: 3,000 emails/month, 100 emails/day
- ✅ **Reliable**: 99.9% uptime
- ✅ **Simple API**: Easy to integrate
- ✅ **No Credit Card**: Free tier doesn't require payment info
- ✅ **Fast**: Emails delivered in seconds

---

## Quick Setup (5 Minutes)

### Step 1: Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Click "Sign Up" (free, no credit card required)
3. Verify your email address

### Step 2: Get Your API Key

1. Log into Resend dashboard
2. Go to **API Keys** section
3. Click "Create API Key"
4. Name it: "Personal Portfolio Contact Form"
5. Copy the API key (starts with `re_...`)

### Step 3: Add API Key to Your Project

Open `.env.local` and update:

```bash
# Email Service Configuration
EMAIL_SERVICE=resend
CONTACT_EMAIL=hardikdadhich26@gmail.com

# Resend API Key
RESEND_API_KEY=re_your_actual_api_key_here
FROM_EMAIL=onboarding@resend.dev
```

### Step 4: Test It!

```bash
# Start your development server
npm run dev

# Go to http://localhost:3000/contact
# Fill out the form and submit
# Check hardikdadhich26@gmail.com for the email!
```

---

## Configuration Options

### Development Mode (Console Logging)

For testing without sending real emails:

```bash
EMAIL_SERVICE=console
```

Emails will be logged to the console instead of sent.

### Production Mode (Real Emails)

For sending actual emails:

```bash
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_api_key
CONTACT_EMAIL=hardikdadhich26@gmail.com
FROM_EMAIL=onboarding@resend.dev
```

---

## Custom Domain (Optional)

### Why Use a Custom Domain?

- Professional sender address (e.g., `contact@yourdomain.com`)
- Better deliverability
- No "via resend.dev" in email headers

### Setup Steps

1. **Add Domain in Resend**
   - Go to Resend Dashboard → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `yourdomain.com`)

2. **Add DNS Records**
   - Resend will provide DNS records
   - Add them to your domain registrar (Hostinger, GoDaddy, etc.)
   - Wait for verification (usually 5-30 minutes)

3. **Update Environment Variables**
   ```bash
   FROM_EMAIL=contact@yourdomain.com
   ```

---

## Email Template

The contact form sends emails with this format:

```
Subject: Contact Form: [Name]
From: onboarding@resend.dev (or your custom domain)
Reply-To: [User's Email]

New Contact Form Submission

Name: John Doe
Email: john@example.com
Preferred Time: Afternoon
Message:
Hi, I'd like to discuss a project...
```

---

## Testing

### Test in Development

1. Set `EMAIL_SERVICE=console` in `.env.local`
2. Submit the contact form
3. Check terminal/console for email content

### Test in Production

1. Set `EMAIL_SERVICE=resend` with valid API key
2. Submit the contact form
3. Check `hardikdadhich26@gmail.com` inbox

### Test Email Content

```bash
# Use curl to test the API directly
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message",
    "preferredTime": "Afternoon"
  }'
```

---

## Troubleshooting

### "Email service not configured"

**Problem**: `EMAIL_SERVICE` not set in `.env.local`

**Solution**:
```bash
echo "EMAIL_SERVICE=resend" >> .env.local
```

### "Resend configuration missing"

**Problem**: Missing `RESEND_API_KEY` or `CONTACT_EMAIL`

**Solution**: Add both to `.env.local`:
```bash
RESEND_API_KEY=re_your_key_here
CONTACT_EMAIL=hardikdadhich26@gmail.com
```

### "Resend API error: 401"

**Problem**: Invalid API key

**Solution**: 
1. Check API key in Resend dashboard
2. Make sure it starts with `re_`
3. Copy and paste carefully (no extra spaces)

### "Emails not arriving"

**Possible causes**:
1. **Check spam folder** - Resend emails might go to spam initially
2. **Verify API key** - Make sure it's active in Resend dashboard
3. **Check Resend logs** - Go to Resend dashboard → Logs
4. **Rate limit** - Free tier: 100 emails/day

### "FROM_EMAIL domain not verified"

**Problem**: Using custom domain without verification

**Solution**: 
- Use `onboarding@resend.dev` (no verification needed)
- OR verify your custom domain in Resend dashboard

---

## Rate Limits

### Free Tier Limits

- **3,000 emails/month**
- **100 emails/day**
- Perfect for personal portfolio contact forms!

### If You Exceed Limits

1. **Upgrade to Pro**: $20/month for 50,000 emails
2. **Add rate limiting**: Limit form submissions per IP
3. **Add CAPTCHA**: Prevent spam/abuse

---

## Security Best Practices

### 1. Never Commit API Keys

✅ API key in `.env.local` (gitignored)  
❌ API key in code or `.env.example`

### 2. Validate Input

Already implemented:
- Email format validation
- Message length limits (10-5000 chars)
- HTML sanitization
- XSS protection

### 3. Rate Limiting

Consider adding rate limiting:

```typescript
// lib/rate-limit.ts
import { RateLimiter } from './rate-limit';

const limiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// In API route
await limiter.check(request, 3); // 3 requests per minute
```

### 4. CAPTCHA (Optional)

For production, consider adding:
- Google reCAPTCHA
- hCaptcha
- Cloudflare Turnstile

---

## Alternative Email Services

If you prefer other services:

### SendGrid

```bash
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_key_here
FROM_EMAIL=contact@yourdomain.com
CONTACT_EMAIL=hardikdadhich26@gmail.com
```

**Free Tier**: 100 emails/day

### Gmail SMTP (Not Recommended)

Gmail has strict limits and may block automated emails.

---

## Monitoring

### Check Email Delivery

1. **Resend Dashboard**: View all sent emails
2. **Logs**: See delivery status, opens, clicks
3. **Webhooks**: Get notified of bounces/complaints

### Email Analytics

Resend provides:
- Delivery rate
- Open rate (if tracking enabled)
- Bounce rate
- Spam complaints

---

## Production Checklist

Before deploying:

- [ ] Resend account created
- [ ] API key generated and added to `.env.local`
- [ ] `EMAIL_SERVICE=resend` set
- [ ] `CONTACT_EMAIL=hardikdadhich26@gmail.com` set
- [ ] Test email sent successfully
- [ ] Email received in Gmail inbox
- [ ] Check spam folder if not in inbox
- [ ] (Optional) Custom domain verified
- [ ] (Optional) Rate limiting added
- [ ] (Optional) CAPTCHA added

---

## Deployment Notes

### Vercel

Add environment variables in Vercel dashboard:
```
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_key_here
CONTACT_EMAIL=hardikdadhich26@gmail.com
FROM_EMAIL=onboarding@resend.dev
```

### Hostinger VPS

Add to `.env.production`:
```bash
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_key_here
CONTACT_EMAIL=hardikdadhich26@gmail.com
FROM_EMAIL=onboarding@resend.dev
```

---

## Support

### Resend Support
- Documentation: [resend.com/docs](https://resend.com/docs)
- Discord: [resend.com/discord](https://resend.com/discord)
- Email: support@resend.com

### Your Implementation
- Check `lib/email.ts` for email logic
- Check `app/api/contact/route.ts` for API endpoint
- Check `components/ContactForm.tsx` for form component

---

## Quick Reference

```bash
# Environment Variables
EMAIL_SERVICE=resend                          # Email service to use
RESEND_API_KEY=re_xxxx                       # Your Resend API key
CONTACT_EMAIL=hardikdadhich26@gmail.com      # Where emails are sent
FROM_EMAIL=onboarding@resend.dev             # Sender address

# Test Commands
npm run dev                                   # Start dev server
curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","message":"Hello"}'

# Resend Dashboard
https://resend.com/emails                    # View sent emails
https://resend.com/api-keys                  # Manage API keys
https://resend.com/domains                   # Manage domains
```

---

**Ready to go!** 🚀

Just add your Resend API key to `.env.local` and start receiving contact form submissions at hardikdadhich26@gmail.com!
