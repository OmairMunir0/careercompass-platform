import "express";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }

    interface UserPayload {
      id: string;
      email: string;
      role: string;
    }
  }
}
