# ========================================
# Enable TCP/IP for SQL Server TSSERVER
# ========================================
# This script must be run as Administrator
# ========================================

Write-Host "`n==============================================`n" -ForegroundColor Cyan
Write-Host "  SQL Server TCP/IP Enable Script" -ForegroundColor Yellow
Write-Host "  Instance: TSSERVER" -ForegroundColor Yellow
Write-Host "`n==============================================`n" -ForegroundColor Cyan

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "`nTo run as Administrator:" -ForegroundColor Yellow
    Write-Host "  1. Right-click PowerShell" -ForegroundColor White
    Write-Host "  2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "  3. Navigate to this directory and run again`n" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Running as Administrator`n" -ForegroundColor Green

# Registry path
$regPath = 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.TSSERVER\MSSQLServer\SuperSocketNetLib\Tcp\IPAll'

Write-Host "📋 Current TCP/IP Settings:" -ForegroundColor Cyan
$current = Get-ItemProperty $regPath
Write-Host "  TCP Port: $($current.TcpPort)" -ForegroundColor White
Write-Host "  Dynamic Ports: $($current.TcpDynamicPorts)" -ForegroundColor White

if ($current.TcpPort -eq "" -and $current.TcpDynamicPorts -eq "0") {
    Write-Host "`n⚠️  TCP/IP is DISABLED (no port configured)`n" -ForegroundColor Red
} else {
    Write-Host "`n✅ TCP/IP appears to be configured`n" -ForegroundColor Green
}

Write-Host "🔧 Configuring TCP/IP..." -ForegroundColor Yellow
Write-Host "  Setting TCP Port to 1433..." -ForegroundColor White

try {
    # Set TCP Port to 1433
    Set-ItemProperty -Path $regPath -Name 'TcpPort' -Value '1433'
    
    # Clear dynamic ports (use static port)
    Set-ItemProperty -Path $regPath -Name 'TcpDynamicPorts' -Value ''
    
    Write-Host "✅ TCP Port set to 1433`n" -ForegroundColor Green
    
    # Verify
    $updated = Get-ItemProperty $regPath
    Write-Host "📋 Updated TCP/IP Settings:" -ForegroundColor Cyan
    Write-Host "  TCP Port: $($updated.TcpPort)" -ForegroundColor White
    Write-Host "  Dynamic Ports: $($updated.TcpDynamicPorts)" -ForegroundColor White
    
    # Restart SQL Server
    Write-Host "`n🔄 Restarting SQL Server (TSSERVER)..." -ForegroundColor Yellow
    Restart-Service MSSQL$TSSERVER -Force
    
    Write-Host "✅ SQL Server restarted successfully`n" -ForegroundColor Green
    
    # Wait for service to be fully running
    Start-Sleep -Seconds 3
    
    # Check service status
    $service = Get-Service MSSQL$TSSERVER
    if ($service.Status -eq 'Running') {
        Write-Host "✅ SQL Server (TSSERVER) is Running`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️  SQL Server status: $($service.Status)`n" -ForegroundColor Yellow
    }
    
    # Test if port is listening
    Write-Host "🔍 Testing if port 1433 is listening..." -ForegroundColor Yellow
    $portTest = Test-NetConnection -ComputerName localhost -Port 1433 -WarningAction SilentlyContinue
    
    if ($portTest.TcpTestSucceeded) {
        Write-Host "✅ Port 1433 is OPEN and listening!`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Port 1433 is not responding yet. It may take a few more seconds...`n" -ForegroundColor Yellow
        Write-Host "   Try testing again in 5-10 seconds`n" -ForegroundColor White
    }
    
    Write-Host "==============================================`n" -ForegroundColor Cyan
    Write-Host "✅ SUCCESS! TCP/IP has been enabled." -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "  1. Update your .env file:" -ForegroundColor White
    Write-Host "     MSSQL_HOST=localhost" -ForegroundColor Gray
    Write-Host "     MSSQL_PORT=1433" -ForegroundColor Gray
    Write-Host "`n  2. Test connection:" -ForegroundColor White
    Write-Host "     cd backend" -ForegroundColor Gray
    Write-Host "     npm run db:test" -ForegroundColor Gray
    Write-Host "`n==============================================`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)`n" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. SQL Server (TSSERVER) is installed" -ForegroundColor White
    Write-Host "  2. You have Administrator privileges" -ForegroundColor White
    Write-Host "  3. Registry path exists`n" -ForegroundColor White
    exit 1
}

Read-Host "`nPress Enter to exit"
