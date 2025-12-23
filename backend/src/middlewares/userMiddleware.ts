/**
 * File: middlewares/userMiddleware.ts
 * Mục đích: Authentication và Authorization middlewares (SQL Server)
 */

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/sql/index.js";
import { AuthRequest, JwtPayload } from "../types/index.js";

// Authenticate access token
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is missing",
      });
      return;
    }

    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
      async (err, decoded) => {
        if (err) {
          res.status(401).json({
            success: false,
            message: "Invalid or expired access token",
          });
          return;
        }

        try {
          const payload = decoded as JwtPayload;
          const user = await User.findByPk(payload.userId, {
            attributes: { exclude: ["hashedPassword"] },
          });

          if (!user) {
            res.status(404).json({
              success: false,
              message: "User not found",
            });
            return;
          }

          req.user = {
            _id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl ?? undefined,
            bio: user.bio ?? undefined,
            phone: user.phone ?? undefined,
            role: user.role,
            isActive: user.isActive,
            lastSeenAt: user.lastSeenAt ?? undefined,
            createdAt: user.createdAt,
          };
          next();
        } catch (dbError) {
          console.error("Database error in authenticateToken:", dbError);
          res.status(500).json({
            success: false,
            message: "Internal server error",
          });
        }
      }
    );
  } catch (error) {
    console.error("Error in authenticateToken:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Protected route middleware
export const protectedRoute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is missing",
      });
      return;
    }

    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
      async (err, decoded) => {
        if (err) {
          res.status(401).json({
            success: false,
            message: "Invalid or expired access token",
          });
          return;
        }

        try {
          const payload = decoded as JwtPayload;
          const user = await User.findByPk(payload.userId, {
            attributes: { exclude: ["hashedPassword"] },
          });

          if (!user) {
            res.status(404).json({
              success: false,
              message: "User not found",
            });
            return;
          }

          req.user = {
            _id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl ?? undefined,
            bio: user.bio ?? undefined,
            phone: user.phone ?? undefined,
            role: user.role,
            isActive: user.isActive,
            lastSeenAt: user.lastSeenAt ?? undefined,
            createdAt: user.createdAt,
          };
          next();
        } catch (dbError) {
          console.error("Database error in protectedRoute:", dbError);
          res.status(500).json({
            success: false,
            message: "Internal server error",
          });
        }
      }
    );
  } catch (error) {
    console.error("Error in protectedRoute middleware:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Admin only middleware - phải sử dụng sau protectedRoute/authenticateToken
export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Unauthorized - No user found",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Forbidden - Admin access required",
    });
    return;
  }

  next();
};
