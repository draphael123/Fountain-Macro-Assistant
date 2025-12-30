# PowerShell script to create a shareable ZIP file
# Excludes development files and only includes necessary extension files

$sourceDir = $PSScriptRoot
$zipName = "fountain-macro-assistant-extension.zip"
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

# Create ZIP file
$zipPath = Join-Path $sourceDir $zipName
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Write-Host "`nCreating ZIP file..." -ForegroundColor Green
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# Clean up temp directory
Remove-Item $tempDir -Recurse -Force

Write-Host "`n✓ Success! Created: $zipName" -ForegroundColor Green
Write-Host "`nLocation: $zipPath" -ForegroundColor Cyan
Write-Host "`nYou can now share this ZIP file with others." -ForegroundColor Cyan
Write-Host "See SHARING_GUIDE.md for instructions to share with recipients." -ForegroundColor Cyan

