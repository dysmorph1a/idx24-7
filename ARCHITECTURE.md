# Email Notifications Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     IDX Keep-Alive Service                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │      Node.js Service (index.js)      │
        │                                       │
        │  • Pings IDX workspace every 5 min  │
        │  • Tracks consecutive errors         │
        │  • Manages health status             │
        └─────────────────────────────────────┘
                    ↓             ↓
        ┌──────────────┐  ┌──────────────┐
        │   Success    │  │   Error      │
        │              │  │              │
        │  Reset count │  │  Increment   │
        │  Clear flag  │  │  error count │
        └──────────────┘  └──────────────┘
                              ↓
                    ┌──────────────────┐
                    │  Errors ≥ 3?     │
                    └──────────────────┘
                         ↓       ↓
                       NO       YES
                         ↓       ↓
                    Continue   Send Email
                                ↓
                    ┌──────────────────────────┐
                    │   Nodemailer Transporter │
                    │                          │
                    │  SMTP: Gmail/Outlook    │
                    │  Auth: App Password     │
                    └──────────────────────────┘
                              ↓
                    ┌──────────────────────────┐
                    │   Email Alert Sent       │
                    │   To: EMAIL_RECIPIENT    │
                    └──────────────────────────┘
```

## Component Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                     Your Deployment                            │
│  (Render.com / Fly.io / Local)                                │
└───────────────────────────────────────────────────────────────┘
                              │
                              ↓
        ┌─────────────────────────────────────┐
        │     Environment Variables           │
        │  • EMAIL_ENABLED=true               │
        │  • EMAIL_USER=your@gmail.com        │
        │  • EMAIL_PASSWORD=app-password      │
        │  • EMAIL_RECIPIENT=notify@gmail.com │
        │  • ERROR_EMAIL_THRESHOLD=3          │
        └─────────────────────────────────────┘
                              ↓
    ┌─────────────────────────────────────────────────────┐
    │              Main Application Flow                   │
    │  ┌──────────────┐                                    │
    │  │ index.js     │  ← Core pinging service            │
    │  │              │                                    │
    │  │ • Ping loop  │                                    │
    │  │ • Health API │                                    │
    │  │ • Email mgmt │                                    │
    │  └──────────────┘                                    │
    └─────────────────────────────────────────────────────┘
                              ↓
    ┌─────────────────────────────────────────────────────┐
    │          Cookie Management (PowerShell)             │
    │  ┌─────────────────────────────────────────┐        │
    │  │ encode-cookies.ps1                      │        │
    │  │ • Encode cookies to base64              │        │
    │  │ • Copy to clipboard                     │        │
    │  │ • Optional: Send via email              │        │
    │  └─────────────────────────────────────────┘        │
    └─────────────────────────────────────────────────────┘
                              ↓
    ┌─────────────────────────────────────────────────────┐
    │         Cookie Monitoring (Node.js)                 │
    │  ┌──────────────────────────────────────┐           │
    │  │ check-cookie-expiry.js               │           │
    │  │ • Parse cookies.json                 │           │
    │  │ • Analyze expiry dates               │           │
    │  │ • Report status (CLI)                │           │
    │  └──────────────────────────────────────┘           │
    │                                                      │
    │  ┌──────────────────────────────────────┐           │
    │  │ cookie-monitor.js                    │           │
    │  │ • Check expiry dates                 │           │
    │  │ • Send email alerts if needed        │           │
    │  │ • Can run as cron job                │           │
    │  └──────────────────────────────────────┘           │
    └─────────────────────────────────────────────────────┘
```

## Data Flow

### Scenario 1: Service Failure Alert

```
1. Ping fails
   ↓
2. Error count increments (3x)
   ↓
3. Check threshold (errorCount >= ERROR_EMAIL_THRESHOLD)
   ↓
4. Initialize Nodemailer transporter
   ↓
5. Build HTML email content with:
   • Error message
   • Consecutive error count
   • Workspace URL
   • Timestamp
   ↓
6. Send via SMTP (Gmail/Outlook)
   ↓
7. Email received ✓
   ↓
8. Set emailAlertSent flag (prevent duplicates)
   ↓
9. Continue monitoring
   ↓
10. Service recovers
    ↓
11. Reset count and flag
```

### Scenario 2: Cookie Expiry Check

```
1. Run: node check-cookie-expiry.js
   ↓
2. Read cookies.json
   ↓
3. Parse each cookie's expirationDate
   ↓
4. Compare with current time
   ↓
5. Categorize:
   • Expired: expiryDate < now
   • Expiring soon: expiryDate < now + COOKIE_EXPIRY_WARNING_DAYS
   • Healthy: everything else
   ↓
6. Display formatted report
   ↓
7. Optional: Send alert via cookie-monitor.js
```

## File Relationships

