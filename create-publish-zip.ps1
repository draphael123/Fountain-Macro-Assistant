# PowerShell script to create a clean ZIP file for Chrome Web Store submission
# This excludes all development files and documentation

$extensionName = "fountain-macro-assistant"
$zipName = "$extensionName-extension.zip"
$tempFolder = "temp-publish"

Write-Host "Creating clean extension package for Chrome Web Store..." -ForegroundColor Green

# Create temporary folder
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# Copy only necessary files
Write-Host "Copying extension files..." -ForegroundColor Yellow

# Core files
Copy-Item "manifest.json" -Destination "$tempFolder\manifest.json"
Copy-Item "popup.html" -Destination "$tempFolder\popup.html"
Copy-Item "popup.css" -Destination "$tempFolder\popup.css"
Copy-Item "popup.js" -Destination "$tempFolder\popup.js"
Copy-Item "content.js" -Destination "$tempFolder\content.js"
Copy-Item "options.html" -Destination "$tempFolder\options.html"
Copy-Item "options.css" -Destination "$tempFolder\options.css"
Copy-Item "options.js" -Destination "$tempFolder\options.js"

# Icons folder
Write-Host "Copying icons..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "$tempFolder\icons" | Out-Null
Copy-Item "icons\icon16.png" -Destination "$tempFolder\icons\icon16.png" -ErrorAction SilentlyContinue
Copy-Item "icons\icon48.png" -Destination "$tempFolder\icons\icon48.png" -ErrorAction SilentlyContinue
Copy-Item "icons\icon128.png" -Destination "$tempFolder\icons\icon128.png" -ErrorAction SilentlyContinue

# Remove old ZIP if exists
if (Test-Path $zipName) {
    Remove-Item $zipName -Force
    Write-Host "Removed old ZIP file" -ForegroundColor Yellow
}

# Create ZIP file
Write-Host "Creating ZIP file..." -ForegroundColor Yellow
Compress-Archive -Path "$tempFolder\*" -DestinationPath $zipName -Force

# Clean up
Remove-Item $tempFolder -Recurse -Force

Write-Host "`n✅ Package created successfully: $zipName" -ForegroundColor Green
Write-Host "`nFiles included:" -ForegroundColor Cyan
Write-Host "  - manifest.json"
Write-Host "  - popup.html, popup.css, popup.js"
Write-Host "  - content.js"
Write-Host "  - options.html, options.css, options.js"
Write-Host "  - icons/ (icon16.png, icon48.png, icon128.png)"
Write-Host "`nReady to upload to Chrome Web Store!" -ForegroundColor Green

