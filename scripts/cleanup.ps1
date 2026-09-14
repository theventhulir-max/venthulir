Write-Host "=== 1. Cleaning Next.js Project Cache ==="
if (Test-Path ".next\cache") {
    Remove-Item -Path ".next\cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Next.js project build cache removed."
}

Write-Host "`n=== 2. Cleaning Windows User Temp Directory ==="
$tempPath = [System.IO.Path]::GetTempPath()
$items = Get-ChildItem -Path $tempPath -Force -ErrorAction SilentlyContinue
$countBefore = ($items | Measure-Object).Count
$deleted = 0

foreach ($item in $items) {
    try {
        Remove-Item -LiteralPath $item.FullName -Recurse -Force -ErrorAction Stop
        $deleted++
    } catch {
        # File is locked by active process, skip
    }
}

$remaining = (Get-ChildItem -Path $tempPath -Force -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Host "Total items scanned: $countBefore"
Write-Host "Deleted temp files: $deleted"
Write-Host "Active in-use temp files: $remaining"

Write-Host "`n=== 3. Flushing System DNS & Network Cache ==="
ipconfig /flushdns

Write-Host "`n=== 4. Storage & Drive Status ==="
Get-PSDrive C | Format-Table Name, @{Label="Used (GB)"; Expression={[math]::Round($_.Used / 1GB, 2)}}, @{Label="Free (GB)"; Expression={[math]::Round($_.Free / 1GB, 2)}}

Write-Host "`n=== 5. Memory Garbage Collection ==="
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()
Write-Host "System Memory & Cache Cleanup Completed Successfully!"
