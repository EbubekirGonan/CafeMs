import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Token bulunamadı' }
      });
    }

    const token = authHeader.substring(7); // "Bearer " kısmını çıkar
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as any;

    req.user = decoded;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Token süresi dolmuş' }
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Geçersiz token' }
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: 'Kimlik doğrulama hatası' }
    });
  }
};
