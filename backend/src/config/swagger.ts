/**
 * File: swagger.ts
 * Mục đích: Cấu hình Swagger/OpenAPI documentation
 * Vai trò:
 *   - Tự động generate API documentation
 *   - Hỗ trợ test API trực tiếp trên UI
 * Lưu ý:
 *   - Swagger sẽ scan comments trong routes và models
 *   - Cần tuân thủ chuẩn JSDoc để Swagger nhận diện
 *   - Bearer token authentication đã được cấu hình
 */

import swaggerJsdoc from 'swagger-jsdoc';

interface SwaggerOptions {
  definition: {
    openapi: string;
    info: {
      title: string;
      version: string;
      description: string;
      contact: {
        name: string;
        email: string;
      };
    };
    servers: Array<{
      url: string;
      description: string;
    }>;
    components: {
      securitySchemes: {
        bearerAuth: {
          type: string;
          scheme: string;
          bearerFormat: string;
        };
      };
    };
    security: Array<{
      bearerAuth: string[];
    }>;
  };
  apis: string[];
}

const options: SwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tutor Support System API',
      version: '1.0.0',
      description: 'API documentation cho hệ thống hỗ trợ gia sư',
      contact: {
        name: 'API Support',
        email: 'support@tutorsystem.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Đường dẫn đến các file chứa Swagger comments
  // Scan cả .js và .ts files
  apis: [
    './src/routes/*.js',
    './src/routes/*.ts',
    './src/models/*.js',
    './src/models/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
