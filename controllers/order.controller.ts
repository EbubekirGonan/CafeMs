import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { OrderService } from '../services/order.service';
import { orderItemSchema } from '@cafems/shared-schemas';

const service = new OrderService();

/**
 * POST /api/v1/tables/:tableId/order/create-with-items - Ürünlerle sipariş oluştur (batch)
 */
export const createOrderWithItems = async (req: AuthRequest, res: Response) => {
  try {
    const { tableId } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(422).json({
        success: false,
        error: { code: 'INVALID_ITEMS', message: 'Ürün listesi boş olamaz' },
      });
    }

    const result = await service.createOrderWithItems(tableId, items);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'TABLE_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'TABLE_NOT_FOUND', message: 'Masa bulunamadı' },
      });
    }

    if (error.message?.includes('PRODUCT_NOT_FOUND')) {
      return res.status(404).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Bir veya daha fazla ürün bulunamadı' },
      });
    }

    if (error.message === 'INVALID_QUANTITY') {
      return res.status(422).json({
        success: false,
        error: { code: 'INVALID_QUANTITY', message: 'Adet 0\'dan büyük olmalıdır' },
      });
    }

    console.error('Create order with items error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Sipariş oluşturulurken bir hata oluştu' },
    });
  }
};

/**
 * POST /api/v1/tables/:tableId/order/items - Masaya ürün ekle (FR-06)
 */
export const addOrderItem = async (req: AuthRequest, res: Response) => {
  try {
    const { tableId } = req.params;
    const input = orderItemSchema.parse(req.body);

    const item = await service.addItemToTable(tableId, input);

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    if (error.message === 'TABLE_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'TABLE_NOT_FOUND', message: 'Masa bulunamadı' },
      });
    }

    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Ürün bulunamadı' },
      });
    }

    if (error.message === 'INVALID_QUANTITY') {
      return res.status(422).json({
        success: false,
        error: { code: 'INVALID_QUANTITY', message: 'Adet 0\'dan büyük olmalıdır' },
      });
    }

    console.error('Add order item error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Ürün eklenirken bir hata oluştu' },
    });
  }
};

/**
 * DELETE /api/v1/orders/:orderId/items/:itemId - Siparişten ürün çıkar (FR-07)
 * Note: orderId is actually sessionId
 */
export const removeOrderItem = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, itemId } = req.params;
    // orderId is actually sessionId from frontend's perspective

    const item = await service.removeItemFromOrder(orderId, itemId);

    res.json({
      success: true,
      data: item,
      message: 'Ürün siparişten kaldırıldı',
    });
  } catch (error: any) {
    if (error.message === 'SESSION_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'Oturum bulunamadı' },
      });
    }

    if (error.message === 'ORDER_ITEM_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_ITEM_NOT_FOUND', message: 'Sipariş kalemi bulunamadı' },
      });
    }

    console.error('Remove order item error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Ürün silinirken bir hata oluştu' },
    });
  }
};

/**
 * GET /api/v1/orders/:id - Sipariş detaylarını getir (FR-08)
 */
export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await service.getOrderDetails(id);

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    if (error.message === 'SESSION_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'Oturum bulunamadı' },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Oturum alınırken bir hata oluştu' },
    });
  }
};

/**
 * POST /api/v1/orders/:id/checkout - Hesabı kapat (FR-09)
 * Note: :id is actually sessionId
 */
export const checkoutOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // sessionId

    const result = await service.checkoutOrder(id);

    res.json({
      success: true,
      data: result,
      message: 'Hesap başarıyla kapatıldı',
    });
  } catch (error: any) {
    if (error.message === 'SESSION_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'Oturum bulunamadı' },
      });
    }

    if (error.message === 'SESSION_NOT_OPEN') {
      return res.status(422).json({
        success: false,
        error: { code: 'SESSION_NOT_OPEN', message: 'Oturum zaten kapalı' },
      });
    }

    if (error.message === 'SESSION_EMPTY') {
      return res.status(422).json({
        success: false,
        error: { code: 'SESSION_EMPTY', message: 'Oturumda ürün yok' },
      });
    }

    console.error('Checkout order error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Hesap kapatılırken hata oluştu' },
    });
  }
};
