#!/usr/bin/env node

/**
 * Cookie Expiry Checker
 * Parses cookies.json and alerts about expiring cookies
 */

const fs = require('fs');
const path = require('path');

const COOKIE_FILE = 'cookies.json';
const WARNING_DAYS = parseInt(process.env.COOKIE_EXPIRY_WARNING_DAYS) || 7;

function getCookieStatus() {
  if (!fs.existsSync(COOKIE_FILE)) {
    console.error(`Error: ${COOKIE_FILE} not found`);
    process.exit(1);
  }

  try {
    const cookiesData = JSON.parse(fs.readFileSync(COOKIE_FILE, 'utf8'));
    const cookies = Array.isArray(cookiesData) ? cookiesData : [cookiesData];

    const now = Date.now();
    const warningTime = now + (WARNING_DAYS * 24 * 60 * 60 * 1000);

    const results = {
      total: cookies.length,
      expired: [],
      expiringSoon: [],
      healthy: [],
    };

    cookies.forEach((cookie) => {
      if (!cookie.expirationDate) {
        results.healthy.push({
          name: cookie.name || 'unknown',
          expiry: 'session cookie (no expiry)',
        });
        return;
      }

      const expiryMs = cookie.expirationDate * 1000;
      const daysLeft = Math.ceil((expiryMs - now) / (24 * 60 * 60 * 1000));
      const expiryDate = new Date(expiryMs);

      if (expiryMs < now) {
        results.expired.push({
          name: cookie.name || 'unknown',
          expiryDate: expiryDate.toISOString(),
          daysLeft: daysLeft,
        });
      } else if (expiryMs < warningTime) {
        results.expiringSoon.push({
          name: cookie.name || 'unknown',
          expiryDate: expiryDate.toISOString(),
          daysLeft: daysLeft,
        });
      } else {
        results.healthy.push({
          name: cookie.name || 'unknown',
          expiryDate: expiryDate.toISOString(),
          daysLeft: daysLeft,
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error reading cookies:', error.message);
    process.exit(1);
  }
}

function formatReport(status) {
  console.log('\n=== Cookie Expiry Status ===\n');
  console.log(`Total Cookies: ${status.total}`);
  console.log(`Warning Threshold: ${WARNING_DAYS} days\n`);

  if (status.expired.length > 0) {
    console.log('🔴 EXPIRED COOKIES (Action Required Immediately):');
    status.expired.forEach((cookie) => {
      console.log(`  - ${cookie.name}`);
      console.log(`    Expired: ${cookie.expiryDate} (${cookie.daysLeft} days ago)\n`);
    });
  }

  if (status.expiringSoon.length > 0) {
    console.log('🟡 EXPIRING SOON (Update within 7 days):');
    status.expiringSoon.forEach((cookie) => {
      console.log(`  - ${cookie.name}`);
      console.log(`    Expires: ${cookie.expiryDate} (${cookie.daysLeft} days left)\n`);
    });
  }

  if (status.healthy.length > 0) {
    console.log(`🟢 HEALTHY (${status.healthy.length} cookies):`);
    status.healthy.forEach((cookie) => {
      if (cookie.expiry === 'session cookie (no expiry)') {
        console.log(`  - ${cookie.name}: ${cookie.expiry}`);
      } else {
        console.log(`  - ${cookie.name}: Expires in ${cookie.daysLeft} days`);
      }
    });
  }

  console.log('\n========================\n');

  // Return summary
  const needsAction = status.expired.length > 0 || status.expiringSoon.length > 0;
  return {
    needsAction,
    expiredCount: status.expired.length,
    expiringSoonCount: status.expiringSoon.length,
  };
}

// Main
if (require.main === module) {
  const status = getCookieStatus();
  const summary = formatReport(status);

  // Exit with error code if action needed
  if (summary.needsAction) {
    console.log('⚠️  ACTION REQUIRED: Some cookies need attention!\n');
    process.exit(1);
  }

  console.log('✓ All cookies are healthy.\n');
  process.exit(0);
}

module.exports = { getCookieStatus, formatReport };
