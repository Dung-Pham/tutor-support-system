/**
 * File: utils/database.ts
 * Mục đích: Cung cấp các helper functions cho database operations
 * Vai trò: Wrapper functions cho SQL queries, transaction handling
 */

import { sequelize } from '../config/sqlserver';
import { QueryTypes, Transaction } from 'sequelize';

/**
 * Execute raw SQL query with parameters
 * @param query SQL query string
 * @param params Query parameters
 * @param type Query type (SELECT, INSERT, UPDATE, etc.)
 */
export const executeQuery = async <T = any>(
  query: string,
  params: Record<string, any> = {},
  type: QueryTypes = QueryTypes.SELECT
): Promise<T> => {
  try {
    const result = await sequelize.query(query, {
      replacements: params,
      type,
    });
    return result as T;
  } catch (error: any) {
    console.error('Database query error:', error.message);
    throw new Error(`Database operation failed: ${error.message}`);
  }
};

/**
 * Execute stored procedure
 * @param procedureName Stored procedure name
 * @param params Procedure parameters
 */
export const executeProcedure = async <T = any>(
  procedureName: string,
  params: Record<string, any> = {}
): Promise<T> => {
  try {
    const paramString = Object.keys(params)
      .map(key => `@${key} = :${key}`)
      .join(', ');
    
    const query = `EXEC ${procedureName} ${paramString}`;
    
    const result = await sequelize.query(query, {
      replacements: params,
      type: QueryTypes.SELECT,
    });
    
    return result as T;
  } catch (error: any) {
    console.error('Stored procedure error:', error.message);
    throw new Error(`Stored procedure failed: ${error.message}`);
  }
};

/**
 * Execute multiple queries in a transaction
 * @param callback Transaction callback function
 */
export const executeTransaction = async <T = any>(
  callback: (transaction: Transaction) => Promise<T>
): Promise<T> => {
  const transaction = await sequelize.transaction();
  
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error: any) {
    await transaction.rollback();
    console.error('Transaction error:', error.message);
    throw new Error(`Transaction failed: ${error.message}`);
  }
};

/**
 * Build pagination query
 * @param baseQuery Base SQL query
 * @param page Page number (1-indexed)
 * @param limit Items per page
 * @param sortBy Sort column
 * @param sortOrder Sort order (ASC/DESC)
 */
export const buildPaginationQuery = (
  baseQuery: string,
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'createdAt',
  sortOrder: 'ASC' | 'DESC' = 'DESC'
): { query: string; offset: number; limit: number } => {
  const offset = (page - 1) * limit;
  const orderClause = `ORDER BY ${sortBy} ${sortOrder}`;
  const paginationClause = `OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
  
  const query = `${baseQuery} ${orderClause} ${paginationClause}`;
  
  return { query, offset, limit };
};

/**
 * Get total count for pagination
 * @param tableName Table name
 * @param whereClause WHERE clause (optional)
 * @param params Query parameters
 */
export const getTotalCount = async (
  tableName: string,
  whereClause: string = '',
  params: Record<string, any> = {}
): Promise<number> => {
  const query = `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`;
  const result = await executeQuery<[{ total: number }]>(query, params);
  return result[0]?.total || 0;
};

/**
 * Build WHERE clause from filter object
 * @param filters Filter object
 */
export const buildWhereClause = (
  filters: Record<string, any>
): { whereClause: string; params: Record<string, any> } => {
  const conditions: string[] = [];
  const params: Record<string, any> = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      conditions.push(`${key} = :${key}`);
      params[key] = value;
    }
  });
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  return { whereClause, params };
};

/**
 * Check if record exists
 * @param tableName Table name
 * @param idColumn ID column name
 * @param idValue ID value
 */
export const recordExists = async (
  tableName: string,
  idColumn: string,
  idValue: any
): Promise<boolean> => {
  const query = `SELECT COUNT(*) as count FROM ${tableName} WHERE ${idColumn} = :idValue`;
  const result = await executeQuery<[{ count: number }]>(query, { idValue });
  return (result[0]?.count || 0) > 0;
};
