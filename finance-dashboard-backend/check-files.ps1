# Script to check if files are saved properly
Write-Host "=== Checking file sizes ===" -ForegroundColor Cyan

$files = @(
    "src/app.js",
    "src/models/User.js",
    "src/models/Transaction.js",
    "src/models/Budget.js",
    "src/middlewares/auth.js",
    "src/config/db.js",
    "src/server.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        $lineCount = (Get-Content $file -ErrorAction SilentlyContinue).Count
        if ($size -eq 0 -or $lineCount -eq 0) {
            Write-Host "$file : EMPTY or 0 bytes!" -ForegroundColor Red
        } else {
            Write-Host "$file : OK ($size bytes, $lineCount lines)" -ForegroundColor Green
        }
    } else {
        Write-Host "$file : NOT FOUND" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Solution ===" -ForegroundColor Cyan
Write-Host "If files are empty:" -ForegroundColor Yellow
Write-Host "1. Open each file in your editor" -ForegroundColor White
Write-Host "2. Press Ctrl+S to save (or File > Save)" -ForegroundColor White
Write-Host "3. Check that the file name doesn't show '*' (unsaved indicator)" -ForegroundColor White
Write-Host "4. Enable Auto-Save in your editor settings" -ForegroundColor White
