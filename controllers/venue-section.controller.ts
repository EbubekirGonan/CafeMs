import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getVenueSections = async (req: Request, res: Response) => {
  try {
    const sections = await prisma.venueSection.findMany({
      include: {
        tables: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error('Error fetching venue sections:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Mekan bölümleri alınırken hata oluştu',
      },
    });
  }
};

export const createVenueSection = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Mekan bölümü adı zorunludur',
        },
      });
    }

    const section = await prisma.venueSection.create({
      data: {
        name,
      },
    });

    res.status(201).json({
      success: true,
      data: section,
    });
  } catch (error: any) {
    console.error('Error creating venue section:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Bu adda bir mekan bölümü zaten mevcut',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Mekan bölümü oluşturulurken hata oluştu',
      },
    });
  }
};

export const updateVenueSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Mekan bölümü adı zorunludur',
        },
      });
    }

    const section = await prisma.venueSection.update({
      where: { id },
      data: { name },
    });

    res.json({
      success: true,
      data: section,
    });
  } catch (error: any) {
    console.error('Error updating venue section:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Mekan bölümü bulunamadı',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Mekan bölümü güncellenirken hata oluştu',
      },
    });
  }
};

export const deleteVenueSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.venueSection.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Mekan bölümü silindi',
    });
  } catch (error: any) {
    console.error('Error deleting venue section:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Mekan bölümü bulunamadı',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Mekan bölümü silinirken hata oluştu',
      },
    });
  }
};
