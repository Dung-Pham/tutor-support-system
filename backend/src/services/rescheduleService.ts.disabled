/**
 * File: services/rescheduleService.ts
 * Mục đích: Business logic cho reschedule requests
 * Vai trò: Handle reschedule creation, approval, rejection, auto-schedule creation
 */

import {
  RescheduleRequest,
  CreateRescheduleDTO,
  ReviewRescheduleDTO,
  RescheduleStatus
} from '../types';
import { executeQuery, executeTransaction } from '../utils/database';
import { QueryTypes, Transaction } from 'sequelize';
import * as scheduleService from './scheduleService';

/**
 * Create reschedule request
 */
export const createRescheduleRequest = async (
  data: CreateRescheduleDTO,
  requestedBy: string
): Promise<RescheduleRequest> => {
  // Verify schedule exists
  const schedule = await scheduleService.getScheduleById(data.scheduleId);
  
  if (!schedule) {
    throw new Error('Schedule not found');
  }
  
  // Check if there's already a pending request
  const existingQuery = `
    SELECT COUNT(*) as count
    FROM RescheduleRequest
    WHERE scheduleId = :scheduleId
      AND status = 'pending'
  `;
  
  const existing = await executeQuery<[{ count: number }]>(existingQuery, { scheduleId: data.scheduleId });
  
  if (existing[0].count > 0) {
    throw new Error('There is already a pending reschedule request for this schedule');
  }
  
  // Create reschedule request
  const insertQuery = `
    INSERT INTO RescheduleRequest (scheduleId, requestedBy, reason, proposedStartTime, proposedEndTime, status, createdAt, updatedAt)
    OUTPUT INSERTED.*
    VALUES (:scheduleId, :requestedBy, :reason, :proposedStartTime, :proposedEndTime, 'pending', GETDATE(), GETDATE())
  `;
  
  const result = await executeQuery<RescheduleRequest[]>(insertQuery, {
    ...data,
    requestedBy
  }, QueryTypes.INSERT);
  
  return result[0];
};

/**
 * Get reschedule request by ID
 */
export const getRescheduleById = async (rescheduleId: number): Promise<RescheduleRequest | null> => {
  const query = `
    SELECT r.*,
           s.tutorId, s.studentId, s.startTime as originalStartTime, s.endTime as originalEndTime,
           u.fullName as requestedByName
    FROM RescheduleRequest r
    JOIN Schedule s ON r.scheduleId = s.scheduleId
    JOIN [User] u ON r.requestedBy = u.userId
    WHERE r.rescheduleId = :rescheduleId
  `;
  
  const result = await executeQuery<any[]>(query, { rescheduleId });
  return result.length > 0 ? result[0] : null;
};

/**
 * Get reschedule requests by schedule ID
 */
export const getReschedulesBySchedule = async (scheduleId: number): Promise<RescheduleRequest[]> => {
  const query = `
    SELECT r.*,
           u.fullName as requestedByName
    FROM RescheduleRequest r
    JOIN [User] u ON r.requestedBy = u.userId
    WHERE r.scheduleId = :scheduleId
    ORDER BY r.createdAt DESC
  `;
  
  return await executeQuery<RescheduleRequest[]>(query, { scheduleId });
};

/**
 * Get pending reschedule requests for a user
 */
export const getPendingReschedules = async (userId: string, role: string): Promise<RescheduleRequest[]> => {
  let query = '';
  
  if (role === 'tutor') {
    query = `
      SELECT r.*,
             s.tutorId, s.studentId, s.startTime as originalStartTime, s.endTime as originalEndTime,
             u.fullName as requestedByName, sub.subjectName
      FROM RescheduleRequest r
      JOIN Schedule s ON r.scheduleId = s.scheduleId
      JOIN [User] u ON r.requestedBy = u.userId
      JOIN Subject sub ON s.subjectId = sub.subjectId
      WHERE s.tutorId = :userId
        AND r.status = 'pending'
      ORDER BY r.createdAt DESC
    `;
  } else if (role === 'student') {
    query = `
      SELECT r.*,
             s.tutorId, s.studentId, s.startTime as originalStartTime, s.endTime as originalEndTime,
             u.fullName as requestedByName, sub.subjectName
      FROM RescheduleRequest r
      JOIN Schedule s ON r.scheduleId = s.scheduleId
      JOIN [User] u ON r.requestedBy = u.userId
      JOIN Subject sub ON s.subjectId = sub.subjectId
      WHERE s.studentId = :userId
        AND r.status = 'pending'
      ORDER BY r.createdAt DESC
    `;
  } else {
    throw new Error('Invalid role for reschedule requests');
  }
  
  return await executeQuery<RescheduleRequest[]>(query, { userId });
};

