/**
 * File: userQueries.ts
 * Purpose: Database queries for User table (SQL Server)
 * Tables: User, TutorProfile, StudentProfile, ParentProfile
 */

import dbConnection from '../connection';

// ==========================================
// INTERFACES
// ==========================================

export interface User {
  user_id: string;
  email: string;
  password_hash: string;
  name: string;
  phone: string;
  avatar_url: string | null;
  role: 'admin' | 'tutor' | 'student' | 'parent';
  status: 'active' | 'inactive' | 'suspended';
  created_at: Date;
  updated_at: Date;
}

export interface TutorProfile {
  tutor_profile_id: string;
  user_id: string;
  bio: string | null;
  experience_years: number | null;
  subjects: string | null;
  hourly_rate: number | null;
  average_rating: number | null;
  total_reviews: number | null;
  is_verified: boolean;
  verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface StudentProfile {
  student_profile_id: string;
  user_id: string;
  grade_level: string | null;
  school_name: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ParentProfile {
  parent_profile_id: string;
  user_id: string;
  occupation: string | null;
  created_at: Date;
  updated_at: Date;
}

// ==========================================
// USER CRUD OPERATIONS
// ==========================================

/**
 * Get all users with pagination and optional role filter
 */
export async function getUsers(params: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
}): Promise<{ users: User[]; total: number }> {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const queryParams: any = { limit, offset };

  if (params.role) {
    whereClause += ' AND role = @role';
    queryParams.role = params.role;
  }

  if (params.status) {
    whereClause += ' AND status = @status';
    queryParams.status = params.status;
  }

  const users = await executeQuery<User[]>(
    `SELECT user_id, email, name, phone, avatar_url, role, status, created_at, updated_at
     FROM [User]
     ${whereClause}
     ORDER BY created_at DESC
     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
    queryParams,
    QueryTypes.SELECT
  );

  const [countResult] = await executeQuery<{ total: number }[]>(
    `SELECT COUNT(*) as total FROM [User] ${whereClause}`,
    params.role || params.status ? queryParams : {},
    QueryTypes.SELECT
  );

  return {
    users,
    total: countResult.total,
  };
}

/**
 * Get user by ID (excluding password)
 */
export async function getUserById(userId: string): Promise<User | null> {
  const [user] = await executeQuery<User[]>(
    `SELECT user_id, email, name, phone, avatar_url, role, status, created_at, updated_at
     FROM [User]
     WHERE user_id = @userId`,
    { userId },
    QueryTypes.SELECT
  );

  return user || null;
}

/**
 * Get user by email (for authentication - includes password)
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await executeQuery<User[]>(
    `SELECT * FROM [User] WHERE email = @email`,
    { email },
    QueryTypes.SELECT
  );

  return user || null;
}

/**
 * Create new user
 */
export async function createUser(userData: {
  user_id: string;
  email: string;
  password_hash: string;
  name: string;
  phone: string;
  role: string;
  avatar_url?: string;
  status?: string;
}): Promise<User> {
  await executeQuery(
    `INSERT INTO [User] (user_id, email, password_hash, name, phone, avatar_url, role, status, created_at, updated_at)
     VALUES (@user_id, @email, @password_hash, @name, @phone, @avatar_url, @role, @status, GETDATE(), GETDATE())`,
    {
      user_id: userData.user_id,
      email: userData.email,
      password_hash: userData.password_hash,
      name: userData.name,
      phone: userData.phone,
      avatar_url: userData.avatar_url || null,
      role: userData.role,
      status: userData.status || 'active',
    },
    QueryTypes.INSERT
  );

  return getUserById(userData.user_id) as Promise<User>;
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, 'user_id' | 'created_at'>>
): Promise<User | null> {
  const setClauses: string[] = [];
  const params: any = { userId };

  if (updates.email !== undefined) {
    setClauses.push('email = @email');
    params.email = updates.email;
  }
  if (updates.name !== undefined) {
    setClauses.push('name = @name');
    params.name = updates.name;
  }
  if (updates.phone !== undefined) {
    setClauses.push('phone = @phone');
    params.phone = updates.phone;
  }
  if (updates.avatar_url !== undefined) {
    setClauses.push('avatar_url = @avatar_url');
    params.avatar_url = updates.avatar_url;
  }
  if (updates.status !== undefined) {
    setClauses.push('status = @status');
    params.status = updates.status;
  }

  if (setClauses.length === 0) {
    return getUserById(userId);
  }

  setClauses.push('updated_at = GETDATE()');

  await executeQuery(
    `UPDATE [User] SET ${setClauses.join(', ')} WHERE user_id = @userId`,
    params,
    QueryTypes.UPDATE
  );

  return getUserById(userId);
}

/**
 * Delete user (soft delete by setting status to inactive)
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const result = await executeQuery(
    `UPDATE [User] SET status = 'inactive', updated_at = GETDATE() WHERE user_id = @userId`,
    { userId },
    QueryTypes.UPDATE
  );

  return true;
}

/**
 * Hard delete user (use with caution)
 */
export async function hardDeleteUser(userId: string): Promise<boolean> {
  await executeQuery(
    `DELETE FROM [User] WHERE user_id = @userId`,
    { userId },
    QueryTypes.DELETE
  );

  return true;
}

// ==========================================
// PROFILE OPERATIONS
// ==========================================

/**
 * Get tutor profile with user info
 */
export async function getTutorProfile(userId: string) {
  const [profile] = await executeQuery<any[]>(
    `SELECT 
      u.user_id, u.email, u.name, u.phone, u.avatar_url, u.role, u.status,
      tp.tutor_profile_id, tp.bio, tp.experience_years, tp.subjects, 
      tp.hourly_rate, tp.average_rating, tp.total_reviews, 
      tp.is_verified, tp.verified_at
     FROM [User] u
     INNER JOIN [TutorProfile] tp ON u.user_id = tp.user_id
     WHERE u.user_id = @userId`,
    { userId },
    QueryTypes.SELECT
  );

  return profile || null;
}

/**
 * Get student profile with user info
 */
export async function getStudentProfile(userId: string) {
  const [profile] = await executeQuery<any[]>(
    `SELECT 
      u.user_id, u.email, u.name, u.phone, u.avatar_url, u.role, u.status,
      sp.student_profile_id, sp.grade_level, sp.school_name
     FROM [User] u
     INNER JOIN [StudentProfile] sp ON u.user_id = sp.user_id
     WHERE u.user_id = @userId`,
    { userId },
    QueryTypes.SELECT
  );

  return profile || null;
}

/**
 * Get parent profile with user info
 */
export async function getParentProfile(userId: string) {
  const [profile] = await executeQuery<any[]>(
    `SELECT 
      u.user_id, u.email, u.name, u.phone, u.avatar_url, u.role, u.status,
      pp.parent_profile_id, pp.occupation
     FROM [User] u
     INNER JOIN [ParentProfile] pp ON u.user_id = pp.user_id
     WHERE u.user_id = @userId`,
    { userId },
    QueryTypes.SELECT
  );

  return profile || null;
}

/**
 * Get all tutors with their profiles
 */
export async function getAllTutors(params: {
  page?: number;
  limit?: number;
  subjects?: string;
  minRating?: number;
}) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  let whereClause = "WHERE u.role = 'tutor' AND u.status = 'active'";
  const queryParams: any = { limit, offset };

  if (params.subjects) {
    whereClause += ' AND tp.subjects LIKE @subjects';
    queryParams.subjects = `%${params.subjects}%`;
  }

  if (params.minRating) {
    whereClause += ' AND tp.average_rating >= @minRating';
    queryParams.minRating = params.minRating;
  }

  const tutors = await executeQuery<any[]>(
    `SELECT 
      u.user_id, u.email, u.name, u.phone, u.avatar_url,
      tp.bio, tp.experience_years, tp.subjects, tp.hourly_rate,
      tp.average_rating, tp.total_reviews, tp.is_verified
     FROM [User] u
     INNER JOIN [TutorProfile] tp ON u.user_id = tp.user_id
     ${whereClause}
     ORDER BY tp.average_rating DESC, tp.total_reviews DESC
     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
    queryParams,
    QueryTypes.SELECT
  );

  const [countResult] = await executeQuery<{ total: number }[]>(
    `SELECT COUNT(*) as total 
     FROM [User] u
     INNER JOIN [TutorProfile] tp ON u.user_id = tp.user_id
     ${whereClause}`,
    params.subjects || params.minRating ? queryParams : {},
    QueryTypes.SELECT
  );

  return {
    tutors,
    total: countResult.total,
  };
}
