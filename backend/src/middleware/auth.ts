import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const authenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (process.env.BYPASS_AUTH === "true") {
    req.user = {
      id: "dev-user",
      email: "dev@example.com",
      role: "dev",
    };
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      res.status(401).json({ success: false, error: "Access token required" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(403).json({ success: false, error: "Invalid or expired token" });
  }
};

export const requireRole = (rolesAllowed: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    if (!rolesAllowed.includes(req.user.role)) {
      res.status(403).json({ success: false, error: "Insufficient permissions" });
      return;
    }

    next();
  };
};
