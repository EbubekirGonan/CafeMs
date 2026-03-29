import prisma from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export interface MonthlySummary {
  month: string;
  year: number;
  totalAmount: Decimal;
  count: number;
}

export interface CategoryBreakdown {
  category: string;
  totalAmount: Decimal;
  count: number;
}

export class ReportRepository {
  /**
   * FR-14: Get monthly revenue summary
   * Returns total revenue, transaction count, and daily average for a month
   */
  async getMonthlyRevenue(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const revenues = await prisma.revenueRecord.findMany({
      where: {
        revenueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalAmount = revenues.reduce(
      (sum, r) => sum.plus(r.amount),
      new Decimal(0)
    );

    const daysInMonth = endDate.getDate();
    const dailyAverage =
      revenues.length > 0 ? totalAmount.dividedBy(daysInMonth) : new Decimal(0);

    return {
      month,
      year,
      totalRevenue: totalAmount,
      transactionCount: revenues.length,
      dailyAverage: dailyAverage,
    };
  }

  /**
   * FR-15: Get monthly expense summary
   * Returns total expenses and count for a month
   */
  async getMonthlyExpenses(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await prisma.expense.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: {
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return {
      month,
      year,
      totalExpenses: result._sum.totalAmount || new Decimal(0),
      expenseCount: result._count,
    };
  }

  /**
   * FR-15: Get expense breakdown by category for a month
   */
  async getMonthlyExpensesByCategory(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const expenses = await prisma.expense.groupBy({
      by: ['category'],
      _sum: { totalAmount: true },
      _count: true,
      where: {
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return expenses.map(e => ({
      category: e.category,
      totalAmount: e._sum.totalAmount || new Decimal(0),
      count: e._count,
    }));
  }

  /**
   * FR-16: Calculate net profit/loss
   * Net = Revenue - Expenses
   */
  async calculateNetProfitLoss(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get total revenue
    const revenues = await prisma.revenueRecord.findMany({
      where: {
        revenueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    const totalRevenue = revenues.reduce(
      (sum, r) => sum.plus(r.amount),
      new Decimal(0)
    );

    // Get total expenses
    const expenseResult = await prisma.expense.aggregate({
      _sum: { totalAmount: true },
      where: {
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    const totalExpenses = expenseResult._sum.totalAmount || new Decimal(0);

    // Calculate net
    const netProfitLoss = totalRevenue.minus(totalExpenses);
    const isProfit = netProfitLoss.isPositive() || netProfitLoss.isZero();

    return {
      month,
      year,
      totalRevenue,
      totalExpenses,
      netProfitLoss,
      isProfit,
      profitMargin: totalRevenue.isZero()
        ? new Decimal(0)
        : netProfitLoss.dividedBy(totalRevenue).times(100),
    };
  }

  /**
   * FR-17: Get monthly comparison for last N months
   */
  async getMonthlyComparison(months: number = 6) {
    const today = new Date();
    const comparisons: any[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth() + 1;

      const revenue = await this.getMonthlyRevenue(year, month);
      const expenses = await this.getMonthlyExpenses(year, month);
      const netPL = await this.calculateNetProfitLoss(year, month);

      comparisons.push({
        month,
        year,
        monthName: monthDate.toLocaleDateString('tr-TR', {
          month: 'long',
          year: 'numeric',
        }),
        revenue: revenue.totalRevenue,
        expenses: expenses.totalExpenses,
        netProfitLoss: netPL.netProfitLoss,
        isProfit: netPL.isProfit,
      });
    }

    return comparisons;
  }

  /**
   * Get all months with data for the current year
   */
  async getAvailableMonths(year: number) {
    // Get months with revenue
    const revenueMonths = await prisma.revenueRecord.findMany({
      where: {
        revenueDate: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31),
        },
      },
      select: { revenueDate: true },
      distinct: ['revenueDate'],
    });

    // Get months with expenses
    const expenseMonths = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31),
        },
      },
      select: { expenseDate: true },
      distinct: ['expenseDate'],
    });

    const months = new Set<number>();

    revenueMonths.forEach(r => {
      months.add(r.revenueDate.getMonth() + 1);
    });

    expenseMonths.forEach(e => {
      months.add(e.expenseDate.getMonth() + 1);
    });

    return Array.from(months).sort((a, b) => a - b);
  }
}

export default new ReportRepository();
