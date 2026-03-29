import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// All expense routes require authentication
router.use(authMiddleware);

/**
 * FR-10: Create expense (Gider Kaydı Ekleme)
 */
router.post('/', expenseController.createExpense);

/**
 * FR-13: Get expenses with optional filters
 * FR-11: Category filtering
 * FR-13: Date range filtering
 * Query params: ?category=Hammadde&startDate=2026-01-01&endDate=2026-01-31
 */
router.get('/', expenseController.getExpenses);

/**
 * Get expense by ID
 */
router.get('/:expenseId', expenseController.getExpenseById);

/**
 * FR-12: Update expense (Gider Düzenleme)
 */
router.put('/:expenseId', expenseController.updateExpense);

/**
 * FR-12: Delete expense (Gider Silme)
 */
router.delete('/:expenseId', expenseController.deleteExpense);

export default router;
