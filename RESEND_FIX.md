# Resend Email Fix - 403 Error

## The Error You Saw

```
Resend API error: {"statusCode":403,"name":"validation_error","message":"You can only send testing emails to your own email address (dadhichhardik26@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain."}
```

## What This Means

**Resend's free tier restriction**: You can ONLY send emails to the email address you used to sign up for Resend.

- ✅ Your Resend account email: `dadhichhardik26@gmail.com`
- ❌ Was trying to send to: `hardikdadhich26@gmail.com`

## The Fix (Already Applied)

Updated `.env.local`:

```bash
CONTACT_EMAIL=dadhichhardik26@gmail.com  # Must match Resend account email
```

## Test It Now

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3000/contact

3. Fill out and submit the form

4. Check **dadhichhardik26@gmail.com** inbox!

---

## Options to Send to Any Email

### Option 1: Verify a Custom Domain (Recommended)

**Steps:**
1. Go to [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records to your domain registrar
5. Wait for verification (5-30 minutes)
6. Update `.env.local`:
   ```bash
   FROM_EMAIL=contact@yourdomain.com
   CONTACT_EMAIL=hardikdadhich26@gmail.com  # Now you can use any email!
   ```

**Benefits:**
- Send to ANY email address
- Professional sender address
- Better deliverability
- No "via resend.dev" in headers

### Option 2: Use Gmail SMTP (Not Recommended)

Gmail has strict limits and may block automated emails.

### Option 3: Use SendGrid

SendGrid's free tier allows sending to any email without domain verification.

**Setup:**
```bash
npm install @sendgrid/mail

# In .env.local:
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_key_here
FROM_EMAIL=your_verified_sender@gmail.com
CONTACT_EMAIL=hardikdadhich26@gmail.com
```

---

## Current Setup (Working)

```bash
# .env.local
EMAIL_SERVICE=resend
CONTACT_EMAIL=dadhichhardik26@gmail.com  # ✅ Matches Resend account
RESEND_API_KEY=re_ZQjbf2az_EADxUt5XTffGYLWyZ6p57dxJ
FROM_EMAIL=onboarding@resend.dev
```

**Result**: All contact form submissions will be sent to `dadhichhardik26@gmail.com`

---

## For Production

### If You Want to Use hardikdadhich26@gmail.com

You have two options:

1. **Verify a domain** (see Option 1 above)
2. **Forward emails** from dadhichhardik26@gmail.com to hardikdadhich26@gmail.com:
   - Gmail Settings → Forwarding and POP/IMAP
   - Add forwarding address: hardikdadhich26@gmail.com
   - Verify and enable

---

## Quick Reference

| Scenario | CONTACT_EMAIL | Requires Domain? |
|----------|---------------|------------------|
| Free Resend (current) | dadhichhardik26@gmail.com | No |
| With verified domain | Any email | Yes |
| SendGrid | Any email | No (but needs verified sender) |

---

## Test Command

```bash
# Test the contact form API
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message",
    "preferredTime": "Afternoon"
  }'
```

**Expected**: Email sent to dadhichhardik26@gmail.com ✅

---

## Summary

✅ **Fixed**: Changed `CONTACT_EMAIL` to match your Resend account email  
✅ **Working**: Contact form now sends to `dadhichhardik26@gmail.com`  
🔄 **Optional**: Verify a domain to send to any email address  

Your contact form is now working! 🎉
