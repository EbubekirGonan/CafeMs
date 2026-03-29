import expenseRepository from '../repositories/expense.repository';
import { CreateExpenseInput, UpdateExpenseInput } from '@cafems/shared-schemas';

export class ExpenseService {
  /**
   * FR-10: Gider Kaydı Ekleme
   * Add new expense with validation
   */
  async createExpense(data: CreateExpenseInput) {
    if (data.totalAmount <= 0) {
      throw new Error('Toplam tutar 0\'dan büyük olmalıdır');
    }

    // If quantity and unit price are provided, calculate total amount
    if (
      data.quantity &&
      data.unitPrice &&
      data.quantity * data.unitPrice !== data.totalAmount
    ) {
      console.warn('Total amount does not match quantity × unit price');
    }

    return expenseRepository.create({
      description: data.description,
      quantity: data.quantity || null,
      unit: data.unit || null,
      unitPrice: data.unitPrice || null,
      totalAmount: data.totalAmount,
      category: data.category,
      expenseDate: data.expenseDate,
    });
  }

  /**
   * FR-12: Gider Düzenleme
   * Update existing expense
   */
  async updateExpense(expenseId: string, data: UpdateExpenseInput) {
    // Verify expense exists
    const expense = await expenseRepository.findById(expenseId);
    if (!expense) {
      throw new Error('Gider bulunamadı');
    }

    // Validate amount if provided
    if (data.totalAmount && data.totalAmount <= 0) {
      throw new Error('Toplam tutar 0\'dan büyük olmalıdır');
    }

    return expenseRepository.update(expenseId, {
      description: data.description,
      quantity: data.quantity !== undefined ? data.quantity : undefined,
      unit: data.unit !== undefined ? data.unit : undefined,
      unitPrice: data.unitPrice !== undefined ? data.unitPrice : undefined,
      totalAmount: data.totalAmount,
      category: data.category,
      expenseDate: data.expenseDate,
    });
  }

  /**
   * FR-12: Gider Silme
   * Delete expense (hard delete)
   */
  async deleteExpense(expenseId: string) {
    const expense = await expenseRepository.findById(expenseId);
    if (!expense) {
      throw new Error('Gider bulunamadı');
    }

    return expenseRepository.delete(expenseId);
  }

  /**
   * FR-13: Gider Listeleme ve Filtreleme
   * Get all expenses
   */
  async getAllExpenses() {
    return expenseRepository.findAll();
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(expenseId: string) {
    const expense = await expenseRepository.findById(expenseId);
    if (!expense) {
      throw new Error('Gider bulunamadı');
    }
    return expense;
  }

  /**
   * FR-11: Gider Kategorileri
   * FR-13: Filter by category
   */
  async getExpensesByCategory(category: string) {
    return expenseRepository.findByCategory(category);
  }

  /**
   * FR-13: Filter by date range
   */
  async getExpensesByDateRange(startDate: Date, endDate: Date) {
    if (startDate > endDate) {
      throw new Error('Başlangıç tarihi, bitiş tarihinden önce olmalıdır');
    }
    return expenseRepository.findByDateRange(startDate, endDate);
  }

  /**
   * FR-13: Filter by category and date range
   */
  async getExpensesByCategoryAndDateRange(
    category: string,
    startDate: Date,
    endDate: Date
  ) {
    if (startDate > endDate) {
      throw new Error('Başlangıç tarihi, bitiş tarihinden önce olmalıdır');
    }
    return expenseRepository.findByCategoryAndDateRange(
      category,
      startDate,
      endDate
    );
  }

  /**
   * Get total expenses for a date range
   * Used by reporting endpoints
   */
  async getTotalByDateRange(startDate: Date, endDate: Date) {
    if (startDate > endDate) {
      throw new Error('Başlangıç tarihi, bitiş tarihinden önce olmalıdır');
    }
    return expenseRepository.calculateTotalByDateRange(startDate, endDate);
  }

  /**
   * Get total expenses by category
   */
  async getTotalByCategory(category: string) {
    return expenseRepository.calculateTotalByCategory(category);
  }
}

export default new ExpenseService();
