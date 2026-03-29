import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { TableService } from '../services/table.service';

const service = new TableService();

/**
 * GET /api/v1/tables - Tüm masaları getir (FR-05)
 */
export const listTables = async (req: AuthRequest, res: Response) => {
  try {
    const tables = await service.getAllTables();

    res.json({
      success: true,
      data: tables,
      meta: { total: tables.length },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Masalar listelenirken bir hata oluştu' },
    });
  }
};

/**
 * GET /api/v1/tables/:id - Masa detaylarını getir
 */
export const getTable = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const table = await service.getTableDetail(id);

    res.json({
      success: true,
      data: table,
    });
  } catch (error: any) {
    if (error.message === 'TABLE_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'TABLE_NOT_FOUND', message: 'Masa bulunamadı' },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Masa alınırken bir hata oluştu' },
    });
  }
};

/**
 * GET /api/v1/tables/:id/order - Masanın aktif siparişini getir
 */
export const getTableActiveOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await service.getTableActiveOrder(id);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Sipariş alınırken bir hata oluştu' },
    });
  }
};
