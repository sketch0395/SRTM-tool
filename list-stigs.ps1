# List Local STIGs Script
# Shows what STIGs are currently in your local library
# Usage: .\list-stigs.ps1

$stigsDir = ".\public\stigs"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Local STIG Library Status" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $stigsDir)) {
    Write-Host "❌ Local STIG directory not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Expected location: $stigsDir" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Download STIG Library from: https://public.cyber.mil/stigs/downloads/" -ForegroundColor White
    Write-Host "   2. Extract using: .\extract-stigs.ps1 -ZipPath 'path\to\STIG_Library.zip'" -ForegroundColor White
    Write-Host ""
    exit 0
}

$directories = Get-ChildItem -Path $stigsDir -Directory -ErrorAction SilentlyContinue

if ($directories.Count -eq 0) {
    Write-Host "📂 Directory exists but is empty" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Location: $stigsDir" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📋 To populate the library:" -ForegroundColor Cyan
    Write-Host "   1. Download STIG Library from: https://public.cyber.mil/stigs/downloads/" -ForegroundColor White
    Write-Host "   2. Extract using: .\extract-stigs.ps1 -ZipPath 'path\to\STIG_Library.zip'" -ForegroundColor White
    Write-Host ""
    exit 0
}

Write-Host "✅ Found $($directories.Count) STIG(s) in local library" -ForegroundColor Green
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Gray
Write-Host "║  STIG ID                          │ Files                 ║" -ForegroundColor Gray
Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Gray

foreach ($dir in $directories) {
    $files = Get-ChildItem -Path $dir.FullName -File
    $hasMetadata = $files | Where-Object { $_.Name -eq "metadata.json" }
    $xmlFiles = $files | Where-Object { $_.Extension -eq ".xml" }
    $csvFiles = $files | Where-Object { $_.Extension -eq ".csv" }
    
    $stigId = $dir.Name.PadRight(33)
    $fileInfo = ""
    
    if ($hasMetadata) {
        $fileInfo += "✓ metadata "
    } else {
        $fileInfo += "✗ metadata "
    }
    
    if ($xmlFiles.Count -gt 0) {
        $fileInfo += "✓ XML"
    } elseif ($csvFiles.Count -gt 0) {
        $fileInfo += "✓ CSV"
    } else {
        $fileInfo += "✗ STIG file"
    }
    
    $color = if ($hasMetadata -and ($xmlFiles.Count -gt 0 -or $csvFiles.Count -gt 0)) { 
        "Green" 
    } elseif ($hasMetadata -or $xmlFiles.Count -gt 0 -or $csvFiles.Count -gt 0) { 
        "Yellow" 
    } else { 
        "Red" 
    }
    
    Write-Host "║  $stigId │ " -ForegroundColor Gray -NoNewline
    Write-Host "$($fileInfo.PadRight(20)) " -ForegroundColor $color -NoNewline
    Write-Host "║" -ForegroundColor Gray
}

Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Gray
Write-Host ""

# Show detailed info for any incomplete STIGs
$incomplete = $directories | Where-Object {
    $files = Get-ChildItem -Path $_.FullName -File
    $hasMetadata = $files | Where-Object { $_.Name -eq "metadata.json" }
    $hasStigFile = ($files | Where-Object { $_.Extension -in @(".xml", ".csv") }).Count -gt 0
    -not ($hasMetadata -and $hasStigFile)
}

if ($incomplete.Count -gt 0) {
    Write-Host "⚠️  $($incomplete.Count) incomplete STIG(s) found:" -ForegroundColor Yellow
    foreach ($dir in $incomplete) {
        $files = Get-ChildItem -Path $dir.FullName -File
        Write-Host "   • $($dir.Name):" -ForegroundColor Yellow
        if ($files.Count -eq 0) {
            Write-Host "     - Directory is empty" -ForegroundColor Gray
        } else {
            Write-Host "     - Files: $($files.Name -join ', ')" -ForegroundColor Gray
        }
    }
    Write-Host ""
    Write-Host "💡 Tip: Re-run extract-stigs.ps1 to fix incomplete STIGs" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Total STIGs: $($directories.Count)" -ForegroundColor White
Write-Host "   Ready to use: $(($directories.Count - $incomplete.Count))" -ForegroundColor Green
if ($incomplete.Count -gt 0) {
    Write-Host "   Incomplete: $($incomplete.Count)" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Start dev server: npm run dev" -ForegroundColor White
Write-Host "   2. Go to STIG Requirements tab" -ForegroundColor White
Write-Host "   3. Click 'Local Library' button" -ForegroundColor White
Write-Host "   4. Import any STIG!" -ForegroundColor White
Write-Host ""
