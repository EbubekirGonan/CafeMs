import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth';
import expenseService from '../services/expense.service';

// Local schema definitions
const EXPENSE_CATEGORIES = [
  'Hammadde',
  'Faturalar',
  'Kira',
  'Personel',
  'Ekipman',
  'Diğer',
] as const;

const expenseSchema = z.object({
  description: z.string().min(2, 'Açıklama en az 2 karakter olmalıdır'),
  quantity: z.coerce.number().positive('Miktar 0\'dan büyük olmalıdır').optional().nullable(),
  unit: z.string().optional().nullable(),
  unitPrice: z.coerce.number().positive('Birim fiyatı 0\'dan büyük olmalıdır').optional().nullable(),
  totalAmount: z.coerce.number().positive('Toplam tutar 0\'dan büyük olmalıdır'),
  category: z.enum(EXPENSE_CATEGORIES, { errorMap: () => ({ message: 'Geçerli bir kategori seçiniz' }) }),
  expenseDate: z.coerce.date().optional(),
});

const createExpenseSchema = expenseSchema;
const updateExpenseSchema = expenseSchema.partial();

/**
 * FR-10: Create new expense (Gider Kaydı Ekleme)
 */
export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createExpenseSchema.parse(req.body);
    const expense = await expenseService.createExpense(validatedData);

    return res.status(201).json({
      success: true,
      data: expense,
      message: 'Gider başarıyla kaydedildi',
    });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validasyon hatası',
          details: error.errors,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Gider kaydı başarısız',
      },
    });
  }
};

/**
 * FR-13: Get all expenses with optional filters
 * FR-11: Category filtering
 * FR-13: Date range filtering
 */
export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const { category, startDate, endDate } = req.query;

    let expenses;

    if (category && startDate && endDate) {
      // Filter by category and date range
      expenses = await expenseService.getExpensesByCategoryAndDateRange(
        category as string,
        new Date(startDate as string),
        new Date(endDate as string)
      );
    } else if (category) {
      // Filter by category only
      expenses = await expenseService.getExpensesByCategory(
        category as string
      );
    } else if (startDate && endDate) {
      // Filter by date range only
      expenses = await expenseService.getExpensesByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
    } else {
      // Get all expenses
      expenses = await expenseService.getAllExpenses();
    }

    return res.status(200).json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: error.message || 'Giderler alınamadı',
      },
    });
  }
};

/**
 * Get expense by ID
 */
export const getExpenseById = async (req: AuthRequest, res: Response) => {
  try {
    const { expenseId } = req.params;

    const expense = await expenseService.getExpenseById(expenseId);

    return res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: error.message || 'Gider bulunamadı',
      },
    });
  }
};

/**
 * FR-12: Update expense (Gider Düzenleme)
 */
export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { expenseId } = req.params;
    const validatedData = updateExpenseSchema.parse(req.body);

    const expense = await expenseService.updateExpense(expenseId, validatedData);

    return res.status(200).json({
      success: true,
      data: expense,
      message: 'Gider başarıyla güncellendi',
    });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validasyon hatası',
          details: error.errors,
        },
      });
    }

    if (error.message === 'Gider bulunamadı') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Gider güncellemesi başarısız',
      },
    });
  }
};

/**
 * FR-12: Delete expense (Gider Silme)
 */
export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { expenseId } = req.params;

    const expense = await expenseService.deleteExpense(expenseId);

    return res.status(200).json({
      success: true,
      data: expense,
      message: 'Gider başarıyla silindi',
    });
  } catch (error: any) {
    if (error.message === 'Gider bulunamadı') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Gider silme işlemi başarısız',
      },
    });
  }
};
