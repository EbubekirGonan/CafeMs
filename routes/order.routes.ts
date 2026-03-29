import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Tüm rotalar korumalı
router.use(authMiddleware);

// Order endpoints (FR-08, FR-09)
router.get('/:id', orderController.getOrder);
router.delete('/:orderId/items/:itemId', orderController.removeOrderItem);
router.post('/:id/checkout', orderController.checkoutOrder);

export default router;
