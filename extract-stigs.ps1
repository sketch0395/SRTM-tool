# STIG Library Extraction Script
# Extracts DISA STIG Library ZIP files to the local library structure
# Usage: .\extract-stigs.ps1 -ZipPath "C:\Downloads\U_STIG_Library_2024_12.zip"

param(
    [Parameter(Mandatory=$true, HelpMessage="Path to the DISA STIG Library ZIP file (e.g., 'C:\Downloads\U_STIG_Library_2024_12.zip')")]
    [string]$ZipPath,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = ".\public\stigs"
)

# Clean up the ZipPath - remove quotes if user included them
$ZipPath = $ZipPath.Trim('"').Trim("'")

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  STIG Library Extraction Tool" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Validate ZIP file exists
if (-not (Test-Path $ZipPath)) {
    Write-Host "❌ Error: File not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Path provided: $ZipPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Instructions:" -ForegroundColor Cyan
    Write-Host "   1. Download the DISA STIG Library ZIP from:" -ForegroundColor White
    Write-Host "      https://public.cyber.mil/stigs/downloads/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Run this script with the full path to the ZIP file:" -ForegroundColor White
    Write-Host "      .\extract-stigs.ps1 -ZipPath 'C:\Downloads\U_STIG_Library_2024_12.zip'" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Validate it's actually a ZIP file
if (-not ($ZipPath -match '\.zip$')) {
    Write-Host "⚠️  Warning: File doesn't have .zip extension!" -ForegroundColor Yellow
    Write-Host "   Path: $ZipPath" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        Write-Host "❌ Cancelled by user" -ForegroundColor Red
        exit 1
    }
}

