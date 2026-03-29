import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { LoginInput } from '@cafems/shared-schemas';
import { generateTokens, verifyRefreshToken } from '../lib/tokenHelper';
import { AuthRequest } from '../middlewares/auth';

export const login = async (req: any, res: Response) => {
  const { email, password } = req.body as LoginInput;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'E-posta veya şifre hatalı' }
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'E-posta veya şifre hatalı' }
      });
    }

    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
    });

    const { passwordHash, ...userWithoutPassword } = user;
    
    // Refresh token'ı HTTP-only cookie'de gönder
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    res.json({
      success: true,
      data: {
        accessToken,
        user: userWithoutPassword
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Bir hata oluştu' }
    });
  }
};

export const logout = (req: AuthRequest, res: Response) => {
  try {
    // Refresh token cookie'sini sil
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Çıkış yapıldı'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Bir hata oluştu' }
    });
  }
};

export const refresh = (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Refresh token bulunamadı' }
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Geçersiz refresh token' }
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: decoded.userId,
      email: decoded.email,
    });

    // Yeni refresh token'ı cookie'ye yazla
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Bir hata oluştu' }
    });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Kullanıcı bilgisi bulunamadı' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Kullanıcı bulunamadı' }
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Bir hata oluştu' }
    });
  }
};
