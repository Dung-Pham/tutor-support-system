# ⚠️ FIX: Enable TCP/IP for SQL Server TSSERVER Instance

## Problem
TCP/IP protocol is **DISABLED** for your SQL Server TSSERVER instance.  
This is why connection attempts fail with "Port not found" errors.

## Solution: Enable TCP/IP

### Method 1: Using SQL Server Configuration Manager (GUI) ✅ RECOMMENDED

1. **Open SQL Server Configuration Manager**
   - Press `Win + R`
   - Type: `SQLServerManager16.msc` (for SQL Server 2022)
   - Or search for "SQL Server Configuration Manager"

2. **Navigate to Protocols**
   - Expand: **SQL Server Network Configuration**
   - Click: **Protocols for TSSERVER**

3. **Enable TCP/IP**
   - Right-click on **TCP/IP**
   - Select **Enable**
   - You may see a warning about needing to restart - click OK

4. **Configure TCP/IP (Optional but Recommended)**
   - Right-click **TCP/IP** again → **Properties**
   - Go to **IP Addresses** tab
   - Scroll to bottom → **IPAll** section
   - Set:
     * **TCP Dynamic Ports:** (leave empty or set specific port)
     * **TCP Port:** `1433` (or any port you prefer)

5. **Restart SQL Server Service**
   ```powershell
   Restart-Service MSSQL$TSSERVER
   ```
   
   Or in Configuration Manager:
   - Go to **SQL Server Services**
   - Right-click **SQL Server (TSSERVER)**
   - Click **Restart**

### Method 2: Using PowerShell (Quick) ⚡

```powershell
# Run PowerShell as Administrator

# Set TCP Port to 1433
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.TSSERVER\MSSQLServer\SuperSocketNetLib\Tcp\IPAll' -Name 'TcpPort' -Value '1433'

# Clear dynamic ports (use static port instead)
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.TSSERVER\MSSQLServer\SuperSocketNetLib\Tcp\IPAll' -Name 'TcpDynamicPorts' -Value ''

# Restart SQL Server
Restart-Service MSSQL$TSSERVER

# Verify
Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.TSSERVER\MSSQLServer\SuperSocketNetLib\Tcp\IPAll' | Select TcpPort, TcpDynamicPorts
```

Expected output:
```
TcpPort         : 1433
TcpDynamicPorts : 
```

---

## After Enabling TCP/IP

### Update .env file:

```env
# SQL Server Configuration
MSSQL_HOST=localhost
MSSQL_PORT=1433
MSSQL_DATABASE=tutorsupportdb
MSSQL_USER=sa
MSSQL_PASSWORD=123456
MSSQL_ENCRYPT=true
MSSQL_TRUST_SERVER_CERTIFICATE=true
```

### Test connection:

```bash
cd backend
npm run db:test
```

Expected output:
```
✅ SQL Server Connected successfully
📦 Database: tutorsupportdb
🖥️  Host: localhost:1433
👤 User: sa

📊 Found 13 tables
```

---

## Alternative: Use Windows Authentication with Named Pipes

If you don't want to enable TCP/IP, you can use Windows Authentication (but requires code changes):

```javascript
// In sqlserver.js config
const config = {
  server: 'localhost\\TSSERVER',
  database: 'tutorsupportdb',
  authentication: {
    type: 'ntlm',
    options: {
      domain: '', // Leave empty for local machine
      userName: 'your-windows-username',
      password: 'your-windows-password'
    }
  },
  options: {
    trustServerCertificate: true,
    enableArithAbort: true
  }
};
```

---

## Troubleshooting

### TCP/IP still not working after enable?

1. **Check Windows Firewall:**
   ```powershell
   New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow
   ```

2. **Verify SQL Browser is running:**
   ```powershell
   Get-Service SQLBrowser
   Start-Service SQLBrowser
   ```

3. **Test port is listening:**
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 1433
   ```

4. **Check SQL Server is listening on TCP:**
   ```powershell
   netstat -ano | findstr :1433
   ```

---

## Quick Commands

```powershell
# Check services
Get-Service | Where-Object {$_.Name -like "*SQL*"} | Select Name, Status

# Restart SQL Server
Restart-Service MSSQL$TSSERVER

# Restart SQL Browser  
Restart-Service SQLBrowser

# Test connection after restart
cd D:\Notion\DoAnTotNghiep\tutor-support-system\backend
npm run db:test
```

---

**🎯 RECOMMENDATION:** Use **Method 1 (GUI)** if you're not familiar with registry editing. It's safer and easier to verify.

After enabling TCP/IP and restarting, your connection should work!