/**
 * Review reschedule request (approve/reject)
 * If approved, automatically create new schedule
 */
export const reviewRescheduleRequest = async (
  rescheduleId: string,
  data: ReviewRescheduleDTO,
  reviewedBy: string
): Promise<RescheduleRequest> => {
  return await executeTransaction(async (transaction: Transaction) => {
    // Get reschedule request
    const reschedule = await getRescheduleById(rescheduleId);
    
    if (!reschedule) {
      throw new Error('Reschedule request not found');
    }
    
    if (reschedule.status !== 'pending') {
      throw new Error('Reschedule request has already been reviewed');
    }
    
    // Update reschedule request status
    const updateQuery = `
      UPDATE RescheduleRequest
      SET status = :status,
          reviewedBy = :reviewedBy,
          reviewNotes = :reviewNotes,
          updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE rescheduleId = :rescheduleId
    `;
    
    const result = await executeQuery<RescheduleRequest[]>(updateQuery, {
      rescheduleId,
      status: data.status,
      reviewedBy,
      reviewNotes: data.reviewNotes || null
    }, QueryTypes.UPDATE);
    
    // If approved, update schedule and mark old one as rescheduled
    if (data.status === 'approved') {
      // Update original schedule status
      const updateScheduleQuery = `
        UPDATE Schedule
        SET status = 'rescheduled', updatedAt = GETDATE()
        WHERE scheduleId = :scheduleId
      `;
      
      await executeQuery(updateScheduleQuery, { scheduleId: reschedule.scheduleId }, QueryTypes.UPDATE);
      
      // Create new schedule with proposed times
      const createScheduleQuery = `
        INSERT INTO Schedule (tutorRequestId, tutorId, studentId, subjectId, startTime, endTime, status, notes, createdAt, updatedAt)
        OUTPUT INSERTED.*
        SELECT tutorRequestId, tutorId, studentId, subjectId, :startTime, :endTime, 'confirmed',
               CONCAT('Rescheduled from: ', FORMAT(startTime, 'yyyy-MM-dd HH:mm'), ' - ', FORMAT(endTime, 'HH:mm')),
               GETDATE(), GETDATE()
        FROM Schedule
        WHERE scheduleId = :scheduleId
      `;
      
      await executeQuery(createScheduleQuery, {
        scheduleId: reschedule.scheduleId,
        startTime: reschedule.proposedStartTime,
        endTime: reschedule.proposedEndTime
      }, QueryTypes.INSERT);
    }
    
    return result[0];
  });
};

/**
 * Cancel reschedule request (by requester)
 */
export const cancelRescheduleRequest = async (rescheduleId: string, userId: string): Promise<void> => {
  const reschedule = await getRescheduleById(rescheduleId);
  
  if (!reschedule) {
    throw new Error('Reschedule request not found');
  }
  
  if (reschedule.requestedBy !== userId) {
    throw new Error('Only the requester can cancel the reschedule request');
  }
  
  if (reschedule.status !== 'pending') {
    throw new Error('Only pending reschedule requests can be cancelled');
  }
  
  const query = `
    UPDATE RescheduleRequest
    SET status = 'cancelled', updatedAt = GETDATE()
    WHERE rescheduleId = :rescheduleId
  `;
  
  await executeQuery(query, { rescheduleId }, QueryTypes.UPDATE);
};
