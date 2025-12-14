#!/usr/bin/env node

/**
 * Cookie Expiry Monitor with Email Alerts
 * 
 * This script can be run as a cron job or scheduled task to monitor
 * cookie expiry and send email alerts when cookies are expiring soon.
 * 
 * Usage:
 *   node cookie-monitor.js                    # Manual run
 *   
 * Schedule as cron job (Linux/Mac):
 *   0 9 * * * /usr/bin/node /path/to/cookie-monitor.js
 *   (Runs daily at 9 AM)
 *   
 * Schedule as Windows Task:
 *   Task Scheduler → New Task → Run: node C:\path\to\cookie-monitor.js
 *   (Set to run daily or weekly)
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { getCookieStatus, formatReport } = require('./check-cookie-expiry');

const COOKIE_FILE = 'cookies.json';

// Configuration from environment variables
const CONFIG = {
  EMAIL_ENABLED: process.env.EMAIL_ENABLED === 'true',
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_RECIPIENT: process.env.EMAIL_RECIPIENT || '',
  COOKIE_EXPIRY_WARNING_DAYS: parseInt(process.env.COOKIE_EXPIRY_WARNING_DAYS) || 7,
};

async function sendEmailAlert(subject, htmlContent) {
  if (!CONFIG.EMAIL_USER || !CONFIG.EMAIL_PASSWORD) {
    console.warn('[EMAIL] Skipping email: credentials not configured');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: CONFIG.EMAIL_SERVICE,
      auth: {
        user: CONFIG.EMAIL_USER,
        pass: CONFIG.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: CONFIG.EMAIL_USER,
      to: CONFIG.EMAIL_RECIPIENT,
      subject: `[IDX Keep-Alive] ${subject}`,
      html: htmlContent,
    });

    console.log('[EMAIL] Alert sent:', subject);
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error.message);
  }
}

async function monitorCookies() {
  console.log(`[${new Date().toISOString()}] Checking cookie expiry...\n`);

  if (!fs.existsSync(COOKIE_FILE)) {
    console.error(`Error: ${COOKIE_FILE} not found`);
    process.exit(1);
  }

  try {
    const status = getCookieStatus();
    
    // Format the report
    console.log('');
    formatReport(status);

    // Check if we need to send an alert
    if (status.expired.length > 0 || status.expiringSoon.length > 0) {
      if (CONFIG.EMAIL_ENABLED && CONFIG.EMAIL_RECIPIENT) {
        // Build HTML email content
        let htmlContent = `
          <h2>Cookie Expiry Alert - Action Required</h2>
          <p>Your IDX cookies require attention.</p>
        `;

        if (status.expired.length > 0) {
          htmlContent += `
            <h3>🔴 Expired Cookies (Immediate Action)</h3>
            <ul>
          `;
          status.expired.forEach((cookie) => {
            htmlContent += `<li><strong>${cookie.name}</strong> - Expired ${Math.abs(cookie.daysLeft)} days ago</li>`;
          });
          htmlContent += '</ul>';
        }

        if (status.expiringSoon.length > 0) {
          htmlContent += `
            <h3>🟡 Expiring Soon (${CONFIG.COOKIE_EXPIRY_WARNING_DAYS} days)</h3>
            <ul>
          `;
          status.expiringSoon.forEach((cookie) => {
            htmlContent += `<li><strong>${cookie.name}</strong> - Expires in ${cookie.daysLeft} days</li>`;
          });
          htmlContent += '</ul>';
        }

        htmlContent += `
          <h3>Next Steps</h3>
          <ol>
            <li>Run: <code>node check-cookie-expiry.js</code> for details</li>
            <li>Run: <code>.\\encode-cookies.ps1</code> to update cookies</li>
            <li>Deploy the new base64 string to your service</li>
            <li>Verify service is working: <code>curl http://localhost:8080/health</code></li>
          </ol>
          <p><small>Sent at ${new Date().toISOString()}</small></p>
        `;

        await sendEmailAlert('Cookie Expiry Warning', htmlContent);
      } else if (status.expired.length > 0 || status.expiringSoon.length > 0) {
        console.warn('[ALERT] Cookies need attention but email is not configured');
        console.warn('To enable email alerts, set:');
        console.warn('  EMAIL_ENABLED=true');
        console.warn('  EMAIL_USER=your-email@gmail.com');
        console.warn('  EMAIL_PASSWORD=your-app-password');
        console.warn('  EMAIL_RECIPIENT=your-email@gmail.com');
      }
    } else {
      console.log('[OK] All cookies are healthy. No action needed.\n');
    }

  } catch (error) {
    console.error('Error monitoring cookies:', error.message);
    process.exit(1);
  }
}

// Run monitor
monitorCookies();
