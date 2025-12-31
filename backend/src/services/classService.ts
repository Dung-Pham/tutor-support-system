/**
 * File: services/classService.ts
 * Purpose: Business logic for class management
 */

import * as classQueries from '../database/queries/classQueries';

export const getMyClasses = async (userId: string, userRole: 'tutor' | 'student') => {
  return await classQueries.getClassesWithSchedules(userId, userRole);
};

export const getClassById = async (classId: string) => {
  return await classQueries.getClassById(classId);
};

export const getActiveClasses = async (userId: string, userRole: 'tutor' | 'student') => {
  return await classQueries.getActiveClasses(userId, userRole);
};

export const getClassesByStudent = async (studentId: string) => {
  return await classQueries.getClassesByStudent(studentId);
};

export const getClassesByTutor = async (tutorId: string) => {
  return await classQueries.getClassesByTutor(tutorId);
};
