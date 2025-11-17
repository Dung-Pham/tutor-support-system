# =====================================================
# Generate Seed Data SQL File
# Purpose: Create clean SQL with proper ASCII encoding
# =====================================================

$outputFile = "d:\Notion\DoAnTotNghiep\tutor-support-system\backend\scripts\seed-generated.sql"

$sqlContent = @'
-- =====================================================
-- AUTO-GENERATED SEED DATA
-- Generated: {0}
-- =====================================================

USE tutorsupportdb0_2;
GO

-- Clear existing data
DELETE FROM ProgressEvaluation;
DELETE FROM AttendanceRecord;
DELETE FROM [Schedule];
DELETE FROM ScheduleTimeBlock;
DELETE FROM [Class];
DELETE FROM TutorProfile;
DELETE FROM [UserAccount];
GO

PRINT 'Cleared existing data';
PRINT '';
GO

-- =====================================================
-- USER ACCOUNTS (9 records)
-- =====================================================
PRINT 'Inserting UserAccounts...';
GO

INSERT INTO [UserAccount] (user_id, email, password_hash, [name], phone, [role], [status], child_name, child_grade, created_at)
VALUES (CAST('11111111-1111-1111-1111-111111111111' AS UNIQUEIDENTIFIER), 'parent1@example.com', '$2a$10$hash1', N'Nguyen Van Minh', '0901234567', 'USER', 'ACTIVE', N'Nguyen Minh Anh', N'Grade 10', GETDATE());

INSERT INTO [UserAccount] (user_id, email, password_hash, [name], phone, [role], [status], child_name, child_grade, created_at)
VALUES (CAST('22222222-2222-2222-2222-222222222222' AS UNIQUEIDENTIFIER), 'parent2@example.com', '$2a$10$hash2', N'Tran Thi Lan', '0902345678', 'USER', 'ACTIVE', N'Tran Hoang Nam', N'Grade 11', GETDATE());

INSERT INTO [UserAccount] (user_id, email, password_hash, [name], phone, [role], [status], child_name, child_grade, created_at)
VALUES (CAST('33333333-3333-3333-3333-333333333333' AS UNIQUEIDENTIFIER), 'student1@example.com', '$2a$10$hash3', N'Le Thi Huong', '0903456789', 'USER', 'ACTIVE', NULL, NULL, GETDATE());

INSERT INTO [UserAccount] (user_id, email, password_hash, [name], phone, [role], [status], child_name, child_grade, created_at)
VALUES (CAST('44444444-4444-4444-4444-444444444444' AS UNIQUEIDENTIFIER), 'parent3@example.com', '$2a$10$hash4', N'Pham Van Hai', '0904567890', 'USER', 'ACTIVE', N'Pham Minh Quan', N'Grade 9', GETDATE());

INSERT INTO [UserAccount] (user_id, email, password_hash, [name], phone, [role], [status], child_name, child_grade, created_at)
VALUES (CAST('55555555-5555-5555-5555-555555555555' AS UNIQUEIDENTIFIER), 'student2@example.com', '$2a$10$hash5', N'Hoang Thi Mai', '0905678901', 'USER', 'ACTIVE', NULL, NULL, GETDATE());

INSERT INTO [UserAccount] (user_id, email, password_hash, [name], phone, [role], [status], child_name, child_grade, created_at)
VALUES (CAST('AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA' AS UNIQUEIDENTIFIER), 'tutor1@example.com', '$2a$10$hash6', N'Thay Nguyen Van A', '0911111111', 'TUTOR', 'ACTIVE', NULL, NULL, GETDATE());

INSERT INTO [UserAccount] (user_id, email, password_hash, [name], phone, [role], [status], child_name, child_grade, created_at)
VALUES (CAST('BBBB2222-BBBB-BBBB-BBBB-BBBBBBBBBBBB' AS UNIQUEIDENTIFIER), 'tutor2@example.com', '$2a$10$hash7', N'Co Tran Thi B', '0922222222', 'TUTOR', 'ACTIVE', NULL, NULL, GETDATE());

