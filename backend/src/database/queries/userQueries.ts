/**
 * File: UserAccountQueries.ts
 * Purpose: Database queries for User operations (SQL Server)
 * Tables: UserAccount, TutorProfile, StudentProfile, ParentProfile
 * Updated: 2025-11-16 - Fixed to use dbConnection
 */

import dbConnection from '../connection';

// ==========================================
// INTERFACES
// ==========================================

export interface UserAccount {
  user_id: string;
  email: string;
  password_hash: string;
  name: string;
  phone: string;
  // avatar_url: string | null;
  role: 'USER' | 'TUTOR' | 'ADMIN' | string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: Date;
  updated_at: Date;
}

export interface TutorProfile {
  tutor_profile_id: string;
  user_id: string;
  bio: string | null;
  subjects: string | null;
  experience_years: number;
  hourly_rate: number;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
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
// QUERY FUNCTIONS
// ==========================================

/**
 * Get all users with pagination and filters
 */
export const getUsers = async (params: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
}): Promise<{ users: UserAccount[]; total: number }> => {
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

  const query = `
    SELECT user_id, email, name, phone,  role, status, created_at, updated_at
    FROM [UserAccount]
    ${whereClause}
    ORDER BY created_at DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;

  const users = await dbConnection.query<UserAccount>(query, queryParams);

  const countQuery = `
    SELECT COUNT(*) as total
    FROM [UserAccount]
    ${whereClause}
  `;

  const countParams: any = {};
  if (params.role) countParams.role = params.role;
  if (params.status) countParams.status = params.status;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, countParams);

  return {
    users: users.recordset,
    total: countResult.recordset[0]?.total || 0,
  };
};

/**
 * Get user by ID (excluding password)
 */
export const getUserById = async (userId: string): Promise<UserAccount | null> => {
  const query = `
    SELECT user_id, email, name, phone, role, status, created_at, updated_at
    FROM [UserAccount]
    WHERE user_id = @userId
  `;

  const result = await dbConnection.query<UserAccount>(query, { userId });
  return result.recordset[0] || null;
};

/**
 * Get user by email (for authentication - includes password)
 */
export const getUserByEmail = async (email: string): Promise<UserAccount | null> => {
  const query = `
    SELECT * FROM [UserAccount] WHERE email = @email
  `;

  const result = await dbConnection.query<UserAccount>(query, { email });
  return result.recordset[0] || null;
};

/**
 * Create new user
 */
export const createUser = async (userData: {
  user_id: string;
  email: string;
  password_hash: string;
  name: string;
  phone: string;
  role: string;
  // avatar_url?: string;
}): Promise<UserAccount> => {
  const query = `
    INSERT INTO [User] (
      user_id, email, password_hash, name, phone, role, status, created_at, updated_at
    )
    OUTPUT INSERTED.*
    VALUES (
      @user_id, @email, @password_hash, @name, @phone,
       @role, 'active', GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<UserAccount>(query, {
    user_id: userData.user_id,
    email: userData.email,
    password_hash: userData.password_hash,
    name: userData.name,
    phone: userData.phone,
    // avatar_url: userData.avatar_url || null,
    role: userData.role,
  });

  return result.recordset[0];
};

/**
 * Update user
 */
export const updateUser = async (
  userId: string,
  updates: {
    email?: string;
    name?: string;
    phone?: string;
    // avatar_url?: string;
    status?: 'active' | 'inactive' | 'suspended';
  }
): Promise<UserAccount | null> => {
  const updateFields: string[] = [];
  const queryParams: any = { userId };

  if (updates.email !== undefined) {
    updateFields.push('email = @email');
    queryParams.email = updates.email;
  }
  if (updates.name !== undefined) {
    updateFields.push('name = @name');
    queryParams.name = updates.name;
  }
  if (updates.phone !== undefined) {
    updateFields.push('phone = @phone');
    queryParams.phone = updates.phone;
  }
  // if (updates.avatar_url !== undefined) {
  //   updateFields.push('avatar_url = @avatar_url');
  //   queryParams.avatar_url = updates.avatar_url;
  // }
  if (updates.status !== undefined) {
    updateFields.push('status = @status');
    queryParams.status = updates.status;
  }

  if (updateFields.length === 0) {
    return await getUserById(userId);
  }

  updateFields.push('updated_at = GETDATE()');

  const query = `
    UPDATE [User]
    SET ${updateFields.join(', ')}
    OUTPUT INSERTED.*
    WHERE user_id = @userId
  `;

  const result = await dbConnection.query<UserAccount>(query, queryParams);
  return result.recordset[0] || null;
};

/**
 * Delete user (soft delete by setting status to inactive)
 */
export const deleteUser = async (userId: string): Promise<void> => {
  const query = `
    UPDATE [UserAccount]
    SET status = 'inactive', updated_at = GETDATE()
    WHERE user_id = @userId
  `;

  await dbConnection.query(query, { userId });
};

/**
 * Get tutor profile by user ID
 */
export const getTutorProfile = async (userId: string): Promise<any | null> => {
  const query = `
    SELECT u.*, tp.*
    FROM [UserAccount] u
    LEFT JOIN TutorProfile tp ON TRY_CONVERT(UNIQUEIDENTIFIER, tp.user_id) = u.user_id
    WHERE u.user_id = @userId AND UPPER(u.role) = 'TUTOR'
  `;

  const result = await dbConnection.query(query, { userId });
  return result.recordset[0] || null;
};

/**
 * Get student profile by user ID
 */
export const getStudentProfile = async (userId: string): Promise<any | null> => {
  const query = `
    SELECT u.*, sp.*
    FROM [UserAccount] u
    LEFT JOIN StudentProfile sp ON u.user_id = sp.user_id
    WHERE u.user_id = @userId AND u.role = 'student'
  `;

  const result = await dbConnection.query(query, { userId });
  return result.recordset[0] || null;
};

/**
 * Get parent profile by user ID
 */
export const getParentProfile = async (userId: string): Promise<any | null> => {
  const query = `
    SELECT u.*, pp.*
    FROM [UserAccount] u
    LEFT JOIN ParentProfile pp ON u.user_id = pp.user_id
    WHERE u.user_id = @userId AND u.role = 'parent'
  `;

  const result = await dbConnection.query(query, { userId });
  return result.recordset[0] || null;
};

/**
 * Get all tutors with profiles
 */
export const getAllTutors = async (params: {
  page?: number;
  limit?: number;
  subjects?: string;
  minRating?: number;
}): Promise<{ tutors: any[]; total: number }> => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  let whereClause = "WHERE UPPER(u.role) = 'TUTOR' AND u.status = 'active'";
  const queryParams: any = { limit, offset };

  if (params.subjects) {
    whereClause += ' AND tp.subjects LIKE @subjects';
    queryParams.subjects = `%${params.subjects}%`;
  }

  if (params.minRating !== undefined) {
    whereClause += ' AND tp.average_rating >= @minRating';
    queryParams.minRating = params.minRating;
  }

  const query = `
    SELECT u.user_id, u.email, u.name, u.phone, u.created_at
    FROM [UserAccount] u
    ${whereClause}
    ORDER BY u.created_at DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;

  const tutors = await dbConnection.query(query, queryParams);

  const countQuery = `
    SELECT COUNT(*) as total
    FROM [UserAccount] u
    ${whereClause}
  `;

  const countParams: any = {};
  if (params.subjects) countParams.subjects = queryParams.subjects;
  if (params.minRating !== undefined) countParams.minRating = params.minRating;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, countParams);

  return {
    tutors: tutors.recordset,
    total: countResult.recordset[0]?.total || 0,
  };
};
