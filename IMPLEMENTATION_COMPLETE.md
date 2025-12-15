# 📧 Email Notifications Feature - Implementation Complete

## Summary

I've successfully implemented comprehensive email notification functionality for your IDX Keep-Alive service. Here's what was added:

## ✅ What's Included

### 1. **Service Failure Alerts** (Automatic)
- Sends email after 3 consecutive ping errors (configurable)
- Includes error details, timestamp, and workspace URL
- Prevents email spam - only sends once per failure event
- Automatic recovery tracking

### 2. **Cookie Expiry Monitoring**
- **check-cookie-expiry.js**: Analyze cookie expiration dates
- Shows expired, expiring soon, and healthy cookies
- Color-coded output (🔴 🟡 🟢)
- Exit code indicates action needed

### 3. **Scheduled Cookie Monitor**
- **cookie-monitor.js**: Monitor cookies on a schedule
- Can be used as a cron job or Windows Task
- Sends email alerts when cookies need attention
- Shows expiry status and next steps

### 4. **Enhanced Cookie Encoder**
- PowerShell script now supports `-SendEmail` parameter
- Can send encoded cookies directly to email
- Useful for sharing credentials securely

### 5. **Comprehensive Documentation**
- **EMAIL_SETUP.md**: Complete setup guide (Gmail, Outlook, custom)
- **EMAIL_QUICKSTART.md**: 5-minute quick start
- **EMAIL_FEATURE_SUMMARY.md**: Feature overview
- **.env.example**: Updated with email configuration

## 📋 Files Created/Modified

### New Files
- ✨ **check-cookie-expiry.js** - Cookie expiry analyzer
- ✨ **cookie-monitor.js** - Scheduled monitoring script
- 📄 **EMAIL_SETUP.md** - Detailed setup guide
- 📄 **EMAIL_QUICKSTART.md** - Quick start guide
- 📄 **EMAIL_FEATURE_SUMMARY.md** - Feature reference

### Modified Files
- 🔧 **index.js** - Added email notification logic
- 🔧 **encode-cookies.ps1** - Added email parameter
- 🔧 **package.json** - Added nodemailer dependency
- 🔧 **.env.example** - Added email configuration variables

## 🚀 Quick Start (Choose Your Platform)

### For Render.com
1. Go to Dashboard → Your Service → Settings → Environment
2. Add these variables:
   ```
   EMAIL_ENABLED=true
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password (16 chars)
   EMAIL_RECIPIENT=your-email@gmail.com
   ERROR_EMAIL_THRESHOLD=3
   ```
3. Click "Save & Deploy"

### For Fly.io
```bash
fly secrets set EMAIL_ENABLED=true
fly secrets set EMAIL_SERVICE=gmail
fly secrets set EMAIL_USER=your-email@gmail.com
fly secrets set EMAIL_PASSWORD=your-app-password
fly secrets set EMAIL_RECIPIENT=your-email@gmail.com
fly secrets set ERROR_EMAIL_THRESHOLD=3
fly deploy
```

### For Local Testing
```powershell
npm install  # Install nodemailer
$env:EMAIL_ENABLED="true"
$env:EMAIL_USER="your@gmail.com"
$env:EMAIL_PASSWORD="app-password"
$env:EMAIL_RECIPIENT="your@gmail.com"
npm start
```

## ⚙️ Configuration Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EMAIL_ENABLED` | `false` | Enable email alerts |
| `EMAIL_SERVICE` | `gmail` | SMTP service (gmail, outlook, yahoo) |
| `EMAIL_USER` | - | Sender email address |
| `EMAIL_PASSWORD` | - | App password (not regular password) |
| `EMAIL_RECIPIENT` | - | Alert recipient email |
| `ERROR_EMAIL_THRESHOLD` | `3` | Errors before sending alert |
| `COOKIE_EXPIRY_WARNING_DAYS` | `7` | Days before expiry to warn |

## 📊 Usage Examples

### Check Cookie Status
```bash
node check-cookie-expiry.js
```

