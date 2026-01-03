import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserAccount from "../models/UserSQL";

interface DecodedToken extends JwtPayload {
  userId: string;
  role?: string;
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.headers.authorization;
    console.log('🔐 [protect] Authorization header:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không xác thực được người dùng",
      });
    }

    // Remove Bearer prefix if exists
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as DecodedToken;
    
    console.log('🔐 [protect] Decoded token userId:', decoded.userId);

    // Fetch user from DB
    const user = await UserAccount.findByPk(decoded.userId);
    console.log('🔐 [protect] User from DB raw:', user);
    console.log('🔐 [protect] User from DB:', user ? `${user.email} (${user.role})` : 'NOT FOUND');
    console.log('🔐 [protect] User dataValues:', user?.dataValues);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ - user không tồn tại",
      });
    }

    // Attach user to request
    const userPayload = {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      is_verified: user.is_verified,
    };

    (req as any).user = userPayload;
    (req as any).isAuthenticated = true;
    console.log('🔐 [protect] User attached to req:', userPayload.email, userPayload.role);

    next();
  } catch (error: any) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Không xác thực được người dùng",
    });
  }
};

export default protect;