INSERT INTO [UserAccount] (user_id, email, password_hash, [name], phone, [role], [status], child_name, child_grade, created_at)
VALUES (CAST('CCCC3333-CCCC-CCCC-CCCC-CCCCCCCCCCCC' AS UNIQUEIDENTIFIER), 'tutor3@example.com', '$2a$10$hash8', N'Thay Le Van C', '0933333333', 'TUTOR', 'ACTIVE', NULL, NULL, GETDATE());

INSERT INTO [UserAccount] (user_id, email, password_hash, [name], phone, [role], [status], child_name, child_grade, created_at)
VALUES (CAST('DDDD4444-DDDD-DDDD-DDDD-DDDDDDDDDDDD' AS UNIQUEIDENTIFIER), 'tutor4@example.com', '$2a$10$hash9', N'Co Pham Thi D', '0944444444', 'TUTOR', 'ACTIVE', NULL, NULL, GETDATE());
GO

PRINT '? 9 UserAccount records inserted';
GO

-- =====================================================
-- TUTOR PROFILES (4 records)
-- =====================================================
PRINT 'Inserting TutorProfiles...';
GO

INSERT INTO TutorProfile (tutor_profile_id, user_id, bio, experience_years, subjects, hourly_rate, avg_rating, total_reviews, is_verified, created_at)
VALUES (CAST('TP111111-1111-1111-1111-111111111111' AS UNIQUEIDENTIFIER), CAST('AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA' AS UNIQUEIDENTIFIER), N'Giao vien Toan 10 nam kinh nghiem', 10, N'["Math", "Physics"]', 200000, 4.8, 45, 1, GETDATE());

INSERT INTO TutorProfile (tutor_profile_id, user_id, bio, experience_years, subjects, hourly_rate, avg_rating, total_reviews, is_verified, created_at)
VALUES (CAST('TP222222-2222-2222-2222-222222222222' AS UNIQUEIDENTIFIER), CAST('BBBB2222-BBBB-BBBB-BBBB-BBBBBBBBBBBB' AS UNIQUEIDENTIFIER), N'Giao vien Tieng Anh chuyen IELTS', 8, N'["English", "IELTS"]', 250000, 4.9, 38, 1, GETDATE());

INSERT INTO TutorProfile (tutor_profile_id, user_id, bio, experience_years, subjects, hourly_rate, avg_rating, total_reviews, is_verified, created_at)
VALUES (CAST('TP333333-3333-3333-3333-333333333333' AS UNIQUEIDENTIFIER), CAST('CCCC3333-CCCC-CCCC-CCCC-CCCCCCCCCCCC' AS UNIQUEIDENTIFIER), N'Giao vien Hoa hoc gioi', 6, N'["Chemistry", "Biology"]', 180000, 4.7, 28, 1, GETDATE());

INSERT INTO TutorProfile (tutor_profile_id, user_id, bio, experience_years, subjects, hourly_rate, avg_rating, total_reviews, is_verified, created_at)
VALUES (CAST('TP444444-4444-4444-4444-444444444444' AS UNIQUEIDENTIFIER), CAST('DDDD4444-DDDD-DDDD-DDDD-DDDDDDDDDDDD' AS UNIQUEIDENTIFIER), N'Giao vien Van hoc nhiet huyet', 12, N'["Literature", "History"]', 220000, 4.9, 52, 1, GETDATE());
GO

PRINT '? 4 TutorProfile records inserted';
GO

-- =====================================================
-- CLASSES (5 records)
-- =====================================================
PRINT 'Inserting Classes...';
GO

