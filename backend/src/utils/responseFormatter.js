/**
 * File: responseFormatter.js
 * Purpose: Utility functions to format API responses in a consistent way
 * Role:
 *   - Standardize the format of responses sent to the client
 *   - Ensure consistency across the entire API
 * Note:
 *   - Not currently used in controllers
 *   - Can be integrated into controllers for unified response formatting
 */

/**
 * Formats a successful API response.
 * @param {*} data - The data to return to the client (can be any type)
 * @returns {Object} Formatted response object with success flag, data, and timestamp
 * Usage: return responseFormatter(userData)
 */
const responseFormatter = (data) => {
  return {
    success: true, // Indicates the request was successful
    data, // The actual data payload
    timestamp: new Date().toISOString(), // When the response was generated
  };
};

/**
 * Formats an error API response.
 * @param {string} message - Error message to return to the client
 * @param {number} statusCode - HTTP status code (default: 500)
 * @returns {Object} Formatted error object with success flag, message, status code, and timestamp
 * Usage: return errorFormatter('User not found', 404)
 */
const errorFormatter = (message, statusCode = 500) => {
  return {
    success: false, // Indicates the request failed
    message, // Error message for the client
    statusCode, // HTTP status code
    timestamp: new Date().toISOString(), // When the error was generated
  };
};

// Export the formatter functions for use in controllers and routes
export { responseFormatter, errorFormatter };
