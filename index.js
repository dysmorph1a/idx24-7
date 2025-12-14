const https = require('https');
const http = require('http');
const nodemailer = require('nodemailer');

// Configuration
const CONFIG = {
  IDX_WORKSPACE_URL: process.env.IDX_WORKSPACE_URL || 'https://your-workspace.idx.google.com',
  PING_INTERVAL_MS: parseInt(process.env.PING_INTERVAL_MS) || 5 * 60 * 1000, // 5 minutes default
  SESSION_COOKIE: process.env.IDX_SESSION_COOKIE || '', // Optional: Add session cookie if needed
  HEALTH_CHECK_PORT: parseInt(process.env.PORT) || 8080,
  // Email configuration
  EMAIL_ENABLED: process.env.EMAIL_ENABLED === 'true',
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_RECIPIENT: process.env.EMAIL_RECIPIENT || '',
  ERROR_EMAIL_THRESHOLD: parseInt(process.env.ERROR_EMAIL_THRESHOLD) || 3, // Send email after N consecutive errors
  COOKIE_EXPIRY_WARNING_DAYS: parseInt(process.env.COOKIE_EXPIRY_WARNING_DAYS) || 7,
};

let pingCount = 0;
let lastPingStatus = 'never pinged';
let lastPingTime = null;
let consecutiveErrors = 0;
let emailAlertSent = false;
let transporter = null;

// Initialize email transporter
function initializeEmail() {
  if (CONFIG.EMAIL_ENABLED && CONFIG.EMAIL_USER && CONFIG.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: CONFIG.EMAIL_SERVICE,
      auth: {
        user: CONFIG.EMAIL_USER,
        pass: CONFIG.EMAIL_PASSWORD,
      },
    });
    console.log('[EMAIL] Email notifications enabled');
  } else if (CONFIG.EMAIL_ENABLED) {
    console.warn('[EMAIL] Email enabled but credentials missing. Skipping email setup.');
  }
}

// Send email notification
async function sendEmailAlert(subject, htmlContent) {
  if (!transporter || !CONFIG.EMAIL_RECIPIENT) {
    console.warn('[EMAIL] Cannot send email: transporter not configured or no recipient');
    return;
  }

  try {
    const mailOptions = {
      from: CONFIG.EMAIL_USER,
      to: CONFIG.EMAIL_RECIPIENT,
      subject: `[IDX Keep-Alive] ${subject}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log('[EMAIL] Alert sent:', subject);
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error.message);
  }
}

// Ping function
function pingIDXWorkspace() {
  const url = new URL(CONFIG.IDX_WORKSPACE_URL);
  const protocol = url.protocol === 'https:' ? https : http;
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'User-Agent': 'IDX-KeepAlive/1.0',
      'Accept': '*/*',
    },
    timeout: 30000, // 30 second timeout
  };

  // Add session cookie if provided
  if (CONFIG.SESSION_COOKIE) {
    options.headers['Cookie'] = CONFIG.SESSION_COOKIE;
  }

  const req = protocol.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      pingCount++;
      lastPingTime = new Date().toISOString();
      lastPingStatus = `HTTP ${res.statusCode}`;
      consecutiveErrors = 0; // Reset error counter on success
      emailAlertSent = false; // Reset email flag
      
      console.log(`[${lastPingTime}] Ping #${pingCount}: ${lastPingStatus} - ${CONFIG.IDX_WORKSPACE_URL}`);
      
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`[OK] Workspace is alive`);
      } else {
        console.warn(`[WARNING] Unexpected status code: ${res.statusCode}`);
      }
    });
  });

  req.on('error', async (error) => {
    pingCount++;
    lastPingTime = new Date().toISOString();
    lastPingStatus = `ERROR: ${error.message}`;
    consecutiveErrors++;
    console.error(`[${lastPingTime}] Ping #${pingCount} failed:`, error.message);

    // Send email alert after threshold of consecutive errors
    if (consecutiveErrors >= CONFIG.ERROR_EMAIL_THRESHOLD && !emailAlertSent && transporter) {
      emailAlertSent = true;
      const htmlContent = `
        <h2>IDX Workspace Service Alert</h2>
        <p>Your IDX workspace keep-alive service is experiencing issues.</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <p><strong>Consecutive Errors:</strong> ${consecutiveErrors}</p>
        <p><strong>Workspace:</strong> ${CONFIG.IDX_WORKSPACE_URL}</p>
        <p><strong>Time:</strong> ${lastPingTime}</p>
        <p>Please check your workspace connectivity and cookies.</p>
      `;
      await sendEmailAlert('Service Failure Alert', htmlContent);
    }
  });

  req.on('timeout', () => {
    req.destroy();
    console.error(`[${new Date().toISOString()}] Ping timeout after 30s`);
  });

  req.end();
}

// Health check server for container orchestrators
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      pingCount,
      lastPingStatus,
      lastPingTime,
      config: {
        workspace: CONFIG.IDX_WORKSPACE_URL,
        intervalMinutes: CONFIG.PING_INTERVAL_MS / 60000,
      },
      uptime: process.uptime(),
    }, null, 2));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Start server
server.listen(CONFIG.HEALTH_CHECK_PORT, () => {
  console.log(`=== IDX Keep-Alive Pinger Started ===`);
  console.log(`Workspace: ${CONFIG.IDX_WORKSPACE_URL}`);
  console.log(`Ping interval: ${CONFIG.PING_INTERVAL_MS / 1000}s (${CONFIG.PING_INTERVAL_MS / 60000} minutes)`);
  console.log(`Health check: http://localhost:${CONFIG.HEALTH_CHECK_PORT}/health`);
  console.log(`Using session cookie: ${CONFIG.SESSION_COOKIE ? 'Yes' : 'No'}`);
  console.log(`Email alerts: ${CONFIG.EMAIL_ENABLED ? 'Enabled' : 'Disabled'}`);
  console.log(`=====================================\n`);

  // Initialize email
  initializeEmail();

  // Initial ping
  pingIDXWorkspace();
  
  // Schedule periodic pings
  setInterval(pingIDXWorkspace, CONFIG.PING_INTERVAL_MS);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
