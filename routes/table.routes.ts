import { Router } from 'express';
import * as tableController from '../controllers/table.controller';
import * as orderController from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Tüm rotalar korumalı
router.use(authMiddleware);

// Table endpoints (FR-05)
router.get('/', tableController.listTables);
router.get('/:id', tableController.getTable);
router.get('/:id/order', tableController.getTableActiveOrder);

// Order item endpoints (FR-06, FR-07)
router.post('/:tableId/order/create-with-items', orderController.createOrderWithItems);
router.post('/:tableId/order/items', orderController.addOrderItem);
router.delete('/:tableId/order/items/:itemId', orderController.removeOrderItem);
router.post('/:tableId/order/checkout', orderController.checkoutOrder);

export default router;
