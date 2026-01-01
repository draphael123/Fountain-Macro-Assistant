# PowerShell script to create a shareable extension folder
# Creates a ready-to-use folder instead of a ZIP file

$sourceDir = $PSScriptRoot
$folderName = "fountain-macro-assistant-extension"
$outputDir = Join-Path $sourceDir $folderName

Write-Host "Creating shareable extension folder..." -ForegroundColor Green

# Remove old folder if it exists
if (Test-Path $outputDir) {
    Remove-Item $outputDir -Recurse -Force
    Write-Host "Removed old folder" -ForegroundColor Yellow
}

# Create output directory
New-Item -ItemType Directory -Path $outputDir | Out-Null

# Copy necessary files
$filesToInclude = @(
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

Write-Host "`nCopying extension files..." -ForegroundColor Yellow
foreach ($file in $filesToInclude) {
    $sourcePath = Join-Path $sourceDir $file
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath -Destination $outputDir
        Write-Host "  ✓ Copied $file" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ Missing: $file" -ForegroundColor Yellow
    }
}

# Copy icons folder
$iconsSource = Join-Path $sourceDir "icons"
$iconsDest = Join-Path $outputDir "icons"
if (Test-Path $iconsSource) {
    New-Item -ItemType Directory -Path $iconsDest | Out-Null
    Copy-Item "$iconsSource\*" -Destination $iconsDest -Recurse
    Write-Host "  ✓ Copied icons folder" -ForegroundColor Gray
} else {
    Write-Host "  ✗ Warning: icons folder not found!" -ForegroundColor Yellow
    Write-Host "    Create icons before sharing (see ICONS_INSTRUCTIONS.md)" -ForegroundColor Yellow
}

Write-Host "`n✓ Success! Created folder: $folderName" -ForegroundColor Green
Write-Host "`nLocation: $outputDir" -ForegroundColor Cyan
Write-Host "`nThis folder is ready to be loaded as an unpacked extension in Chrome." -ForegroundColor Cyan
Write-Host "`nTo install:" -ForegroundColor Yellow
Write-Host "  1. Open Chrome and go to chrome://extensions/" -ForegroundColor White
Write-Host "  2. Enable Developer mode (toggle in top right)" -ForegroundColor White
Write-Host "  3. Click Load unpacked" -ForegroundColor White
Write-Host "  4. Select this folder: $folderName" -ForegroundColor White
