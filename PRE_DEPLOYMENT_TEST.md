# Pre-Deployment Test Checklist

## Automated Tests

### 1. Build Test
```bash
npm run build
```
**Expected**: Build completes successfully without errors

### 2. Security Check
```bash
npm run security-check
```
**Expected**: No critical security issues

### 3. Authentication Tests
```bash
npm run test:auth
```
**Expected**: All authentication tests pass

---

## Manual Tests

### Homepage (/)
- [ ] Page loads without errors
- [ ] Profile photo displays
- [ ] Typewriter animation works
- [ ] Social links work
- [ ] About Me section visible
- [ ] Work Experience displays
- [ ] Skills & Expertise section shows all categories
- [ ] Skills badges visible in light and dark mode
- [ ] Projects section displays
- [ ] Interests section shows
- [ ] "Hire Me" section displays with gradient
- [ ] Resume download link works
- [ ] Dark mode toggle works
- [ ] Navigation menu works

### Blog (/blog)
- [ ] Blog page loads
- [ ] "Building Next.js Portfolio" post displays
- [ ] Blog card shows title, excerpt, date
- [ ] Click on blog post opens detail page
- [ ] Blog content renders correctly
- [ ] Code blocks formatted properly
- [ ] Back navigation works

### Papershelf (/accomplishment)
- [ ] Papers/blogs list displays
- [ ] Filter by type works (All/Papers/Blogs)
- [ ] Pagination works
- [ ] Search functionality works
- [ ] Papers display in table format

### Goals (/goals)
- [ ] Goals page loads
- [ ] All 100 goals display
- [ ] Goals are organized properly
- [ ] Responsive layout works

### Contact (/contact)
- [ ] Contact form displays
- [ ] All fields present (Name, Email, Message, Preferred Time)
- [ ] Form validation works
- [ ] Submit button enabled
- [ ] Email sends successfully
- [ ] Success message displays
- [ ] Email received at dadhichhardik26@gmail.com

### Admin Panel (/admin/login)
- [ ] Login page loads
- [ ] Can login with admin credentials
- [ ] Invalid credentials rejected
- [ ] Redirects to dashboard after login

### Admin Dashboard (/admin/dashboard)
- [ ] Dashboard loads after login
- [ ] Papers tab shows papers list
- [ ] Blogs tab shows blogs list
- [ ] Can create new paper/blog
- [ ] Can edit existing paper/blog
- [ ] Can delete paper/blog
- [ ] Logout button works

---

## Cross-Browser Testing

### Desktop
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari

### Mobile
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design works

---

## Performance Tests

- [ ] Lighthouse score > 90
- [ ] Page load time < 3 seconds
- [ ] Images optimized
- [ ] No console errors
- [ ] No console warnings

---

## Security Tests

- [ ] No sensitive data in code
- [ ] Environment variables not exposed
- [ ] Database file not accessible
- [ ] Admin routes protected
- [ ] CSRF protection enabled
- [ ] Input sanitization working
- [ ] XSS protection working

---

## Database Tests

- [ ] Database file exists
- [ ] Admin user exists
- [ ] Can query papers
- [ ] Can insert new records
- [ ] Can update records
- [ ] Can delete records

---

## Email Tests

- [ ] Contact form sends email
- [ ] Email received at correct address
- [ ] Email content formatted correctly
- [ ] Reply-to address is sender's email
- [ ] No email errors in logs

---

## Environment Variables

- [ ] NEXTAUTH_SECRET set
- [ ] NEXTAUTH_URL set
- [ ] EMAIL_SERVICE set
- [ ] RESEND_API_KEY set
- [ ] CONTACT_EMAIL set
- [ ] FROM_EMAIL set

---

## Git & GitHub

- [ ] No .env files in git
- [ ] No database files in git
- [ ] No node_modules in git
- [ ] .gitignore properly configured
- [ ] README.md updated
- [ ] All documentation complete

---

## Deployment Readiness

- [ ] Production build works
- [ ] All tests pass
- [ ] Documentation complete
- [ ] Environment variables documented
- [ ] Deployment guide ready
- [ ] Backup strategy in place

---

## Test Results

**Date**: ___________  
**Tester**: ___________  
**Status**: ⬜ PASS / ⬜ FAIL  

**Notes**:
___________________________________________
___________________________________________
___________________________________________
