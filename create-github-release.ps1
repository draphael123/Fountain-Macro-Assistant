# PowerShell script to prepare extension for GitHub release
# Creates a clean folder ready to upload to GitHub

$sourceDir = $PSScriptRoot
$folderName = "fountain-macro-assistant-extension-release"
$outputDir = Join-Path $sourceDir $folderName

Write-Host "Preparing extension for GitHub release..." -ForegroundColor Green

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

# Create README for GitHub
$readmePath = Join-Path $outputDir "README.md"
$readmeText = @'
# Fountain - Macro Assistant

Chrome extension for text expansion with macros, aliases, and conditional expansions.

## Installation

1. Download this repository (click Code → Download ZIP, or clone)
2. Extract the ZIP file (if downloaded)
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top right)
5. Click "Load unpacked"
6. Select this folder
7. Done!

## Files Included

- `manifest.json` - Extension manifest
- `popup.html/css/js` - Extension popup interface
- `content.js` - Text expansion engine
- `background.js` - Background service worker
- `options.html/css/js` - Settings page
- `icons/` - Extension icons

## Usage

1. Click the extension icon in Chrome toolbar
2. Click "+ Add Macro" to create shortcuts
3. Type your shortcut anywhere and press Space or Enter
4. Watch it expand automatically!

For more information, visit: https://fountain-macro-assistant.vercel.app/
'@
Set-Content -Path $readmePath -Value $readmeText
Write-Host "  ✓ Created README.md" -ForegroundColor Gray

Write-Host "`n✓ Success! Created release folder: $folderName" -ForegroundColor Green
Write-Host "`nLocation: $outputDir" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Create GitHub repository" -ForegroundColor White
Write-Host "  2. Upload files from this folder to GitHub" -ForegroundColor White
Write-Host "  3. Create a release (optional)" -ForegroundColor White
Write-Host "  4. Share the repository link" -ForegroundColor White
Write-Host "`nUsers can:" -ForegroundColor Yellow
Write-Host "  - Clone the repository (git clone) - Gets folder directly!" -ForegroundColor White
Write-Host "  - Download ZIP from GitHub" -ForegroundColor White
Write-Host "  - Download individual files" -ForegroundColor White