INSERT INTO [Class] (class_id, tutor_id, user_id, [name], subject, grade_level, description, [status], start_date, end_date, created_at)
VALUES (CAST('C1111111-C111-C111-C111-C11111111111' AS UNIQUEIDENTIFIER), CAST('AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA' AS UNIQUEIDENTIFIER), CAST('11111111-1111-1111-1111-111111111111' AS UNIQUEIDENTIFIER), N'Toan 10 - Minh Anh', 'Math', 'Grade 10', N'Hoc toan nang cao', 'ACTIVE', '2024-11-01', NULL, GETDATE());

INSERT INTO [Class] (class_id, tutor_id, user_id, [name], subject, grade_level, description, [status], start_date, end_date, created_at)
VALUES (CAST('C2222222-C222-C222-C222-C22222222222' AS UNIQUEIDENTIFIER), CAST('BBBB2222-BBBB-BBBB-BBBB-BBBBBBBBBBBB' AS UNIQUEIDENTIFIER), CAST('22222222-2222-2222-2222-222222222222' AS UNIQUEIDENTIFIER), N'English - Hoang Nam', 'English', 'Grade 11', N'Luyen IELTS', 'ACTIVE', '2024-11-01', NULL, GETDATE());

INSERT INTO [Class] (class_id, tutor_id, user_id, [name], subject, grade_level, description, [status], start_date, end_date, created_at)
VALUES (CAST('C3333333-C333-C333-C333-C33333333333' AS UNIQUEIDENTIFIER), CAST('CCCC3333-CCCC-CCCC-CCCC-CCCCCCCCCCCC' AS UNIQUEIDENTIFIER), CAST('33333333-3333-3333-3333-333333333333' AS UNIQUEIDENTIFIER), N'Hoa hoc - Le Huong', 'Chemistry', 'Grade 12', N'On thi tot nghiep', 'ACTIVE', '2024-11-01', NULL, GETDATE());

INSERT INTO [Class] (class_id, tutor_id, user_id, [name], subject, grade_level, description, [status], start_date, end_date, created_at)
VALUES (CAST('C4444444-C444-C444-C444-C44444444444' AS UNIQUEIDENTIFIER), CAST('DDDD4444-DDDD-DDDD-DDDD-DDDDDDDDDDDD' AS UNIQUEIDENTIFIER), CAST('44444444-4444-4444-4444-444444444444' AS UNIQUEIDENTIFIER), N'Van hoc - Minh Quan', 'Literature', 'Grade 9', N'Nang cao ky nang viet', 'ACTIVE', '2024-11-05', NULL, GETDATE());

INSERT INTO [Class] (class_id, tutor_id, user_id, [name], subject, grade_level, description, [status], start_date, end_date, created_at)
VALUES (CAST('C5555555-C555-C555-C555-C55555555555' AS UNIQUEIDENTIFIER), CAST('AAAA1111-AAAA-AAAA-AAAA-AAAAAAAAAAAA' AS UNIQUEIDENTIFIER), CAST('55555555-5555-5555-5555-555555555555' AS UNIQUEIDENTIFIER), N'Vat ly - Hoang Mai', 'Physics', 'Grade 11', N'Hoc Vat ly 11', 'ACTIVE', '2024-11-10', NULL, GETDATE());
GO

PRINT '? 5 Class records inserted';
GO

PRINT '';
PRINT '======================================================';
PRINT 'SEED DATA COMPLETE!';
PRINT 'Records: 9 Users, 4 Tutors, 5 Classes';
PRINT '======================================================';
GO
'@ -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Write to file with UTF8 encoding (no BOM)
[System.IO.File]::WriteAllText($outputFile, $sqlContent, [System.Text.UTF8Encoding]::new($false))

Write-Host "`n✅ Generated SQL file: seed-generated.sql" -ForegroundColor Green
Write-Host "📝 Encoding: UTF-8 without BOM" -ForegroundColor Cyan
Write-Host "📊 Records: 9 Users + 4 TutorProfiles + 5 Classes" -ForegroundColor Yellow
Write-Host "`nRun this file in SQL Server to test!" -ForegroundColor Magenta
