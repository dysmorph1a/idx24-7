const fs = require('fs');

// Load cookies
const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));

// Check expiration function (same as in index-authenticated.js)
function areCookiesExpiring(cookies, bufferMinutes = 10) {
  if (!cookies || cookies.length === 0) return true;
  
  const now = Date.now() / 1000;
  const bufferSeconds = bufferMinutes * 60;
  
  const criticalCookies = cookies.filter(c => 
    c.name.includes('SIDTS') || 
    c.name.includes('SIDCC') ||
    c.name === '__Secure-1PSID' ||
    c.name === '__Secure-3PSID'
  );
  
  console.log(`\nFound ${criticalCookies.length} critical auth cookies:`);
  
  if (criticalCookies.length === 0) {
    console.log('⚠️  No critical auth cookies found');
    return true;
  }
  
  let expiringSoon = false;
  
  for (const cookie of criticalCookies) {
    if (cookie.expirationDate) {
      const timeUntilExpiry = cookie.expirationDate - now;
      const minutesLeft = Math.floor(timeUntilExpiry / 60);
      const hoursLeft = Math.floor(timeUntilExpiry / 3600);
      const expDate = new Date(cookie.expirationDate * 1000).toISOString();
      
      console.log(`  ${cookie.name}:`);
      console.log(`    Expires: ${expDate}`);
      console.log(`    Time left: ${hoursLeft}h ${minutesLeft % 60}m`);
      
      if (timeUntilExpiry < bufferSeconds) {
        console.log(`    ⏰ EXPIRING SOON! (< ${bufferMinutes} minutes)`);
        expiringSoon = true;
      } else {
        console.log(`    ✓ Still valid`);
      }
    } else {
      console.log(`  ${cookie.name}: Session cookie (no expiration)`);
    }
  }
  
  return expiringSoon;
}

console.log('=== Cookie Expiration Test ===');
console.log(`Current time: ${new Date().toISOString()}`);

const expiring10min = areCookiesExpiring(cookies, 10);
console.log(`\n10-minute buffer: ${expiring10min ? '❌ EXPIRING' : '✓ OK'}`);

const expiring1hour = areCookiesExpiring(cookies, 60);
console.log(`\n60-minute buffer: ${expiring1hour ? '❌ EXPIRING' : '✓ OK'}`);

const expiring1day = areCookiesExpiring(cookies, 1440);
console.log(`\n1-day buffer: ${expiring1day ? '❌ EXPIRING' : '✓ OK'}`);
