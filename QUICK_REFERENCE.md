# Email Feature - Quick Reference Card

## 🚀 GET STARTED IN 3 STEPS

### Step 1: Get Gmail App Password (2 min)
```
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification (if not done)
3. Go to: https://myaccount.google.com/apppasswords
4. Select "Mail" and "Windows Computer"
5. Copy 16-character password
```

### Step 2: Add Environment Variables (3 min)

**RENDER.COM:**
```
Dashboard → Service → Settings → Environment
Add:
  EMAIL_ENABLED=true
  EMAIL_SERVICE=gmail
  EMAIL_USER=your@gmail.com
  EMAIL_PASSWORD=xxxxyyyy zzzz wwww
  EMAIL_RECIPIENT=your@gmail.com
  ERROR_EMAIL_THRESHOLD=3
Save & Deploy
```

**FLY.IO:**
```bash
fly secrets set EMAIL_ENABLED=true
fly secrets set EMAIL_SERVICE=gmail
fly secrets set EMAIL_USER=your@gmail.com
fly secrets set EMAIL_PASSWORD=xxxxyyyy zzzz wwww
fly secrets set EMAIL_RECIPIENT=your@gmail.com
fly deploy
```

### Step 3: Verify (1 min)
```
Check deployment logs for:
  [EMAIL] Email notifications enabled
Done! ✓
```

**TOTAL TIME: 6 minutes**

---

## 📚 DOCUMENTATION QUICK LINKS

| Need | File | Time |
|------|------|------|
| Overview | [START_HERE.md](START_HERE.md) | 2 min |
| Fast setup | [EMAIL_QUICKSTART.md](EMAIL_QUICKSTART.md) | 5 min |
| Detailed guide | [EMAIL_SETUP.md](EMAIL_SETUP.md) | 10 min |
| Step-by-step | [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | 15 min |
| How it works | [ARCHITECTURE.md](ARCHITECTURE.md) | 10 min |

---

## 🔨 TOOLS & COMMANDS

### Check Cookies
```bash
node check-cookie-expiry.js
```
Shows: Expired 🔴 | Expiring Soon 🟡 | Healthy 🟢

### Encode Cookies
```powershell
# Copy to clipboard
.\encode-cookies.ps1

# Send via email
.\encode-cookies.ps1 -EmailAddress "user@gmail.com" -SendEmail
```

### Monitor Cookies
```bash
node cookie-monitor.js
```
Checks expiry and sends alerts.

### Start Service
```bash
npm start
```

---

## ⚙️ CONFIGURATION VARIABLES

```bash
EMAIL_ENABLED=true                    # Enable/disable email
EMAIL_SERVICE=gmail                   # Provider
EMAIL_USER=sender@gmail.com           # Sender email
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx    # App password
EMAIL_RECIPIENT=notify@gmail.com      # Alert recipient
ERROR_EMAIL_THRESHOLD=3               # Errors before alert
COOKIE_EXPIRY_WARNING_DAYS=7          # Days to warn before expiry
```

---

## 🎯 WHAT YOU GET

✅ **Automatic Alerts**
- Sends email after 3 ping failures
- Includes error details
- Only sends once per failure

✅ **Cookie Monitoring**
- Check expiry anytime
- Get expiration dates
- See health status

✅ **Scheduled Checks**
- Daily cookie monitoring
- Email alerts
- Easy setup

---

## 🔒 SECURITY

✓ App-specific passwords (safer than main password)
✓ Environment variables (not in code)
✓ TLS-encrypted SMTP
✓ Secrets management

---

## ❓ COMMON QUESTIONS

**Q: Emails not arriving?**
A: Check logs for `[EMAIL]` messages. See EMAIL_SETUP.md troubleshooting.

**Q: Too many emails?**
A: Increase ERROR_EMAIL_THRESHOLD from 3 to 5+

**Q: How to disable emails?**
A: Set EMAIL_ENABLED=false and redeploy

**Q: Which email service to use?**
A: Gmail is easiest (just needs app password). Outlook/others work too.

**Q: Can I change email template?**
A: Yes - edit sendEmailAlert() function in index.js

**Q: How often do alerts send?**
A: Only after 3 consecutive errors. Won't spam you.

---

## 📋 DEPLOYMENT CHECKLIST

- [ ] Have Gmail app password ready
- [ ] Add environment variables
- [ ] Deploy (Render or Fly.io)
- [ ] Check logs for `[EMAIL] Email notifications enabled`
- [ ] Verify service is pinging (check /health endpoint)
- [ ] Test cookie status: `node check-cookie-expiry.js`
- [ ] Update cookies if needed

---

## 🚨 TROUBLESHOOTING QUICK FIX

**Not receiving emails?**

1. Check Gmail app password:
   - Must be 16 characters
   - Remove spaces
   - 2FA must be enabled

2. Check configuration:
   - EMAIL_ENABLED=true?
   - EMAIL_RECIPIENT set?

3. Check logs:
   - See [EMAIL] messages?
   - See errors?

4. Check spam folder

See [EMAIL_SETUP.md](EMAIL_SETUP.md) for more help.

---

## 📞 NEED HELP?

1. **Quick overview**: [START_HERE.md](START_HERE.md)
2. **Fast setup**: [EMAIL_QUICKSTART.md](EMAIL_QUICKSTART.md)
3. **Full guide**: [EMAIL_SETUP.md](EMAIL_SETUP.md)
4. **Troubleshooting**: See EMAIL_SETUP.md section
5. **Step-by-step**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## ⏱️ TIME ESTIMATES

- Setup: 5-10 minutes
- Local testing: 10 minutes (optional)
- Deployment: 5 minutes
- Verification: 2 minutes
- **Total: 20-30 minutes** (including testing)

---

## 🎯 YOUR NEXT STEP

**→ Start with [START_HERE.md](START_HERE.md) for quick overview**

Or jump directly to setup guide for your platform:
- Render.com: [EMAIL_SETUP.md](EMAIL_SETUP.md) - Render section
- Fly.io: [EMAIL_SETUP.md](EMAIL_SETUP.md) - Fly.io section
- Local: [EMAIL_QUICKSTART.md](EMAIL_QUICKSTART.md)

---

**You've got this! 🚀**

*All the documentation you need is included. Just pick your platform and follow the steps.*
