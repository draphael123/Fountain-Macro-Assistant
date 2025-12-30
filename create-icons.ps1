# PowerShell script to create simple placeholder icons
# Run this script to generate the required icon files

$iconsDir = Join-Path $PSScriptRoot "icons"

# Create icons directory if it doesn't exist
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
}

# Create a simple colored square as placeholder
# We'll use .NET to create simple bitmap images
Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param(
        [int]$Size,
        [string]$OutputPath
    )
    
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Fill with blue background
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(66, 133, 244))
    $graphics.FillRectangle($brush, 0, 0, $Size, $Size)
    
    # Draw white text "FA"
    $font = New-Object System.Drawing.Font("Arial", ($Size * 0.4), [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $graphics.DrawString("FA", $font, $textBrush, ($Size/2), ($Size/2), $format)
    
    # Save as PNG
    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
}

Write-Host "Creating icon files..."

Create-Icon -Size 16 -OutputPath (Join-Path $iconsDir "icon16.png")
Create-Icon -Size 48 -OutputPath (Join-Path $iconsDir "icon48.png")
Create-Icon -Size 128 -OutputPath (Join-Path $iconsDir "icon128.png")

Write-Host "Icons created successfully!"
Write-Host "Files created:"
Write-Host "  - icons/icon16.png"
Write-Host "  - icons/icon48.png"
Write-Host "  - icons/icon128.png"

