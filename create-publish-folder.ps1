# PowerShell script to create a clean extension folder for Chrome Web Store submission
# Creates a ready-to-use folder instead of a ZIP file
# Note: Chrome Web Store still requires ZIP, but this creates a clean folder you can ZIP manually

$extensionName = "fountain-macro-assistant"
$folderName = "$extensionName-extension"
$outputDir = Join-Path $PSScriptRoot $folderName

Write-Host "Creating clean extension folder for Chrome Web Store..." -ForegroundColor Green

# Remove old folder if exists
if (Test-Path $outputDir) {
    Remove-Item $outputDir -Recurse -Force
    Write-Host "Removed old folder" -ForegroundColor Yellow
}

# Create output directory
New-Item -ItemType Directory -Path $outputDir | Out-Null

# Copy only necessary files
Write-Host "`nCopying extension files..." -ForegroundColor Yellow

# Core files
$coreFiles = @(
    "manifest.json",
    "popup.html",
    "popup.css",
    "popup.js",
    "content.js",
    "options.html",
    "options.css",
    "options.js",
    "background.js"
)

foreach ($file in $coreFiles) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $outputDir
        Write-Host "  ✓ Copied $file" -ForegroundColor Gray
    }
}

# Icons folder
Write-Host "`nCopying icons..." -ForegroundColor Yellow
$iconsDest = Join-Path $outputDir "icons"
New-Item -ItemType Directory -Path $iconsDest | Out-Null

$iconFiles = @("icon16.png", "icon48.png", "icon128.png")
foreach ($icon in $iconFiles) {
    $iconPath = Join-Path "icons" $icon
    if (Test-Path $iconPath) {
        Copy-Item $iconPath -Destination $iconsDest
        Write-Host "  ✓ Copied $icon" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ Missing: $icon" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Folder created successfully: $folderName" -ForegroundColor Green
Write-Host "`nLocation: $outputDir" -ForegroundColor Cyan
Write-Host "`nNote: For Chrome Web Store submission, you'll need to ZIP this folder." -ForegroundColor Yellow
Write-Host "You can do this by:" -ForegroundColor Yellow
Write-Host "  1. Right-click the folder → Send to → Compressed (zipped) folder" -ForegroundColor White
Write-Host "  2. Or use: Compress-Archive -Path '$folderName\*' -DestinationPath '$extensionName-extension.zip'" -ForegroundColor White







