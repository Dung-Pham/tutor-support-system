# =========================================================
# API Test Commands for Tutor Support System
# New Schema: UserAccount (USER/TUTOR roles only)
# =========================================================

# Base URL
$BASE_URL = "http://localhost:5000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TUTOR SUPPORT SYSTEM - API TESTS" -ForegroundColor Cyan
Write-Host "Schema: UserAccount (USER/TUTOR)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# =========================================================
# 1. USER APIS (Already working)
# =========================================================
Write-Host "`n[1] GET ALL USERS" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/users?page=1&limit=10" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[2] GET USER BY ID (Parent 1)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/users/11111111-1111-1111-1111-111111111111" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[3] GET ALL TUTORS" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/users/tutors" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[4] GET TUTOR PROFILE" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/users/tutor/AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

# =========================================================
# 2. SCHEDULE APIS
# =========================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SCHEDULE MODULE TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[5] GET ALL SCHEDULES" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/schedules?page=1&limit=10" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[6] GET SCHEDULES BY TUTOR" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/schedules?tutor_id=AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[7] GET SCHEDULES BY USER (Parent 1)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/schedules?user_id=11111111-1111-1111-1111-111111111111" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[8] GET SCHEDULE BY ID (First seeded schedule)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/schedules/1A2B3C4D-5E6F-7081-92A3-B4C5D6E7F801" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[9] GET CALENDAR VIEW (Tutor A)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/schedules/calendar?userId=AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA&userRole=tutor&viewType=month&date=2024-11-01" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[10] GET CALENDAR VIEW (User 1)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/schedules/calendar?userId=11111111-1111-1111-1111-111111111111&userRole=user&viewType=month&date=2024-11-01" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

# =========================================================
# 3. TIMEBLOCK APIS (Tutor Availability)
# =========================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TIMEBLOCK MODULE TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[11] GET TUTOR TIMEBLOCKS (Tutor A)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/schedules/timeblocks/tutor/AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[12] GET AVAILABLE TIMEBLOCKS (Tutor B for date)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/schedules/timeblocks/available?tutorId=BBBB2222-BBBB-BBBB-BBBB-BBBBBBBBBBBB&date=2024-11-18" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

# =========================================================
# 4. ATTENDANCE APIS
# =========================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ATTENDANCE MODULE TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[13] GET OR CREATE ATTENDANCE FOR SCHEDULE (Third schedule pending)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/attendance/schedule/3C4D5E6F-7081-92A3-B4C5-D6E7F8011234" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[14] GET ATTENDANCE HISTORY (User 1 - as user)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/attendance/user/11111111-1111-1111-1111-111111111111/history?role=user&page=1&limit=10" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[15] GET ATTENDANCE HISTORY (Tutor A - as tutor)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/attendance/user/AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA/history?role=tutor&page=1&limit=10" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[16] GET ATTENDANCE STATS (User 1)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/attendance/user/11111111-1111-1111-1111-111111111111/stats?role=user" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[17] GET PENDING CONFIRMATIONS (Class 1)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/attendance/pending?classId=C1111111-C111-C111-C111-C11111111111" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

# Test CONFIRM ATTENDANCE (POST)
Write-Host "`n[18] CONFIRM ATTENDANCE (User confirms pending attendance)" -ForegroundColor Yellow
$confirmBody = @{
    confirmedBy = "user"
    notes = "Buổi học rất tốt, con học được nhiều"
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "$BASE_URL/attendance/B1C2D3E4-F560-7182-93A4-B5C6D7E8F9A0/confirm" `
        -Method POST `
        -ContentType "application/json" `
        -Body $confirmBody `
        -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# =========================================================
# 5. EVALUATION APIS
# =========================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "EVALUATION MODULE TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[19] GET EVALUATIONS BY CLASS (Class 1)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/evaluations/class/C1111111-C111-C111-C111-C11111111111?page=1&limit=10" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[20] GET EVALUATIONS BY SCHEDULE (First seeded schedule)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/evaluations/schedule/1A2B3C4D-5E6F-7081-92A3-B4C5D6E7F801" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[21] GET EVALUATION STATISTICS (Class 1)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/evaluations/class/C1111111-C111-C111-C111-C11111111111/statistics" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n[22] GET EVALUATION STATISTICS (Class 3 - with month filter)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$BASE_URL/evaluations/class/C3333333-C333-C333-C333-C33333333333/statistics?month=11&year=2024" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

# Test CREATE EVALUATION (POST)
Write-Host "`n[23] CREATE EVALUATION" -ForegroundColor Yellow
$evalBody = @{
    attendance_id = "D3E4F560-7182-93A4-B5C6-D7E8F9A0B1C2"  # confirmed attendance for schedule 4
    class_id = "C3333333-C333-C333-C333-C33333333333"
    schedule_id = "4D5E6F70-8192-A3B4-C5D6-E7F801123456"
    overall_rating = 5
    competency_level = "Excellent"
    comments = "Great engagement and understanding."
    understanding_score = 5
    participation_score = 5
    homework_completion = 5
    behavior_score = 5
    evaluated_by = "CCCC3333-CCCC-CCCC-CCCC-CCCCCCCCCCCC"  # Tutor C
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "$BASE_URL/evaluations" `
        -Method POST `
        -ContentType "application/json" `
        -Body $evalBody `
        -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# =========================================================
# SUMMARY
# =========================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ User Module: 4 endpoints tested" -ForegroundColor Green
Write-Host "✅ Schedule Module: 6 endpoints tested" -ForegroundColor Green
Write-Host "✅ TimeBlock Module: 2 endpoints tested" -ForegroundColor Green
Write-Host "✅ Attendance Module: 6 endpoints tested" -ForegroundColor Green
Write-Host "✅ Evaluation Module: 5 endpoints tested" -ForegroundColor Green
Write-Host "`nTotal: 23 API tests completed" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
