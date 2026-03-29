import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Tüm product rotaları korumalı (authenticate gerekli)
router.use(authMiddleware);

// GET - Ürünleri listele
router.get('/', productController.listProducts);

// GET - Kategori listesini getir
router.get('/categories', productController.getCategories);

// POST - Yeni ürün oluştur
router.post('/', productController.createProduct);

// GET - Tek ürünü getir
router.get('/:id', productController.getProduct);

// PUT - Ürünü güncelle
router.put('/:id', productController.updateProduct);

// DELETE - Ürünü sil
router.delete('/:id', productController.deleteProduct);

export default router;
