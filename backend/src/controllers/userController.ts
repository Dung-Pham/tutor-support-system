/**
 * File: userController.ts
 * Mục đích: Controller xử lý user operations (SQL Server)
 */

import { Request, Response } from "express";
import { User } from "../models/sql/index.js";
import { AuthRequest } from "../types/index.js";
import { Op } from "sequelize";

interface PaginationQuery {
  page?: string;
  limit?: string;
}

interface UpdateStatusBody {
  isActive: boolean;
}

interface UserParams {
  id: string;
}

// Get current authenticated user
export const authMe = (req: AuthRequest, res: Response): Response => {
  try {
    return res.status(200).json({
      success: true,
      message: "User info retrieved successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("Error in authMe:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all users with pagination (admin only)
export const getAllUsers = async (
  req: Request<object, object, object, PaginationQuery>,
  res: Response
): Promise<Response> => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const offset = (page - 1) * limit;

    const { count: total, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ["hashedPassword"] },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update user status (admin only)
export const updateUserStatus = async (
  req: Request<UserParams, object, UpdateStatusBody>,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value",
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({ isActive });

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
