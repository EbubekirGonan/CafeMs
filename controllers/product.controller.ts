import { Response } from 'express';
import { productSchema, updateProductSchema } from '@cafems/shared-schemas';
import { ProductService } from '../services/product.service';
import { AuthRequest } from '../middlewares/auth';

const service = new ProductService();

/**
 * GET /api/v1/products - Tüm ürünleri listele (FR-04)
 */
export const listProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.query;
    const products = await service.getAllProducts(category as string | undefined);

    res.json({
      success: true,
      data: products,
      meta: { total: products.length },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Ürünler listelenirken bir hata oluştu' },
    });
  }
};

/**
 * POST /api/v1/products - Yeni ürün oluştur (FR-01)
 */
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const input = productSchema.parse(req.body);
    const product = await service.createProduct(input);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    if (error.message === 'PRODUCT_NAME_DUPLICATE') {
      return res.status(409).json({
        success: false,
        error: { code: 'PRODUCT_NAME_DUPLICATE', message: 'Bu isimde bir ürün zaten var' },
      });
    }

    if (error.message === 'INVALID_PRICE') {
      return res.status(422).json({
        success: false,
        error: { code: 'INVALID_PRICE', message: 'Fiyat 0\'dan büyük olmalıdır' },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Ürün oluşturulurken bir hata oluştu' },
    });
  }
};

/**
 * GET /api/v1/products/:id - Tek ürünü getir
 */
export const getProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await service.getProductById(id);

    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Ürün bulunamadı' },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Ürün alınırken bir hata oluştu' },
    });
  }
};

/**
 * PUT /api/v1/products/:id - Ürünü güncelle (FR-02)
 */
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const input = updateProductSchema.parse(req.body);
    const product = await service.updateProduct(id, input);

    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Ürün bulunamadı' },
      });
    }

    if (error.message === 'PRODUCT_NAME_DUPLICATE') {
      return res.status(409).json({
        success: false,
        error: { code: 'PRODUCT_NAME_DUPLICATE', message: 'Bu isimde bir ürün zaten var' },
      });
    }

    if (error.message === 'INVALID_PRICE') {
      return res.status(422).json({
        success: false,
        error: { code: 'INVALID_PRICE', message: 'Fiyat 0\'dan büyük olmalıdır' },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Ürün güncellenirken bir hata oluştu' },
    });
  }
};

/**
 * DELETE /api/v1/products/:id - Ürünü sil (FR-03)
 */
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await service.deleteProduct(id);

    res.json({
      success: true,
      message: 'Ürün başarıyla silindi',
    });
  } catch (error: any) {
    console.error('Delete product error:', error);

    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Ürün bulunamadı' },
      });
    }

    if (error.message === 'PRODUCT_HAS_ACTIVE_ORDERS') {
      return res.status(422).json({
        success: false,
        error: {
          code: 'PRODUCT_HAS_ACTIVE_ORDERS',
          message: 'Aktif siparişte olan ürünler silinemez',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Ürün silinirken bir hata oluştu' },
    });
  }
};

/**
 * GET /api/v1/products/categories - Kategori listesini getir
 */
export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await service.getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Kategoriler alınırken bir hata oluştu' },
    });
  }
};
