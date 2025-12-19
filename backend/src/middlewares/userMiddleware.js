import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing",
      });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired access token",
        });
      }

      try {
        const user = await User.findById(decoded.userId).select(
          "-hashedPassword"
        );
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }
        req.user = user;
        next();
      } catch (dbError) {
        console.error("Database error in authenticateToken:", dbError);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });
  } catch (error) {
    console.error("Error in authenticateToken:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing",
      });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired access token",
        });
      }

      try {
        const user = await User.findById(decoded.userId).select(
          "-hashedPassword"
        );
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }
        req.user = user;
        next();
      } catch (dbError) {
        console.error("Database error in protectedRoute:", dbError);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });
  } catch (error) {
    console.error("Error in protectedRoute middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
