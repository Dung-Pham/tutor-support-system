/**
 * File: get-test-uuids.ts
 * Purpose: Extract UUIDs from database for API testing
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

import { sequelize } from './src/config/sqlserver';

async function getTestUUIDs() {
  try {
    console.log('\n📋 EXTRACTING TEST UUIDs FROM DATABASE\n');
    console.log('=' .repeat(60));
    
    await sequelize.authenticate();
    
    // Get Tutors
    const [tutors]: any = await sequelize.query(`
      SELECT TOP 3 
        u.user_id, 
        u.email, 
        u.name,
        tp.subjects,
        tp.hourly_rate
      FROM [User] u
      INNER JOIN [TutorProfile] tp ON u.user_id = tp.user_id
      ORDER BY u.created_at
    `);
    
    console.log('\n👨‍🏫 TUTORS:');
    tutors.forEach((t: any, i: number) => {
      console.log(`\n${i + 1}. ${t.name}`);
      console.log(`   Email: ${t.email}`);
      console.log(`   Subjects: ${t.subjects}`);
      console.log(`   Rate: ${t.hourly_rate.toLocaleString()} VNĐ/hour`);
      console.log(`   🔑 user_id: ${t.user_id}`);
    });
    
    // Get Students
    const [students]: any = await sequelize.query(`
      SELECT TOP 4
        u.user_id,
        u.email,
        u.name,
        sp.grade_level,
        sp.school_name
      FROM [User] u
      INNER JOIN [StudentProfile] sp ON u.user_id = sp.user_id
      ORDER BY u.created_at
    `);
    
    console.log('\n\n👨‍🎓 STUDENTS:');
    students.forEach((s: any, i: number) => {
      console.log(`\n${i + 1}. ${s.name}`);
      console.log(`   Email: ${s.email}`);
      console.log(`   Grade: ${s.grade_level} - ${s.school_name}`);
      console.log(`   🔑 user_id: ${s.user_id}`);
    });
    
    // Get Parents
    const [parents]: any = await sequelize.query(`
      SELECT TOP 4
        u.user_id,
        u.email,
        u.name,
        pp.occupation
      FROM [User] u
      INNER JOIN [ParentProfile] pp ON u.user_id = pp.user_id
      ORDER BY u.created_at
    `);
    
    console.log('\n\n👨‍👩‍👧 PARENTS:');
    parents.forEach((p: any, i: number) => {
      console.log(`\n${i + 1}. ${p.name}`);
      console.log(`   Email: ${p.email}`);
      console.log(`   Occupation: ${p.occupation}`);
      console.log(`   🔑 user_id: ${p.user_id}`);
    });
    
    // Get Classes
    const [classes]: any = await sequelize.query(`
      SELECT 
        c.class_id,
        c.subject,
        c.grade_level,
        c.status,
        c.name as class_name,
        t.name as tutor_name,
        s.name as student_name,
        p.name as parent_name
      FROM [Class] c
      INNER JOIN [User] t ON c.tutor_id = t.user_id
      INNER JOIN [User] s ON c.student_id = s.user_id
      INNER JOIN [User] p ON c.parent_id = p.user_id
      ORDER BY c.created_at
    `);
    
    console.log('\n\n📚 CLASSES:');
    classes.forEach((c: any, i: number) => {
      console.log(`\n${i + 1}. ${c.subject} - ${c.grade_level} [${c.status.toUpperCase()}]`);
      console.log(`   Name: ${c.class_name}`);
      console.log(`   Tutor: ${c.tutor_name}`);
      console.log(`   Student: ${c.student_name}`);
      console.log(`   Parent: ${c.parent_name}`);
      console.log(`   🔑 class_id: ${c.class_id}`);
    });
    
    // Get Schedules
    const [schedules]: any = await sequelize.query(`
      SELECT TOP 6
        s.schedule_id,
        s.start_date,
        s.end_date,
        s.status,
        s.duration_minutes,
        s.tutor_name,
        s.student_name,
        s.class_name
      FROM [Schedule] s
      ORDER BY s.start_date
    `);
    
    console.log('\n\n📅 SCHEDULES:');
    schedules.forEach((s: any, i: number) => {
      const startDate = new Date(s.start_date);
      const endDate = new Date(s.end_date);
      console.log(`\n${i + 1}. ${s.class_name} [${s.status.toUpperCase()}]`);
      console.log(`   Date: ${startDate.toLocaleString('vi-VN')}`);
      console.log(`   Duration: ${s.duration_minutes} minutes`);
      console.log(`   Tutor: ${s.tutor_name} → Student: ${s.student_name}`);
      console.log(`   🔑 schedule_id: ${s.schedule_id}`);
    });
    
    // Get Attendance
    const [attendances]: any = await sequelize.query(`
      SELECT 
        a.attendance_id,
        a.attendance_date,
        a.tutor_confirmed,
        a.parent_confirmed,
        a.overall_status,
        a.tutor_notes,
        a.parent_notes,
        s.class_name,
        s.start_date
      FROM [AttendanceRecord] a
      INNER JOIN [Schedule] s ON a.schedule_id = s.schedule_id
      ORDER BY a.created_at
    `);
    
    console.log('\n\n✅ ATTENDANCE RECORDS:');
    if (attendances.length === 0) {
      console.log('   (No records yet)');
    } else {
      attendances.forEach((a: any, i: number) => {
        console.log(`\n${i + 1}. ${a.class_name} - ${new Date(a.attendance_date).toLocaleDateString('vi-VN')}`);
        console.log(`   Overall Status: ${a.overall_status}`);
        console.log(`   Tutor: [${a.tutor_confirmed ? '✓ Confirmed' : '✗ Not confirmed'}]`);
        if (a.tutor_notes) console.log(`   Tutor notes: ${a.tutor_notes}`);
        console.log(`   Parent: [${a.parent_confirmed ? '✓ Confirmed' : '✗ Not confirmed'}]`);
        if (a.parent_notes) console.log(`   Parent notes: ${a.parent_notes}`);
        console.log(`   🔑 attendance_id: ${a.attendance_id}`);
      });
    }
    
    // Get Materials
    const [materials]: any = await sequelize.query(`
      SELECT 
        m.material_id,
        m.title,
        m.description,
        m.file_name,
        m.file_url,
        c.subject as class_subject,
        u.name as uploaded_by_name
      FROM [Material] m
      INNER JOIN [Class] c ON m.class_id = c.class_id
      INNER JOIN [User] u ON m.uploaded_by = u.user_id
      ORDER BY m.created_at
    `);
    
    console.log('\n\n📄 MATERIALS:');
    if (materials.length === 0) {
      console.log('   (No materials yet)');
    } else {
      materials.forEach((m: any, i: number) => {
        console.log(`\n${i + 1}. ${m.title}`);
        console.log(`   Class: ${m.class_subject}`);
        console.log(`   Description: ${m.description}`);
        console.log(`   File: ${m.file_name}`);
        console.log(`   URL: ${m.file_url}`);
        console.log(`   Uploaded by: ${m.uploaded_by_name}`);
        console.log(`   🔑 material_id: ${m.material_id}`);
      });
    }
    
    // Get Homework
    const [homework]: any = await sequelize.query(`
      SELECT 
        h.homework_id,
        h.title,
        h.instructions,
        h.due_date,
        h.status,
        c.subject as class_subject,
        u.name as assigned_by_name
      FROM [Homework] h
      INNER JOIN [Class] c ON h.class_id = c.class_id
      INNER JOIN [User] u ON h.assigned_by = u.user_id
      ORDER BY h.due_date
    `);
    
    console.log('\n\n📝 HOMEWORK:');
    if (homework.length === 0) {
      console.log('   (No homework yet)');
    } else {
      homework.forEach((h: any, i: number) => {
        console.log(`\n${i + 1}. ${h.title} [${h.status.toUpperCase()}]`);
        console.log(`   Class: ${h.class_subject}`);
        console.log(`   Instructions: ${h.instructions}`);
        console.log(`   Due: ${new Date(h.due_date).toLocaleString('vi-VN')}`);
        console.log(`   Assigned by: ${h.assigned_by_name}`);
        console.log(`   🔑 homework_id: ${h.homework_id}`);
      });
    }
    
    // Get Submissions
    const [submissions]: any = await sequelize.query(`
      SELECT 
        hs.submission_id,
        hs.submitted_at,
        hs.score,
        hs.max_score,
        hs.feedback,
        h.title as homework_title,
        s.name as student_name,
        g.name as graded_by_name
      FROM [HomeworkSubmission] hs
      INNER JOIN [Homework] h ON hs.homework_id = h.homework_id
      INNER JOIN [User] s ON hs.student_id = s.user_id
      LEFT JOIN [User] g ON hs.graded_by = g.user_id
      ORDER BY hs.submitted_at
    `);
    
    console.log('\n\n📤 HOMEWORK SUBMISSIONS:');
    if (submissions.length === 0) {
      console.log('   (No submissions yet)');
    } else {
      submissions.forEach((s: any, i: number) => {
        console.log(`\n${i + 1}. ${s.homework_title}`);
        console.log(`   Student: ${s.student_name}`);
        console.log(`   Submitted: ${new Date(s.submitted_at).toLocaleString('vi-VN')}`);
        if (s.score !== null) {
          console.log(`   Score: ${s.score}/${s.max_score}`);
          console.log(`   Graded by: ${s.graded_by_name}`);
          console.log(`   Feedback: ${s.feedback || 'N/A'}`);
        } else {
          console.log(`   Status: Pending grading`);
        }
        console.log(`   🔑 submission_id: ${s.submission_id}`);
      });
    }
    
    console.log('\n\n' + '='.repeat(60));
    console.log('\n💡 TIP: Copy UUIDs above and paste into Swagger UI for testing!\n');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

getTestUUIDs();
