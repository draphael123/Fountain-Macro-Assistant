# PowerShell script to verify and fix extension files for loading in Chrome

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Extension Load Troubleshooter" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$extensionFolder = "fountain-macro-assistant-extension"
$sourceDir = $PSScriptRoot

# Check if folder exists
if (Test-Path $extensionFolder) {
    Write-Host "Found extension folder: $extensionFolder" -ForegroundColor Green
    $checkFolder = $extensionFolder
} else {
    Write-Host "Extension folder not found. Creating it..." -ForegroundColor Yellow
    Write-Host "Run: .\create-shareable-folder.ps1 first" -ForegroundColor Yellow
    Write-Host "`nOr I can create it now. Continue? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'Y' -or $response -eq 'y') {
        & "$sourceDir\create-shareable-folder.ps1"
        $checkFolder = $extensionFolder
    } else {
        Write-Host "Exiting. Please create the folder first." -ForegroundColor Red
        exit
    }
}

Write-Host "`nChecking extension files...`n" -ForegroundColor Yellow

# Required files
$requiredFiles = @(
    "manifest.json",
    "popup.html",
    "popup.css",
    "popup.js",
    "content.js",
    "background.js",
    "options.html",
    "options.css",
    "options.js"
)

$requiredIcons = @(
    "icons\icon16.png",
    "icons\icon48.png",
    "icons\icon128.png"
)

$allGood = $true

# Check required files
Write-Host "Checking required files..." -ForegroundColor Cyan
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $checkFolder $file
    if (Test-Path $filePath) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ MISSING: $file" -ForegroundColor Red
        $allGood = $false
    }
}

# Check icons
Write-Host "`nChecking icons..." -ForegroundColor Cyan
if (Test-Path (Join-Path $checkFolder "icons")) {
    Write-Host "  ✓ icons/ folder exists" -ForegroundColor Green
    foreach ($icon in $requiredIcons) {
        $iconPath = Join-Path $checkFolder $icon
        if (Test-Path $iconPath) {
            Write-Host "  ✓ $icon" -ForegroundColor Green
        } else {
            Write-Host "  ✗ MISSING: $icon" -ForegroundColor Red
            $allGood = $false
        }
    }
} else {
    Write-Host "  ✗ icons/ folder MISSING" -ForegroundColor Red
    $allGood = $false
}

# Check manifest.json structure
Write-Host "`nChecking manifest.json..." -ForegroundColor Cyan
$manifestPath = Join-Path $checkFolder "manifest.json"
if (Test-Path $manifestPath) {
    try {
        $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
        Write-Host "  ✓ manifest.json is valid JSON" -ForegroundColor Green
        
        # Check for required fields
        if ($manifest.manifest_version) {
            Write-Host "  ✓ manifest_version: $($manifest.manifest_version)" -ForegroundColor Green
        }
        if ($manifest.name) {
            Write-Host "  ✓ name: $($manifest.name)" -ForegroundColor Green
        }
        if ($manifest.version) {
            Write-Host "  ✓ version: $($manifest.version)" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ✗ manifest.json has errors: $_" -ForegroundColor Red
        $allGood = $false
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ All files are present and valid!" -ForegroundColor Green
    Write-Host "`nTo load in Chrome:" -ForegroundColor Yellow
    Write-Host "  1. Open Chrome → chrome://extensions/" -ForegroundColor White
    Write-Host "  2. Enable 'Developer mode' (toggle top right)" -ForegroundColor White
    Write-Host "  3. Click 'Load unpacked'" -ForegroundColor White
    Write-Host "  4. Select this folder: $checkFolder" -ForegroundColor White
    Write-Host "`nFull path: $(Resolve-Path $checkFolder)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Some files are missing!" -ForegroundColor Red
    Write-Host "`nFix options:" -ForegroundColor Yellow
    Write-Host "  1. Run: .\create-shareable-folder.ps1" -ForegroundColor White
    Write-Host "  2. Or manually copy missing files to: $checkFolder" -ForegroundColor White
    Write-Host "  3. See TROUBLESHOOT_EXTENSION_LOAD.md for help" -ForegroundColor White
}

Write-Host "`nPress Enter to exit..."
Read-Host







