# PowerShell script to create extension icons from mini fountain logo
# This script requires the .NET System.Drawing assembly

param(
    [string]$SourceImage = "mini-logo-source.png",
    [string]$OutputDir = "extension\icons"
)

Write-Host "Creating Extension Icons from Mini Fountain Logo" -ForegroundColor Cyan
Write-Host ""

# Check if source image exists
if (-not (Test-Path $SourceImage)) {
    Write-Host "Error: Source image '$SourceImage' not found!" -ForegroundColor Red
    Write-Host "Please make sure 'mini logo fountain.png' is copied to this directory as '$SourceImage'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can either:" -ForegroundColor Yellow
    Write-Host "  1. Open 'resize-mini-logo.html' in your browser and use the visual tool" -ForegroundColor Yellow
    Write-Host "  2. Use an online tool like https://www.favicon-generator.org/" -ForegroundColor Yellow
    exit 1
}

# Create output directory if it doesn't exist
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "Created output directory: $OutputDir" -ForegroundColor Green
}

# Load System.Drawing assembly
Add-Type -AssemblyName System.Drawing

try {
    # Load source image
    Write-Host "Loading source image: $SourceImage" -ForegroundColor Cyan
    $sourceBitmap = New-Object System.Drawing.Bitmap($SourceImage)
    
    $sizes = @(16, 48, 128)
    
    foreach ($size in $sizes) {
        Write-Host "  Creating icon${size}.png..." -ForegroundColor Yellow
        
        # Create new bitmap for resized image
        $newBitmap = New-Object System.Drawing.Bitmap($size, $size)
        $graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
        
        # Enable high-quality resizing
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Calculate scaling to fit while maintaining aspect ratio
        $scale = [Math]::Min($size / $sourceBitmap.Width, $size / $sourceBitmap.Height)
        $scaledWidth = [int]($sourceBitmap.Width * $scale)
        $scaledHeight = [int]($sourceBitmap.Height * $scale)
        
        # Center the image
        $x = ($size - $scaledWidth) / 2
        $y = ($size - $scaledHeight) / 2
        
        # Draw the resized image
        $graphics.DrawImage($sourceBitmap, $x, $y, $scaledWidth, $scaledHeight)
        
        # Save the icon
        $outputPath = Join-Path $OutputDir "icon${size}.png"
        $newBitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        Write-Host "    Saved: $outputPath" -ForegroundColor Green
        
        # Clean up
        $graphics.Dispose()
        $newBitmap.Dispose()
    }
    
    # Clean up source bitmap
    $sourceBitmap.Dispose()
    
    Write-Host ""
    Write-Host "Successfully created all extension icons!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Icons are now in: $OutputDir" -ForegroundColor White
    Write-Host "  2. Reload the extension in Chrome (chrome://extensions/)" -ForegroundColor White
    Write-Host "  3. You should see the mini fountain logo as the extension icon!" -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "Error creating icons: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Open resize-mini-logo.html in your browser for a visual tool" -ForegroundColor Yellow
    exit 1
}
