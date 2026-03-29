import reportRepository from '../repositories/report.repository';

export class ReportService {
  /**
   * FR-14: Get monthly revenue summary
   */
  async getMonthlyRevenueSummary(year?: number, month?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    if (targetMonth < 1 || targetMonth > 12) {
      throw new Error('Ay 1-12 arasında olmalıdır');
    }

    return reportRepository.getMonthlyRevenue(targetYear, targetMonth);
  }

  /**
   * FR-15: Get monthly expense summary with category breakdown
   */
  async getMonthlExpenseSummary(year?: number, month?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    if (targetMonth < 1 || targetMonth > 12) {
      throw new Error('Ay 1-12 arasında olmalıdır');
    }

    const summary = await reportRepository.getMonthlyExpenses(
      targetYear,
      targetMonth
    );
    const breakdown = await reportRepository.getMonthlyExpensesByCategory(
      targetYear,
      targetMonth
    );

    return {
      ...summary,
      categoryBreakdown: breakdown,
    };
  }

  /**
   * FR-16: Get net profit/loss for a month
   */
  async getNetProfitLoss(year?: number, month?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    if (targetMonth < 1 || targetMonth > 12) {
      throw new Error('Ay 1-12 arasında olmalıdır');
    }

    return reportRepository.calculateNetProfitLoss(targetYear, targetMonth);
  }

  /**
   * FR-17: Get monthly comparison (trend analysis)
   * Returns last N months for trend analysis
   */
  async getMonthlyComparison(months: number = 6) {
    if (months < 1 || months > 12) {
      throw new Error('Ay sayısı 1-12 arasında olmalıdır');
    }

    return reportRepository.getMonthlyComparison(months);
  }

  /**
   * Combined report: All metrics for a given month
   */
  async getComprehensiveReport(year?: number, month?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    if (targetMonth < 1 || targetMonth > 12) {
      throw new Error('Ay 1-12 arasında olmalıdır');
    }

    const [revenue, expenses, netPL] = await Promise.all([
      reportRepository.getMonthlyRevenue(targetYear, targetMonth),
      reportRepository.getMonthlyExpenses(targetYear, targetMonth),
      reportRepository.calculateNetProfitLoss(targetYear, targetMonth),
    ]);

    const categoryBreakdown =
      await reportRepository.getMonthlyExpensesByCategory(
        targetYear,
        targetMonth
      );

    return {
      period: {
        month: targetMonth,
        year: targetYear,
        monthName: new Date(targetYear, targetMonth - 1).toLocaleDateString(
          'tr-TR',
          { month: 'long', year: 'numeric' }
        ),
      },
      revenue: {
        total: revenue.totalRevenue,
        transactionCount: revenue.transactionCount,
        dailyAverage: revenue.dailyAverage,
      },
      expenses: {
        total: expenses.totalExpenses,
        expenseCount: expenses.expenseCount,
        categoryBreakdown: categoryBreakdown,
      },
      profitLoss: {
        netAmount: netPL.netProfitLoss,
        isProfit: netPL.isProfit,
        profitMargin: netPL.profitMargin,
      },
    };
  }

  /**
   * Get year overview with all months
   */
  async getYearlyOverview(year?: number) {
    const targetYear = year || new Date().getFullYear();
    const months = await reportRepository.getAvailableMonths(targetYear);

    const monthlyData = await Promise.all(
      months.map(month =>
        this.getComprehensiveReport(targetYear, month)
      )
    );

    return {
      year: targetYear,
      monthsWithData: months,
      monthlyReports: monthlyData,
    };
  }
}

export default new ReportService();
