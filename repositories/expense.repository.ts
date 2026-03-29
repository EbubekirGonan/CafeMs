import prisma from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateExpenseData {
  description: string;
  quantity?: number | null;
  unit?: string | null;
  unitPrice?: number | null;
  totalAmount: number;
  category: string;
  expenseDate?: Date;
}

export interface UpdateExpenseData {
  description?: string;
  quantity?: number | null;
  unit?: string | null;
  unitPrice?: number | null;
  totalAmount?: number;
  category?: string;
  expenseDate?: Date;
}

export class ExpenseRepository {
  /**
   * Get all expenses
   */
  async findAll() {
    return prisma.expense.findMany({
      orderBy: { expenseDate: 'desc' },
    });
  }

  /**
   * Get expense by ID
   */
  async findById(expenseId: string) {
    return prisma.expense.findUnique({
      where: { id: expenseId },
    });
  }

  /**
   * Create new expense
   */
  async create(data: CreateExpenseData) {
    return prisma.expense.create({
      data: {
        description: data.description,
        quantity: data.quantity ? new Decimal(data.quantity) : null,
        unit: data.unit,
        unitPrice: data.unitPrice ? new Decimal(data.unitPrice) : null,
        totalAmount: new Decimal(data.totalAmount),
        category: data.category,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
      },
    });
  }

  /**
   * Update expense
   */
  async update(expenseId: string, data: UpdateExpenseData) {
    const updateData: any = {};

    if (data.description !== undefined) updateData.description = data.description;
    if (data.quantity !== undefined)
      updateData.quantity = data.quantity ? new Decimal(data.quantity) : null;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.unitPrice !== undefined)
      updateData.unitPrice = data.unitPrice ? new Decimal(data.unitPrice) : null;
    if (data.totalAmount !== undefined)
      updateData.totalAmount = new Decimal(data.totalAmount);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.expenseDate !== undefined)
      updateData.expenseDate = new Date(data.expenseDate);

    return prisma.expense.update({
      where: { id: expenseId },
      data: updateData,
    });
  }

  /**
   * Delete expense
   */
  async delete(expenseId: string) {
    return prisma.expense.delete({
      where: { id: expenseId },
    });
  }

  /**
   * Get expenses by date range (FR-13)
   */
  async findByDateRange(startDate: Date, endDate: Date) {
    return prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { expenseDate: 'desc' },
    });
  }

  /**
   * Get expenses by category (FR-13 - category filter)
   */
  async findByCategory(category: string) {
    return prisma.expense.findMany({
      where: { category },
      orderBy: { expenseDate: 'desc' },
    });
  }

  /**
   * Get expenses by category and date range
   */
  async findByCategoryAndDateRange(
    category: string,
    startDate: Date,
    endDate: Date
  ) {
    return prisma.expense.findMany({
      where: {
        category,
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { expenseDate: 'desc' },
    });
  }

  /**
   * Calculate total expenses for a date range
   */
  async calculateTotalByDateRange(startDate: Date, endDate: Date) {
    const result = await prisma.expense.aggregate({
      _sum: { totalAmount: true },
      where: {
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    return result._sum.totalAmount || new Decimal(0);
  }

  /**
   * Calculate total expenses by category
   */
  async calculateTotalByCategory(category: string) {
    const result = await prisma.expense.aggregate({
      _sum: { totalAmount: true },
      where: { category },
    });
    return result._sum.totalAmount || new Decimal(0);
  }
}

export default new ExpenseRepository();
