# Script to encode cookies.json to base64 for Render.com environment variables
# Usage: .\encode-cookies.ps1 -EmailAddress "your@email.com" -SendEmail

param(
    [string]$EmailAddress = "",
    [switch]$SendEmail = $false
)

Write-Host "=== Cookie Encoder for Render.com ===" -ForegroundColor Cyan
Write-Host ""

# Check if cookies.json exists
if (-not (Test-Path "cookies.json")) {
    Write-Host "Error: cookies.json not found!" -ForegroundColor Red
    Write-Host "Please run the app locally first to generate cookies:" -ForegroundColor Yellow
    Write-Host "  `$env:HEADLESS='false'" -ForegroundColor Yellow
    Write-Host "  node index-authenticated.js" -ForegroundColor Yellow
    exit 1
}

# Read cookies file
$cookiesContent = Get-Content .\cookies.json -Raw

# Encode to base64
$bytes = [System.Text.Encoding]::UTF8.GetBytes($cookiesContent)
$base64 = [Convert]::ToBase64String($bytes)

# Display result
Write-Host "[OK] Cookies encoded successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Copy the following base64 string:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Gray
Write-Host $base64 -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps for Render.com:" -ForegroundColor Cyan
Write-Host "1. Go to your Render.com service dashboard" -ForegroundColor White
Write-Host "2. Navigate to Environment tab" -ForegroundColor White
Write-Host "3. Add new environment variable:" -ForegroundColor White
Write-Host "   Name:  GOOGLE_COOKIES_BASE64" -ForegroundColor Yellow
Write-Host "   Value: [paste the base64 string above]" -ForegroundColor Yellow
Write-Host "4. Add your workspace URL:" -ForegroundColor White
Write-Host "   Name:  IDX_WORKSPACE_URL" -ForegroundColor Yellow
Write-Host "   Value: https://your-workspace.idx.google.com" -ForegroundColor Yellow
Write-Host "5. Save and redeploy" -ForegroundColor White
Write-Host ""

# Also save to clipboard if possible
try {
    $base64 | Set-Clipboard
    Write-Host "[OK] Base64 string also copied to clipboard!" -ForegroundColor Green
} catch {
    Write-Host "Note: Could not copy to clipboard automatically" -ForegroundColor Yellow
}

# Send email if requested
if ($SendEmail -and $EmailAddress) {
    Write-Host ""
    Write-Host "Sending email to $EmailAddress..." -ForegroundColor Cyan
    
    try {
        $EmailParams = @{
            To = $EmailAddress
            From = "cookies-encoder@keepalive.local"
            Subject = "IDX Cookies Encoded - Action Required"
            Body = @"
Your IDX cookies have been successfully encoded and are ready for deployment.

IMPORTANT: Update your environment variables with this base64 string within the next 30 days.

This cookie will expire based on the timestamps in your cookies.json file.

Base64 String:
$base64

To deploy:
1. Go to your Render.com service dashboard
2. Navigate to Environment tab
3. Add/update environment variable:
   Name:  GOOGLE_COOKIES_BASE64
   Value: [paste the base64 string above]
4. Save and redeploy

Set a reminder to update your cookies before expiration!
"@
            SmtpServer = "localhost"
            UseSsl = $false
        }
        
        # Try to send via local SMTP or show instructions
        try {
            Send-MailMessage @EmailParams
            Write-Host "[OK] Email sent successfully!" -ForegroundColor Green
        } catch {
            Write-Host "[WARNING] Could not send via local SMTP" -ForegroundColor Yellow
            Write-Host "To enable email notifications, configure your SMTP server" -ForegroundColor Yellow
            Write-Host "Or use the Node.js service with EMAIL_ENABLED=true" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[ERROR] Failed to prepare email: $_" -ForegroundColor Red
    }
}

