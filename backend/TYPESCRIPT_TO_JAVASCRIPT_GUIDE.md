# TypeScript to JavaScript Migration Guide

## Problem
The Module VI files were created in TypeScript (`.ts`) but the project currently runs JavaScript (`.js`) with Node.js directly. The server fails with `MODULE_NOT_FOUND` errors.

## Solution Options

### Option 1: Use ts-node for Development (Recommended for TypeScript projects)

1. **Update package.json scripts:**
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "dev": "ts-node src/server.js",
    "dev:watch": "nodemon --exec ts-node src/server.js",
    "build": "tsc",
    "build:watch": "tsc --watch"
  }
}
```

2. **Install ts-node if not installed:**
```powershell
npm install --save-dev ts-node @types/node
```

3. **Update tsconfig.json:**
Ensure it has:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

4. **Uncomment Module VI routes in app.js**

5. **Run with:**
```powershell
npm run dev:watch
```

### Option 2: Convert TypeScript Files to JavaScript (Simpler, matches current setup)

I've temporarily commented out the Module VI routes in `app.js` so the server can start.

To integrate Module VI properly, you need to:

#### A. Manual Conversion Steps:

1. **Rename all `.ts` files to `.js`:**
   - `src/types/index.ts` → Delete or keep for reference
   - `src/utils/validator.ts` → `validator.js`
   - `src/utils/database.ts` → `database.js`
   - `src/services/*.ts` → `*.js`
   - `src/controllers/*.ts` → `*.js`
   - `src/routes/*.ts` → `*.js`

2. **Convert syntax in each file:**

**TypeScript (import/export):**
```typescript
import { Router } from 'express';
import * as controller from '../controllers/scheduleController';

export default router;
```

**JavaScript (require/module.exports):**
```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/scheduleController');

module.exports = router;
```

3. **Remove type annotations:**

**TypeScript:**
```typescript
function createSchedule(req: Request, res: Response): Promise<void> {
  const data: CreateScheduleDTO = req.body;
  // ...
}
```

**JavaScript:**
```javascript
function createSchedule(req, res) {
  const data = req.body;
  // ...
}
```

4. **Remove interface/type definitions** - TypeScript types don't exist at runtime

#### B. Automated Conversion (PowerShell Script):

Save this as `convert-ts-to-js.ps1`:

```powershell
# Navigate to backend directory
Set-Location -Path "D:\Notion\DoAnTotNghiep\tutor-support-system\backend"

# Function to convert TypeScript to JavaScript
function Convert-TsToJs {
    param([string]$FilePath)
    
    $content = Get-Content $FilePath -Raw
    
    # Convert import statements
    $content = $content -replace "import\s+\*\s+as\s+(\w+)\s+from\s+'(.+)'", 'const $1 = require(''$2'')'
    $content = $content -replace "import\s+\{([^}]+)\}\s+from\s+'(.+)'", 'const { $1 } = require(''$2'')'
    $content = $content -replace "import\s+(\w+)\s+from\s+'(.+)'", 'const $1 = require(''$2'')'
    
    # Convert export default
    $content = $content -replace 'export\s+default\s+(\w+);?', 'module.exports = $1;'
    
    # Remove type annotations (basic patterns)
    $content = $content -replace ':\s*(string|number|boolean|any|void|Promise<[^>]+>)', ''
    $content = $content -replace '<[^>]+>', ''
    
    # Remove interface/type definitions
    $content = $content -replace 'interface\s+\w+\s*\{[^}]+\}', ''
    $content = $content -replace 'type\s+\w+\s*=\s*[^;]+;', ''
    
    # Save as .js file
    $jsPath = $FilePath -replace '\.ts$', '.js'
    Set-Content -Path $jsPath -Value $content
    
    Write-Host "Converted: $FilePath -> $jsPath"
}

# Convert all TypeScript files
Get-ChildItem -Path "src" -Filter "*.ts" -Recurse | ForEach-Object {
    Convert-TsToJs -FilePath $_.FullName
}

Write-Host "`nConversion complete! Review the .js files and make manual adjustments as needed."
```

Run with:
```powershell
powershell -ExecutionPolicy Bypass -File convert-ts-to-js.ps1
```

**Note:** This script does basic conversion. You'll need to manually review and fix:
- Complex type annotations
- Generic types
- Interface usages in code
- Type assertions

### Option 3: Build TypeScript First

1. **Build TypeScript to JavaScript:**
```powershell
npm run build
```

2. **Update main entry point:**
Change `package.json` main to use compiled files:
```json
{
  "main": "dist/server.js",
  "scripts": {
    "dev": "npm run build && nodemon dist/server.js"
  }
}
```

## Recommended Approach

**For this project:** Use **Option 1** (ts-node) because:
- ✅ Keeps TypeScript benefits (type safety)
- ✅ No manual conversion needed
- ✅ Better developer experience
- ✅ Modern approach for Node.js + TypeScript

**Quick Start with Option 1:**

```powershell
# 1. Update package.json dev script
npm pkg set scripts.dev="nodemon --exec ts-node src/server.js"

# 2. Install ts-node if needed
npm install --save-dev ts-node

# 3. Uncomment Module VI routes in src/app.js
# (Lines 29-34 and 69-74)

# 4. Run the server
npm run dev
```

## Current Status

✅ Server can now start (Module VI routes commented out)
⏳ Need to choose integration option above
⏳ Uncomment routes in `app.js` after integration

## Files to Update After Integration

1. `src/app.js` - Uncomment Module VI route imports and registrations
2. All `*.ts` files in:
   - `src/types/`
   - `src/utils/` (validator.ts, database.ts)
   - `src/services/`
   - `src/controllers/`
   - `src/routes/`

## Testing After Integration

```powershell
# 1. Start server
npm run dev

# 2. Test health endpoint
curl http://localhost:5000/health

# 3. Test Module VI endpoints
curl http://localhost:5000/api/schedules
```

---

**Need help?** See QUICK_START.md and SETUP_GUIDE.md for detailed instructions.
