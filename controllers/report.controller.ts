import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import reportService from '../services/report.service';

/**
 * FR-14: Get monthly revenue summary
 * GET /api/v1/reports/revenue?year=2026&month=3
 */
export const getMonthlyRevenue = async (req: AuthRequest, res: Response) => {
  try {
    const { year, month } = req.query;

    const revenue = await reportService.getMonthlyRevenueSummary(
      year ? parseInt(year as string) : undefined,
      month ? parseInt(month as string) : undefined
    );

    return res.status(200).json({
      success: true,
      data: revenue,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: error.message || 'Gelir özeti alınamadı',
      },
    });
  }
};

/**
 * FR-15: Get monthly expense summary with category breakdown
 * GET /api/v1/reports/expenses?year=2026&month=3
 */
export const getMonthlyExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const { year, month } = req.query;

    const expenses = await reportService.getMonthlExpenseSummary(
      year ? parseInt(year as string) : undefined,
      month ? parseInt(month as string) : undefined
    );

    return res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: error.message || 'Gider özeti alınamadı',
      },
    });
  }
};

/**
 * FR-16: Get net profit/loss summary
 * GET /api/v1/reports/net-profit?year=2026&month=3
 */
export const getNetProfit = async (req: AuthRequest, res: Response) => {
  try {
    const { year, month } = req.query;

    const netPL = await reportService.getNetProfitLoss(
      year ? parseInt(year as string) : undefined,
      month ? parseInt(month as string) : undefined
    );

    return res.status(200).json({
      success: true,
      data: netPL,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: error.message || 'Kar/zarar özeti alınamadı',
      },
    });
  }
};

/**
 * FR-17: Get monthly comparison (trend analysis)
 * GET /api/v1/reports/comparison?months=6
 */
export const getMonthlyComparison = async (req: AuthRequest, res: Response) => {
  try {
    const { months } = req.query;
    const monthCount = months ? parseInt(months as string) : 6;

    const comparison = await reportService.getMonthlyComparison(monthCount);

    return res.status(200).json({
      success: true,
      data: comparison,
      monthsIncluded: monthCount,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: error.message || 'Aylık karşılaştırma alınamadı',
      },
    });
  }
};

/**
 * Combined comprehensive report for a month
 * GET /api/v1/reports/comprehensive?year=2026&month=3
 */
export const getComprehensiveReport = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { year, month } = req.query;

    const report = await reportService.getComprehensiveReport(
      year ? parseInt(year as string) : undefined,
      month ? parseInt(month as string) : undefined
    );

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: error.message || 'Kapsamlı rapor alınamadı',
      },
    });
  }
};

/**
 * Get full year overview with all available months
 * GET /api/v1/reports/year?year=2026
 */
export const getYearlyOverview = async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query;

    const overview = await reportService.getYearlyOverview(
      year ? parseInt(year as string) : undefined
    );

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: error.message || 'Yıllık özet alınamadı',
      },
    });
  }
};
