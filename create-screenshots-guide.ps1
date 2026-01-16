# PowerShell script to help create screenshots for the website
# This script opens the extension and guides you through taking screenshots

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Screenshot Creation Guide" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This script will help you take screenshots for the website.`n" -ForegroundColor Yellow

# Check if extension is loaded
Write-Host "Step 1: Make sure your extension is loaded in Chrome" -ForegroundColor Green
Write-Host "  - Go to chrome://extensions/" -ForegroundColor White
Write-Host "  - Enable Developer mode" -ForegroundColor White
Write-Host "  - Click 'Load unpacked' and select this folder`n" -ForegroundColor White

$continue = Read-Host "Press Enter when extension is loaded, or 'q' to quit"
if ($continue -eq 'q') { exit }

# Screenshot 1: Popup
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Screenshot 1: Extension Popup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "  1. Click the extension icon in Chrome toolbar" -ForegroundColor White
Write-Host "  2. Create 3-5 example macros if needed:" -ForegroundColor White
Write-Host "     - /email → your.email@example.com" -ForegroundColor Gray
Write-Host "     - /phone → (555) 123-4567" -ForegroundColor Gray
Write-Host "     - /sig → Best regards, Your Name" -ForegroundColor Gray
Write-Host "  3. Take screenshot of the popup" -ForegroundColor White
Write-Host "     Windows: Windows + Shift + S" -ForegroundColor Gray
Write-Host "     Mac: Cmd + Shift + 4" -ForegroundColor Gray
Write-Host "  4. Save as: screenshots\usage-1-popup.png`n" -ForegroundColor White

$continue = Read-Host "Press Enter when screenshot 1 is saved, or 'q' to skip"
if ($continue -ne 'q') {
    $screenshot1 = "vercel-landing\screenshots\usage-1-popup.png"
    if (Test-Path $screenshot1) {
        Write-Host "✓ Found: usage-1-popup.png" -ForegroundColor Green
    } else {
        Write-Host "✗ Not found: usage-1-popup.png" -ForegroundColor Yellow
        Write-Host "  Make sure to save it in vercel-landing\screenshots\ folder" -ForegroundColor Yellow
    }
}

# Screenshot 2: Creating Macro
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Screenshot 2: Creating Macro" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "  1. Open extension popup" -ForegroundColor White
Write-Host "  2. Click '+ Add Macro' button" -ForegroundColor White
Write-Host "  3. Fill in example:" -ForegroundColor White
Write-Host "     Shortcut: /email" -ForegroundColor Gray
Write-Host "     Expansion: your.email@example.com" -ForegroundColor Gray
Write-Host "  4. Take screenshot of the modal" -ForegroundColor White
Write-Host "  5. Save as: screenshots\usage-2-creating-macro.png`n" -ForegroundColor White

$continue = Read-Host "Press Enter when screenshot 2 is saved, or 'q' to skip"
if ($continue -ne 'q') {
    $screenshot2 = "vercel-landing\screenshots\usage-2-creating-macro.png"
    if (Test-Path $screenshot2) {
        Write-Host "✓ Found: usage-2-creating-macro.png" -ForegroundColor Green
    } else {
        Write-Host "✗ Not found: usage-2-creating-macro.png" -ForegroundColor Yellow
    }
}

# Screenshot 3: Text Expansion
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Screenshot 3: Text Expansion" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "  1. Open Google Docs, Gmail, or any text field" -ForegroundColor White
Write-Host "  2. Type a shortcut (e.g., /email )" -ForegroundColor White
Write-Host "  3. Show it expanding or the expanded result" -ForegroundColor White
Write-Host "  4. Take screenshot" -ForegroundColor White
Write-Host "  5. Save as: screenshots\usage-3-text-expansion.png`n" -ForegroundColor White

$continue = Read-Host "Press Enter when screenshot 3 is saved, or 'q' to skip"
if ($continue -ne 'q') {
    $screenshot3 = "vercel-landing\screenshots\usage-3-text-expansion.png"
    if (Test-Path $screenshot3) {
        Write-Host "✓ Found: usage-3-text-expansion.png" -ForegroundColor Green
    } else {
        Write-Host "✗ Not found: usage-3-text-expansion.png" -ForegroundColor Yellow
    }
}

# Screenshot 4: Settings
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Screenshot 4: Settings Page" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "  1. Right-click extension icon → 'Options'" -ForegroundColor White
Write-Host "     OR go to chrome://extensions/ → Details → Extension options" -ForegroundColor White
Write-Host "  2. Show the settings page with export/import" -ForegroundColor White
Write-Host "  3. Take screenshot" -ForegroundColor White
Write-Host "  4. Save as: screenshots\usage-4-settings.png`n" -ForegroundColor White

$continue = Read-Host "Press Enter when screenshot 4 is saved, or 'q' to skip"
if ($continue -ne 'q') {
    $screenshot4 = "vercel-landing\screenshots\usage-4-settings.png"
    if (Test-Path $screenshot4) {
        Write-Host "✓ Found: usage-4-settings.png" -ForegroundColor Green
    } else {
        Write-Host "✗ Not found: usage-4-settings.png" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$screenshots = @(
    "vercel-landing\screenshots\usage-1-popup.png",
    "vercel-landing\screenshots\usage-2-creating-macro.png",
    "vercel-landing\screenshots\usage-3-text-expansion.png",
    "vercel-landing\screenshots\usage-4-settings.png"
)

$found = 0
foreach ($screenshot in $screenshots) {
    if (Test-Path $screenshot) {
        Write-Host "✓ $(Split-Path $screenshot -Leaf)" -ForegroundColor Green
        $found++
    } else {
        Write-Host "✗ $(Split-Path $screenshot -Leaf)" -ForegroundColor Yellow
    }
}

Write-Host "`nFound $found of 4 screenshots" -ForegroundColor $(if ($found -eq 4) { "Green" } else { "Yellow" })

if ($found -eq 4) {
    Write-Host "`n✅ All screenshots are ready!" -ForegroundColor Green
    Write-Host "The screenshots will automatically appear on the website." -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  Some screenshots are missing." -ForegroundColor Yellow
    Write-Host "Add the missing screenshots to: vercel-landing\screenshots\" -ForegroundColor Yellow
    Write-Host "See vercel-landing\screenshots\TAKE_SCREENSHOTS.md for detailed instructions." -ForegroundColor Yellow
}

Write-Host "`nPress Enter to exit..."
Read-Host








