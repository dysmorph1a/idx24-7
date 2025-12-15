# Email Feature Summary

## What was added?

### 1. **Service Failure Alerts** (index.js)
- Automatically sends email after 3 consecutive ping errors
- Prevents email spam by only sending once per error event
- Includes error details and timestamp

### 2. **Cookie Expiry Checker** (check-cookie-expiry.js)
- New Node.js utility to analyze cookie expiration dates
- Shows expired, expiring soon, and healthy cookies
- Can be run manually or integrated into cron jobs

### 3. **Enhanced Cookie Encoder** (encode-cookies.ps1)
- Added optional `-SendEmail` parameter
- Can send encoded cookies directly to email
- Useful for sharing cookies securely

### 4. **Documentation**
- **EMAIL_SETUP.md**: Complete configuration guide
- **EMAIL_QUICKSTART.md**: 5-minute quick start
- **.env.example**: Updated with email variables

## Configuration Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `EMAIL_ENABLED` | Enable/disable emails | `true` |
| `EMAIL_SERVICE` | SMTP provider | `gmail` |
| `EMAIL_USER` | Sender email | `your@gmail.com` |
| `EMAIL_PASSWORD` | App password (not regular password) | `xxxx xxxx xxxx xxxx` |
| `EMAIL_RECIPIENT` | Where to send alerts | `your@gmail.com` |
| `ERROR_EMAIL_THRESHOLD` | Errors before alert | `3` |
| `COOKIE_EXPIRY_WARNING_DAYS` | Days before expiry to warn | `7` |

## Installation

### Step 1: Install Dependencies
```bash
npm install nodemailer
```

### Step 2: Configure Email (Choose One)

**Gmail (Recommended):**
1. Enable 2FA at https://myaccount.google.com/security
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Use the 16-character password

**Other Services:**
- Outlook: Use your password directly
- Custom SMTP: Modify transporter config in index.js

### Step 3: Deploy

**Render.com:**
```
Environment → Add variables → Save & Deploy
```

**Fly.io:**
```bash
fly secrets set EMAIL_ENABLED=true
# Add other variables...
fly deploy
```

**Local Testing:**
```powershell
$env:EMAIL_ENABLED="true"
$env:EMAIL_USER="your@gmail.com"
$env:EMAIL_PASSWORD="your-app-password"
$env:EMAIL_RECIPIENT="your@gmail.com"
npm start
```

## Usage Examples

### Check Cookie Status
```bash
node check-cookie-expiry.js
```

Output shows:
- 🔴 Expired cookies (immediate action needed)
- 🟡 Expiring soon (update within 7 days)
- 🟢 Healthy cookies

### Encode Cookies with Email
```powershell
# Basic (no email)
.\encode-cookies.ps1

# With email
.\encode-cookies.ps1 -EmailAddress "your@email.com" -SendEmail
```

### Monitor Service
```bash
npm start
```

Service will:
1. Start pinging your IDX workspace
2. Log each ping result
3. Send email if 3+ pings fail in a row
4. Display health check at http://localhost:8080/health

## Files Modified

- ✏️ **index.js**: Added email notification logic (~60 lines)
- ✏️ **encode-cookies.ps1**: Added email parameter (~40 lines)
- ✏️ **package.json**: Added nodemailer dependency
- ✏️ **.env.example**: Added email configuration section

## Files Created

- 📄 **check-cookie-expiry.js**: Cookie expiry analyzer
- 📄 **EMAIL_SETUP.md**: Detailed configuration guide
- 📄 **EMAIL_QUICKSTART.md**: Quick start guide
- 📄 **EMAIL_FEATURE_SUMMARY.md**: This file

## Testing Email

The service automatically tests email connectivity on startup:
- Check logs for: `[EMAIL] Email notifications enabled`
- Or: `[EMAIL] Email enabled but credentials missing`

First email will be sent after 3 consecutive ping errors (configurable).

## Troubleshooting

### Emails not received?
1. Check deployment logs for `[EMAIL]` messages
2. Verify Gmail app password (not regular password)
3. Check spam folder
4. Verify `EMAIL_RECIPIENT` is set correctly

### Too many emails?
- Increase `ERROR_EMAIL_THRESHOLD` from 3 to 5+

### Want to disable emails?
- Set `EMAIL_ENABLED=false` and redeploy

### Customize email template?
- Edit `sendEmailAlert()` function in index.js
- Modify HTML content as needed

## Security Best Practices

✅ **DO:**
- Use app-specific passwords for Gmail
- Use environment variables for credentials
- Enable 2FA for Gmail account
- Use secret management in Render/Fly.io

❌ **DON'T:**
- Commit `.env` file to git
- Use your main Gmail password
- Share credentials in messages/tickets
- Store passwords in comments

## Future Enhancements

Planned features:
- [ ] Cookie expiry email alerts (proactive warnings)
- [ ] Email digests (daily/weekly summaries)
- [ ] Custom email templates
- [ ] Multiple recipients
- [ ] Webhook integration

## Support

For detailed help, see:
- [EMAIL_SETUP.md](EMAIL_SETUP.md) - Full setup guide
- [EMAIL_QUICKSTART.md](EMAIL_QUICKSTART.md) - 5-minute setup
- [.env.example](.env.example) - Configuration reference

---

**Note**: Your cookies currently have 2 expired cookies. Run `node check-cookie-expiry.js` and regenerate them using `encode-cookies.ps1`.
