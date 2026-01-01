# PowerShell script to create a shareable extension package
# Creates a folder instead of ZIP file for easier installation
# Note: This script now creates a folder. Use create-shareable-folder.ps1 for the new version.

$sourceDir = $PSScriptRoot
$folderName = "fountain-macro-assistant-extension"
$outputDir = Join-Path $sourceDir $folderName
$tempDir = Join-Path $env:TEMP "fountain-app-temp"

# Clean up temp directory if it exists
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

# Create temp directory
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "Creating shareable extension package..." -ForegroundColor Green

# Copy necessary files
$filesToInclude = @(
    "manifest.json",
    "popup.html",
    "popup.css",
    "popup.js",
    "content.js",
    "options.html",
    "options.css",
    "options.js"
)

foreach ($file in $filesToInclude) {
    $sourcePath = Join-Path $sourceDir $file
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath -Destination $tempDir
        Write-Host "  ✓ Copied $file" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ Missing: $file" -ForegroundColor Yellow
    }
}

# Copy icons folder
$iconsSource = Join-Path $sourceDir "icons"
$iconsDest = Join-Path $tempDir "icons"
if (Test-Path $iconsSource) {
    Copy-Item $iconsSource -Destination $iconsDest -Recurse
    Write-Host "  ✓ Copied icons folder" -ForegroundColor Gray
} else {
    Write-Host "  ✗ Warning: icons folder not found!" -ForegroundColor Yellow
    Write-Host "    Create icons before sharing (see ICONS_INSTRUCTIONS.md)" -ForegroundColor Yellow
}

# Create output folder (instead of ZIP)
if (Test-Path $outputDir) {
    Remove-Item $outputDir -Recurse -Force
}

Write-Host "`nCreating extension folder..." -ForegroundColor Green
New-Item -ItemType Directory -Path $outputDir | Out-Null
Copy-Item "$tempDir\*" -Destination $outputDir -Recurse -Force

# Clean up temp directory
Remove-Item $tempDir -Recurse -Force

Write-Host "`n✓ Success! Created folder: $folderName" -ForegroundColor Green
Write-Host "`nLocation: $outputDir" -ForegroundColor Cyan
Write-Host "`nThis folder is ready to be loaded as an unpacked extension." -ForegroundColor Cyan
Write-Host "`nTo install:" -ForegroundColor Yellow
Write-Host "  1. Open Chrome → chrome://extensions/" -ForegroundColor White
Write-Host "  2. Enable 'Developer mode'" -ForegroundColor White
Write-Host "  3. Click 'Load unpacked' and select this folder" -ForegroundColor White
Write-Host "See SHARING_GUIDE.md for instructions to share with recipients." -ForegroundColor Cyan

