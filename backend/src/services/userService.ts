/**
 * File: userService.ts
 * Purpose: Business logic for User operations
 * Updated: 2025-11-16 - Migrated to SQL Server
 */

import * as userQueries from '../database/queries/userQueries';
import { randomUUID } from 'crypto';

/**
 * Get all users with pagination
 */
export async function getUsers(params: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
}) {
  return await userQueries.getUsers(params);
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const user = await userQueries.getUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Get user with profile based on role
 */
export async function getUserWithProfile(userId: string) {
  const user = await userQueries.getUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  let profile = null;

  switch (user.role) {
    case 'tutor':
      profile = await userQueries.getTutorProfile(userId);
      break;
    case 'student':
      profile = await userQueries.getStudentProfile(userId);
      break;
    case 'parent':
      profile = await userQueries.getParentProfile(userId);
      break;
  }

  return profile || user;
}

/**
 * Create new user
 */
export async function createUser(userData: {
  email: string;
  password_hash: string;
  name: string;
  phone: string;
  role: string;
  avatar_url?: string;
}) {
  // Check if email already exists
  const existingUser = await userQueries.getUserByEmail(userData.email);
  
  if (existingUser) {
    throw new Error('Email already exists');
  }

  const userId = randomUUID();

  return await userQueries.createUser({
    user_id: userId,
    ...userData,
  });
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  updates: {
    email?: string;
    name?: string;
    phone?: string;
    avatar_url?: string;
    status?: 'active' | 'inactive' | 'suspended';
  }
) {
  // Check if email is being updated and already exists
  if (updates.email) {
    const existingUser = await userQueries.getUserByEmail(updates.email);
    if (existingUser && existingUser.user_id !== userId) {
      throw new Error('Email already exists');
    }
  }

  const updatedUser = await userQueries.updateUser(userId, updates);
  
  if (!updatedUser) {
    throw new Error('User not found');
  }

  return updatedUser;
}

/**
 * Delete user (soft delete)
 */
export async function deleteUser(userId: string) {
  const user = await userQueries.getUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  return await userQueries.deleteUser(userId);
}

/**
 * Get all tutors
 */
export async function getAllTutors(params: {
  page?: number;
  limit?: number;
  subjects?: string;
  minRating?: number;
}) {
  return await userQueries.getAllTutors(params);
}

/**
 * Search users by name or email
 */
export async function searchUsers(query: string, role?: string) {
  const params: any = {
    page: 1,
    limit: 50,
  };

  if (role) {
    params.role = role;
  }

  const { users } = await userQueries.getUsers(params);

  // Filter by name or email (case-insensitive)
  const searchTerm = query.toLowerCase();
  const filtered = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
  );

  return filtered;
}

/**
 * Get tutor profile by user ID
 */
export async function getTutorProfile(userId: string) {
  const profile = await userQueries.getTutorProfile(userId);
  if (!profile) {
    throw new Error('Tutor profile not found');
  }
  return profile;
}

/**
 * Get student profile by user ID
 */
export async function getStudentProfile(userId: string) {
  const profile = await userQueries.getStudentProfile(userId);
  if (!profile) {
    throw new Error('Student profile not found');
  }
  return profile;
}

/**
 * Get parent profile by user ID
 */
export async function getParentProfile(userId: string) {
  const profile = await userQueries.getParentProfile(userId);
  if (!profile) {
    throw new Error('Parent profile not found');
  }
  return profile;
}
