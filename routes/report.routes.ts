import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// All report routes require authentication
router.use(authMiddleware);

/**
 * FR-14: Get monthly revenue summary (Aylık Gelir Özeti)
 * GET /api/v1/reports/revenue?year=2026&month=3
 */
router.get('/revenue', reportController.getMonthlyRevenue);

/**
 * FR-15: Get monthly expense summary with categories (Aylık Gider Özeti)
 * GET /api/v1/reports/expenses?year=2026&month=3
 */
router.get('/expenses', reportController.getMonthlyExpenses);

/**
 * FR-16: Get net profit/loss (Net Kar/Zarar Gösterimi)
 * GET /api/v1/reports/net-profit?year=2026&month=3
 */
router.get('/net-profit', reportController.getNetProfit);

/**
 * FR-17: Get monthly comparison/trend analysis (Aylık Karşılaştırma)
 * GET /api/v1/reports/comparison?months=6
 */
router.get('/comparison', reportController.getMonthlyComparison);

/**
 * Get comprehensive report (all metrics for a month)
 * GET /api/v1/reports/comprehensive?year=2026&month=3
 */
router.get('/comprehensive', reportController.getComprehensiveReport);

/**
 * Get yearly overview with all available months
 * GET /api/v1/reports/year?year=2026
 */
router.get('/year', reportController.getYearlyOverview);

export default router;
