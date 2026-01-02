/**
 * File: database/connection.ts
 * Purpose: SQL Server connection pool management with retry logic
 * 
 * Features:
 * - Connection pooling for better performance
 * - Automatic retry on connection failures
 * - Health check capabilities
 * - Graceful connection cleanup
 */

import sql from 'mssql';
import type { config as SQLConfig, IResult } from 'mssql';
const { ConnectionPool } = sql;

/**
 * Database configuration interface
 */
interface DatabaseConfig extends SQLConfig {
  server: string;
  database: string;
  user?: string;
  password?: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    enableArithAbort: boolean;
  };
  pool: {
    max: number;
    min: number;
    idleTimeoutMillis: number;
  };
  connectionTimeout: number;
  requestTimeout: number;
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

/**
 * Database connection class with retry logic
 */
class DatabaseConnection {
  private pool: ConnectionPool | null = null;
  private config: DatabaseConfig;
  private retryConfig: RetryConfig;
  private isConnecting: boolean = false;

  constructor() {
    // Initialize database configuration from environment variables
    const useWindowsAuth = process.env.DB_USE_WINDOWS_AUTH === 'true';
    
    this.config = {
      server: process.env.DB_SERVER || 'localhost',
      database: process.env.DB_NAME || 'tutor_support_db',
      port: parseInt(process.env.DB_PORT || '1433'),
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
        enableArithAbort: true,
      },
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '10'),
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
      },
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
      requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '30000'),
    } as any;

    // Add authentication config
    if (useWindowsAuth) {
      // Windows Authentication
      (this.config as any).authentication = {
        type: 'ntlm',
        options: {
          domain: process.env.DB_DOMAIN || '',
        },
      };
    } else {
      // SQL Server Authentication - just use user/password, don't specify authentication type
      this.config.user = process.env.DB_USER || 'sa';
      this.config.password = process.env.DB_PASSWORD || '';
    }

    // Initialize retry configuration
    this.retryConfig = {
      maxRetries: parseInt(process.env.DB_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
      backoffMultiplier: parseFloat(process.env.DB_BACKOFF_MULTIPLIER || '2'),
    };
  }

  /**
   * Connect to SQL Server with retry logic
   * @returns Promise<ConnectionPool>
   */
  async connect(): Promise<ConnectionPool> {
    // Return existing pool if already connected
    if (this.pool && this.pool.connected) {
      return this.pool;
    }

    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      await this.waitForConnection();
      if (this.pool && this.pool.connected) {
        return this.pool;
      }
    }

    this.isConnecting = true;

    let lastError: Error | null = null;
    let delay = this.retryConfig.retryDelay;

    // Retry connection with exponential backoff
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        console.log(`🔌 Attempting to connect to SQL Server (attempt ${attempt}/${this.retryConfig.maxRetries})...`);
        console.log(`📝 Debug - server: "${this.config.server}", port: ${this.config.port}, db: "${this.config.database}"`);
        console.log(`📝 Debug - user: "${this.config.user}", password: "${this.config.password ? '***' + this.config.password?.slice(-2) : 'empty'}"`);
        console.log(`📝 Debug - encrypt: ${this.config.options?.encrypt}, trust: ${this.config.options?.trustServerCertificate}`);

        this.pool = new sql.ConnectionPool(this.config);
        
        // Set up event handlers
        this.setupEventHandlers();

        await this.pool.connect();
        
        console.log('✅ Successfully connected to SQL Server');
        console.log(`📊 Database: ${this.config.database}`);
        console.log(`🖥️  Server: ${this.config.server}`);
        
        this.isConnecting = false;
        return this.pool;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Connection attempt ${attempt} failed:`, error);

        // Clean up failed pool
        if (this.pool) {
          try {
            await this.pool.close();
          } catch (closeError) {
            console.error('Error closing failed pool:', closeError);
          }
          this.pool = null;
        }

        // Wait before retry (except on last attempt)
        if (attempt < this.retryConfig.maxRetries) {
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
          delay *= this.retryConfig.backoffMultiplier;
        }
      }
    }

    this.isConnecting = false;
    throw new Error(
      `Failed to connect to SQL Server after ${this.retryConfig.maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Set up connection pool event handlers
   */
  private setupEventHandlers(): void {
    if (!this.pool) return;

    this.pool.on('error', (err) => {
      console.error('❌ SQL Server connection pool error:', err);
    });

    this.pool.on('close', () => {
      console.log('🔌 SQL Server connection pool closed');
    });
  }

  /**
   * Wait for ongoing connection attempt
   */
  private async waitForConnection(timeout: number = 30000): Promise<void> {
    const startTime = Date.now();
    while (this.isConnecting && Date.now() - startTime < timeout) {
      await this.sleep(100);
    }
  }

  /**
   * Get connection pool (connects if not already connected)
   * @returns Promise<ConnectionPool>
   */
  async getPool(): Promise<ConnectionPool> {
    if (this.pool && this.pool.connected) {
      return this.pool;
    }
    return await this.connect();
  }

  /**
   * Execute a query with automatic connection handling
   * @param query SQL query string
   * @param params Query parameters
   * @returns Promise<IResult<any>>
   */
  async query<T = any>(query: string, params?: Record<string, any>): Promise<IResult<T>> {
    const pool = await this.getPool();
    const request = pool.request();

    // Add parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value);
      });
    }

    return await request.query<T>(query);
  }

  /**
   * Execute a stored procedure
   * @param procedureName Stored procedure name
   * @param params Procedure parameters
   * @returns Promise<IResult<any>>
   */
  async execute<T = any>(
    procedureName: string,
    params?: Record<string, any>
  ): Promise<IResult<T>> {
    const pool = await this.getPool();
    const request = pool.request();

    // Add parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value);
      });
    }

    return await request.execute<T>(procedureName);
  }

  /**
   * Begin a transaction
   * @returns Promise<sql.Transaction>
   */
  async beginTransaction(): Promise<sql.Transaction> {
    const pool = await this.getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    return transaction;
  }

  /**
   * Check if database connection is healthy
   * @returns Promise<boolean>
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 AS health');
      return result.recordset.length > 0 && result.recordset[0].health === 1;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  /**
   * Close the database connection pool
   * @returns Promise<void>
   */
  async close(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.close();
        console.log('✅ Database connection pool closed successfully');
        this.pool = null;
      } catch (error) {
        console.error('❌ Error closing database connection pool:', error);
        throw error;
      }
    }
  }

  /**
   * Sleep utility for retry delays
   * @param ms Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get connection status
   * @returns boolean
   */
  isConnected(): boolean {
    return this.pool !== null && this.pool.connected;
  }

  /**
   * Get database configuration (without sensitive data)
   * @returns Object with non-sensitive config
   */
  getConfig(): Partial<DatabaseConfig> {
    return {
      server: this.config.server,
      database: this.config.database,
      user: this.config.user,
      options: this.config.options,
      pool: this.config.pool,
    };
  }
}

// Singleton instance
const dbConnection = new DatabaseConnection();

/**
 * Export the database connection instance
 */
export default dbConnection;

/**
 * Export SQL types for use in other modules
 */
export { sql, ConnectionPool, IResult };

/**
 * Export helper function to ensure connection
 */
export const ensureConnection = async (): Promise<ConnectionPool> => {
  return await dbConnection.getPool();
};

/**
 * Export transaction helper
 */
export const withTransaction = async <T>(
  callback: (transaction: sql.Transaction) => Promise<T>
): Promise<T> => {
  const transaction = await dbConnection.beginTransaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
