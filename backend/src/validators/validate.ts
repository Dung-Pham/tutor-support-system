/**
 * File: validators/validate.ts
 * Mục đích: Middleware validate request với Zod
 */

import { Request, Response, NextFunction } from "express";
import { z } from "zod";

type ValidationTarget = "body" | "query" | "params";

/**
 * Middleware factory để validate request data
 * @param schema - Zod schema để validate
 * @param target - Phần của request cần validate (body, query, params)
 */
export const validate = (
  schema: z.ZodSchema,
  target: ValidationTarget = "body"
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = req[target];
      const result = schema.safeParse(data);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        res.status(400).json({
          success: false,
          message: "Dữ liệu không hợp lệ",
          errors,
        });
        return;
      }

      // Gán lại data đã validate (có thể đã transform)
      req[target] = result.data;

      next();
    } catch (error) {
      // Unexpected error
      console.error("Validation error", error);
      res.status(500).json({
        success: false,
        message: "Lỗi xác thực dữ liệu",
      });
    }
  };
};

/**
 * Shorthand validators
 */
export const validateBody = (schema: z.ZodSchema) => validate(schema, "body");
export const validateQuery = (schema: z.ZodSchema) => validate(schema, "query");
export const validateParams = (schema: z.ZodSchema) =>
  validate(schema, "params");