# Ensure output directory exists
if (-not (Test-Path $OutputDir)) {
    Write-Host "📁 Creating output directory: $OutputDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Get file size for display
$zipFile = Get-Item $ZipPath
$fileSizeMB = [math]::Round($zipFile.Length / 1MB, 2)

Write-Host "🔍 Extracting STIG Library..." -ForegroundColor Cyan
Write-Host "   Source: $ZipPath ($fileSizeMB MB)" -ForegroundColor Gray
Write-Host "   Destination: $OutputDir" -ForegroundColor Gray
Write-Host ""

# Create temp extraction directory
$tempDir = Join-Path $env:TEMP "stig_extract_$(Get-Random)"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
    # Extract main ZIP
    Write-Host "📦 Extracting main ZIP archive..." -ForegroundColor Yellow
    Expand-Archive -Path $ZipPath -DestinationPath $tempDir -Force
    
    # Check if there are nested ZIP files (common in STIG Library compilations)
    $nestedZips = Get-ChildItem -Path $tempDir -Filter "*.zip" -Recurse
    
    if ($nestedZips.Count -gt 0) {
        Write-Host "📦 Found $($nestedZips.Count) nested STIG ZIP files" -ForegroundColor Yellow
        Write-Host "   Extracting nested ZIPs..." -ForegroundColor Gray
        
        foreach ($nestedZip in $nestedZips) {
            $nestedExtractDir = Join-Path $tempDir "extracted_$($nestedZip.BaseName)"
            try {
                Expand-Archive -Path $nestedZip.FullName -DestinationPath $nestedExtractDir -Force -ErrorAction SilentlyContinue
            } catch {
                Write-Host "   ⚠️  Could not extract $($nestedZip.Name)" -ForegroundColor Yellow
            }
        }
        Write-Host ""
    }
    
    # Find all XCCDF XML files (STIG format)
    # STIGs are typically named: *_Manual-xccdf.xml or *_STIG*.xml
    # Exclude SRG files (Security Requirements Guides are not STIGs)
    $xmlFiles = Get-ChildItem -Path $tempDir -Filter "*xccdf.xml" -Recurse | Where-Object { 
        # Include Manual-xccdf files (these are the actual STIGs)
        # Include any file with STIG in the name
        # Exclude SRG files (we want STIGs, not Security Requirements Guides)
        ($_.Name -like "*Manual-xccdf.xml" -or $_.Name -like "*STIG*.xml") -and
        $_.Name -notlike "*SRG*.xml"
    }
    
    Write-Host "✅ Found $($xmlFiles.Count) STIG XML files" -ForegroundColor Green
    
    if ($xmlFiles.Count -gt 10) {
        Write-Host "   (Processing all $($xmlFiles.Count) files - this may take a few minutes)" -ForegroundColor Gray
    }
    Write-Host ""
    
    if ($xmlFiles.Count -eq 0) {
        Write-Host "⚠️  No STIG XML files found in the archive!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "💡 This might be an SRG library or a different format." -ForegroundColor Cyan
        Write-Host "   Please ensure you downloaded the STIG Library (not SRG Library)." -ForegroundColor Gray
        Write-Host ""
        
        # Show what was found
        $allFiles = Get-ChildItem -Path $tempDir -Recurse -File | Select-Object -First 10
        if ($allFiles.Count -gt 0) {
            Write-Host "📂 Files found in archive (first 10):" -ForegroundColor Cyan
            foreach ($file in $allFiles) {
                Write-Host "   • $($file.Name)" -ForegroundColor Gray
            }
        }
        Write-Host ""
    }
    
    $processedCount = 0
    
    foreach ($xmlFile in $xmlFiles) {
        try {
            # Extract STIG ID from filename
            # Example: U_MS_Windows_Server_2022_V1R4_STIG.xml -> windows_server_2022
            $stigName = $xmlFile.BaseName -replace '^U_', '' -replace '_STIG$', '' -replace '_V\d+R\d+.*$', ''
            $stigId = $stigName.ToLower() -replace '[^a-z0-9]+', '_' -replace '^_|_$', ''
            
            # Read XML to extract metadata
            [xml]$xmlContent = Get-Content $xmlFile.FullName -Raw
            
            # Try to extract version and release date from XML
            $version = "Unknown"
            $releaseDate = (Get-Date).ToString("yyyy-MM-dd")
            
            # Look for version in various places
            if ($xmlContent.Benchmark.version) {
                $version = $xmlContent.Benchmark.version
            } elseif ($xmlFile.Name -match 'V(\d+)R(\d+)') {
                $version = "V$($matches[1])R$($matches[2])"
            }
            
            # Look for release date
            if ($xmlContent.Benchmark.'plain-text' | Where-Object { $_.id -eq 'release-info' }) {
                $releaseInfo = ($xmlContent.Benchmark.'plain-text' | Where-Object { $_.id -eq 'release-info' }).'#text'
                if ($releaseInfo -match '\d{1,2}\s+\w+\s+\d{4}') {
                    $releaseDate = ([DateTime]::Parse($matches[0])).ToString("yyyy-MM-dd")
                }
            }
            
            # Get STIG title
            $stigTitle = if ($xmlContent.Benchmark.title) { 
                $xmlContent.Benchmark.title 
            } else { 
                $stigName -replace '_', ' ' | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) }
            }
            
            # Create STIG directory
            $stigDir = Join-Path $OutputDir $stigId
            if (-not (Test-Path $stigDir)) {
                New-Item -ItemType Directory -Path $stigDir -Force | Out-Null
            }
            
            # Copy XML file
            $destFile = Join-Path $stigDir $xmlFile.Name
            Copy-Item $xmlFile.FullName -Destination $destFile -Force
            
            # Create metadata.json
            $metadata = @{
                stigId = $stigId
                name = $stigTitle
                version = $version
                releaseDate = $releaseDate
                filename = $xmlFile.Name
                format = "xml"
                extractedAt = (Get-Date).ToString("o")
            }
            
            $metadataPath = Join-Path $stigDir "metadata.json"
            $metadata | ConvertTo-Json -Depth 10 | Set-Content $metadataPath -Encoding UTF8
            
            Write-Host "✅ $stigId" -ForegroundColor Green -NoNewline
            Write-Host " - $stigTitle ($version)" -ForegroundColor Gray
            
            $processedCount++
            
        } catch {
            Write-Host "⚠️  Failed to process $($xmlFile.Name): $_" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "🎉 Successfully extracted $processedCount STIGs!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 STIGs are now available in: $OutputDir" -ForegroundColor Cyan
    Write-Host "💡 Restart your development server to use the local STIG library" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error during extraction: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clean up temp directory
    if (Test-Path $tempDir) {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Total STIGs: $processedCount" -ForegroundColor Gray
Write-Host "   Location: $OutputDir" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ You can now use the 'Local Library' button in the STIG Management tab!" -ForegroundColor Green