Shows expiration status with:
- 🔴 Expired cookies
- 🟡 Expiring soon (within 7 days)
- 🟢 Healthy cookies

**Current Status (Your Cookies):**
```
Total: 25 cookies
Expired: 2 cookies (__Secure-1PSIDRTS, __Secure-3PSIDRTS)
Healthy: 23 cookies
```

### Encode Cookies with Email
```powershell
# Without email (just clipboard)
.\encode-cookies.ps1

# With email notification
.\encode-cookies.ps1 -EmailAddress "your@email.com" -SendEmail
```

### Monitor Cookies on Schedule
```bash
# Run once
node cookie-monitor.js

# Or schedule as cron (Linux/Mac)
0 9 * * * /usr/bin/node /path/to/cookie-monitor.js

# Or schedule in Windows Task Scheduler
```

## 🔒 Security Notes

✅ **Best Practices:**
- Use Gmail app-specific password (not your main password)
- Enable 2FA on your Gmail account
- Never commit `.env` files to git
- Use environment variables for all credentials
- Rotate passwords periodically

❌ **Never:**
- Use your main Gmail password
- Commit credentials to git
- Share credentials in messages
- Store passwords in comments

## 📧 Email Alert Examples

### Service Failure Alert (Automatic)
Sent after 3 consecutive ping errors:
- Error message
- Number of consecutive errors
- Workspace URL
- Timestamp

### Cookie Expiry Alert (From Monitor)
When cookies are expiring soon:
- List of expired cookies
- List of expiring soon
- Days remaining
- Action steps

## 🔧 Advanced Configuration

### Use Different Email Service
```javascript
// In index.js, modify transporter config:
transporter = nodemailer.createTransport({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### Customize Email Template
Edit the `sendEmailAlert()` function in index.js to modify HTML content.

### Change Alert Threshold
Set `ERROR_EMAIL_THRESHOLD` to send alerts after different number of errors:
- `2` = More frequent alerts
- `5` = Less frequent alerts

## ✨ Current Status

**Your Cookies:**
- Total: 25 cookies
- ✅ Expired: 2 (need immediate update)
- ✅ Healthy: 23
- ⚠️ Action: Run `node check-cookie-expiry.js` to see details

**To Fix:**
1. Run `.\encode-cookies.ps1` to generate new cookies
2. Copy the base64 string
3. Update your deployment environment variable
4. Redeploy the service

## 📚 Documentation Files

For detailed help, see:
1. **EMAIL_QUICKSTART.md** - Get started in 5 minutes
2. **EMAIL_SETUP.md** - Complete configuration guide
3. **EMAIL_FEATURE_SUMMARY.md** - Feature reference
4. **.env.example** - Configuration templates

## ✅ Testing Checklist

- [ ] Install nodemailer: `npm install`
- [ ] Set email environment variables
- [ ] Deploy or restart service
- [ ] Check logs for `[EMAIL] Email notifications enabled`
- [ ] Test cookie checker: `node check-cookie-expiry.js`
- [ ] Trigger test by stopping service (after 3 pings, email should send)
- [ ] Check spam folder if email doesn't arrive

## 🎯 Next Steps

1. **Get Gmail App Password**
   - Enable 2FA at https://myaccount.google.com/security
   - Generate app password at https://myaccount.google.com/apppasswords

2. **Update Your Deployment**
   - Add email environment variables to Render/Fly.io
   - Install nodemailer: `npm install`

3. **Fix Expired Cookies**
   - Run `node check-cookie-expiry.js` to see details
   - Run `.\encode-cookies.ps1` to generate new cookies
   - Deploy the new base64 string

4. **Schedule Monitoring** (Optional)
   - Set up cron job or Windows Task for `cookie-monitor.js`
   - Runs daily to check cookie status

## 💡 Tips

- Start with `ERROR_EMAIL_THRESHOLD=5` to avoid too many emails
- Check deployment logs first if emails aren't arriving
- Test locally before deploying to production
- Keep your Gmail app password secure

---

**Everything is ready to use!** Check [EMAIL_QUICKSTART.md](EMAIL_QUICKSTART.md) to get started.