```
index.js (Main Service)
  ├── Uses: nodemailer (npm package)
  ├── Imports: (none - uses built-ins)
  └── Triggers: sendEmailAlert() on errors
      └── Uses: Nodemailer SMTP

encode-cookies.ps1 (PowerShell)
  ├── Reads: cookies.json
  ├── Outputs: base64 string
  └── Optional: Send email via SMTP

check-cookie-expiry.js (Utility)
  ├── Reads: cookies.json
  ├── Imports: check-cookie-expiry.js functions
  └── Outputs: Formatted report

cookie-monitor.js (Scheduled)
  ├── Imports: nodemailer, check-cookie-expiry.js
  ├── Reads: cookies.json
  ├── Triggers: sendEmailAlert() if needed
  └── Can be: Cron job, Windows Task, Manual run

package.json
  └── Dependencies:
      ├── puppeteer (existing)
      └── nodemailer (NEW)
```

## Email Flow

```
┌────────────────────────────────────┐
│     Trigger Event                  │
│  • 3+ consecutive errors           │
│  • Cookie expiry alert             │
│  • Manual: encode-cookies.ps1      │
└────────────────────────────────────┘
            ↓
┌────────────────────────────────────┐
│  Build Email Content               │
│  • HTML template                   │
│  • Event details                   │
│  • Action steps                    │
└────────────────────────────────────┘
            ↓
┌────────────────────────────────────┐
│  Nodemailer Transporter            │
│  Service: Gmail / Outlook / Custom │
│  Port: 587 (TLS)                   │
│  Auth: User + App Password         │
└────────────────────────────────────┘
            ↓
┌────────────────────────────────────┐
│  SMTP Server                       │
│  • Validates credentials           │
│  • Routes message                  │
│  • Delivers to recipient           │
└────────────────────────────────────┘
            ↓
┌────────────────────────────────────┐
│  Email Received ✓                  │
│  • Inbox/Spam check                │
│  • Subject: [IDX Keep-Alive] ...   │
│  • From: EMAIL_USER                │
│  • To: EMAIL_RECIPIENT             │
└────────────────────────────────────┘
```

## Configuration Chain

```
Environment Variables (Deployment Platform)
        ↓
Loading in Node.js (CONFIG object)
        ↓
Initialization (initializeEmail())
        ↓
Nodemailer Transporter Setup
        ↓
Email Ready State
        ↓
sendEmailAlert() available for use
```

## Monitoring Points

```
Service Health
├── Console Logs
│   ├── [OK] Workspace is alive
│   ├── [WARNING] Unexpected status
│   ├── [EMAIL] Email sent: subject
│   └── [ERROR] Failed to send email
│
├── HTTP Health Endpoint
│   └── GET /health
│       └── Returns JSON with status
│
└── Email Logs (in your email account)
    └── Review sent emails for confirmation
```

## Error Handling

```
Email Send Attempt
    ↓
    ├─ Success ✓
    │  └─ Set emailAlertSent = true
    │     (prevents duplicates)
    │
    └─ Failure ✗
       ├─ Log error message
       ├─ Continue pinging
       │  (don't crash)
       └─ Try again on next event
          (exponential backoff optional)
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Render.com/Fly.io                         │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Running Service (Node.js)                     │  │
│  │                                                        │  │
│  │  Environment Variables:                              │  │
│  │  ├─ EMAIL_ENABLED ────┐                             │  │
│  │  ├─ EMAIL_SERVICE     │                             │  │
│  │  ├─ EMAIL_USER        ├─ → CONFIG object           │  │
│  │  ├─ EMAIL_PASSWORD    │                             │  │
│  │  └─ EMAIL_RECIPIENT ──┘                             │  │
│  │                                                        │  │
│  │  Modules:                                             │  │
│  │  ├─ nodemailer (npm install)                         │  │
│  │  ├─ https/http (built-in)                            │  │
│  │  └─ fs/path (built-in)                               │  │
│  │                                                        │  │
│  │  Running Processes:                                  │  │
│  │  ├─ Ping loop (every 5 mins)                         │  │
│  │  ├─ Error tracking                                   │  │
│  │  ├─ Email dispatcher (on-demand)                     │  │
│  │  └─ HTTP health server (port 8080)                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          ↓                                    │
│            ┌─────────────────────────┐                       │
│            │   External SMTP Server  │                       │
│            │   (Gmail/Outlook)       │                       │
│            └─────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
                ┌──────────────────┐
                │  Email Delivered │
                │  To Recipient    │
                └──────────────────┘
```

## Security Architecture

```
Local System
├─ Credentials in Environment
│  └─ Never in code/git
│
├─ Gmail App Password
│  ├─ 16-character generated password
│  ├─ 2FA required
│  └─ More secure than main password
│
└─ SMTP Connection (TLS)
   ├─ Encrypted transmission
   ├─ Port 587
   └─ No plain-text passwords sent

Deployment Platform
├─ Secrets Management
│  ├─ Render: Environment variables
│  └─ Fly.io: Secrets
│
└─ Never logged
   └─ Credentials not in deployment logs
```

---

## Summary

The email notification system is a multi-layered architecture that:

1. **Monitors** - Tracks service health and cookie status
2. **Detects** - Identifies issues (errors, expiry)
3. **Alerts** - Sends emails via SMTP
4. **Reports** - Shows status via CLI and HTTP

All components work together to keep you informed about your IDX Keep-Alive service status.
