import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import apiClient from '../lib/api';

interface RevenueReport {
  totalRevenue: number;
  transactionCount: number;
  dailyAverage: number;
}

interface ExpenseReport {
  totalExpenses: number;
  expenseCount: number;
  byCategory: Record<string, number>;
}

interface ProfitReport {
  netProfit: number;
  isProfit: boolean;
}

interface TrendData {
  month: number;
  year: number;
  revenue: number;
  expenses: number;
}

export const ReportsPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [expenseReport, setExpenseReport] = useState<ExpenseReport | null>(null);
  const [profitReport, setProfitReport] = useState<ProfitReport | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [yearlyReport, setYearlyReport] = useState<any>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [revenue, expenses, profit, trend, yearly] = await Promise.all([
        apiClient.get(`/reports/revenue?year=${year}&month=${month}`),
        apiClient.get(`/reports/expenses?year=${year}&month=${month}`),
        apiClient.get(`/reports/profit?year=${year}&month=${month}`),
        apiClient.get(`/reports/trend?months=6`),
        apiClient.get(`/reports/yearly?year=${year}`),
      ]);

      setRevenueReport(revenue.data.data);
      setExpenseReport(expenses.data.data);
      setProfitReport(profit.data.data);
      setTrendData(trend.data.data || []);
      setYearlyReport(yearly.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Raporlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [year, month]);

  const months = [
    { value: 1, label: 'Ocak' },
    { value: 2, label: 'Şubat' },
    { value: 3, label: 'Mart' },
    { value: 4, label: 'Nisan' },
    { value: 5, label: 'Mayıs' },
    { value: 6, label: 'Haziran' },
    { value: 7, label: 'Temmuz' },
    { value: 8, label: 'Ağustos' },
    { value: 9, label: 'Eylül' },
    { value: 10, label: 'Ekim' },
    { value: 11, label: 'Kasım' },
    { value: 12, label: 'Aralık' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">Mali Raporlar</Typography>
        </Box>

        {/* Date Filters */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Yıl"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                size="small"
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Ay"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                size="small"
              >
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Main Metrics */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {/* Revenue Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Aylık Gelir
                        </Typography>
                        <Typography variant="h5" sx={{ mb: 1 }}>
                          ₺{revenueReport?.totalRevenue.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {revenueReport?.transactionCount} işlem
                        </Typography>
                      </Box>
                      <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Expenses Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Aylık Gider
                        </Typography>
                        <Typography variant="h5" sx={{ mb: 1 }}>
                          ₺{expenseReport?.totalExpenses.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {expenseReport?.expenseCount} gider
                        </Typography>
                      </Box>
                      <ReceiptIcon sx={{ color: '#ff9800', fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Net Profit Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Net Kar/Zarar
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            mb: 1,
                            color: profitReport?.isProfit ? '#4caf50' : '#f44336',
                          }}
                        >
                          ₺{profitReport?.netProfit.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {profitReport?.isProfit ? 'Kârlı' : 'Zararlı'}
                        </Typography>
                      </Box>
                      {profitReport?.isProfit ? (
                        <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 40 }} />
                      ) : (
                        <TrendingDownIcon sx={{ color: '#f44336', fontSize: 40 }} />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Profit Margin */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Kar Marjı
                        </Typography>
                        <Typography variant="h5" sx={{ mb: 1 }}>
                          {revenueReport && revenueReport.totalRevenue > 0
                            ? (((revenueReport.totalRevenue - (expenseReport?.totalExpenses || 0)) / revenueReport.totalRevenue) * 100).toFixed(1)
                            : '0'}
                          %
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Yüzde oran
                        </Typography>
                      </Box>
                      <BarChartIcon sx={{ color: '#2196f3', fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Expense Breakdown */}
            {expenseReport?.byCategory && Object.keys(expenseReport.byCategory).length > 0 && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Gider Dağılımı (Kategori Bazında)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>Kategori</TableCell>
                          <TableCell align="right">Tutar</TableCell>
                          <TableCell align="right">Yüzde</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(expenseReport.byCategory).map(([category, amount]: [string, any]) => (
                          <TableRow key={category}>
                            <TableCell>{category}</TableCell>
                            <TableCell align="right">₺{amount.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              {expenseReport.totalExpenses > 0
                                ? ((amount / expenseReport.totalExpenses) * 100).toFixed(1)
                                : '0'}
                              %
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}

            {/* Trend Analysis */}
            {trendData.length > 0 && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Son 6 Ay Trend Analizi
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>Dönem</TableCell>
                          <TableCell align="right">Gelir</TableCell>
                          <TableCell align="right">Gider</TableCell>
                          <TableCell align="right">Net Kar</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trendData.map((trend, idx) => {
                          const netProfit = trend.revenue - trend.expenses;
                          return (
                            <TableRow key={idx}>
                              <TableCell>{months[trend.month - 1]?.label} {trend.year}</TableCell>
                              <TableCell align="right">₺{trend.revenue.toFixed(2)}</TableCell>
                              <TableCell align="right">₺{trend.expenses.toFixed(2)}</TableCell>
                              <TableCell align="right" sx={{ color: netProfit >= 0 ? '#4caf50' : '#f44336' }}>
                                ₺{netProfit.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}

            {/* Yearly Summary */}
            {yearlyReport && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {year} Yılı Özeti
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography color="textSecondary" variant="caption">
                          Toplam Yıllık Gelir
                        </Typography>
                        <Typography variant="h6">
                          ₺{yearlyReport.totalRevenue?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography color="textSecondary" variant="caption">
                          Toplam Yıllık Gider
                        </Typography>
                        <Typography variant="h6">
                          ₺{yearlyReport.totalExpenses?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                        }}
                      >
                        <Typography color="textSecondary" variant="caption">
                          Yıllık Net Kar
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            color: (yearlyReport.totalRevenue || 0) - (yearlyReport.totalExpenses || 0) >= 0
                              ? '#4caf50'
                              : '#f44336',
                          }}
                        >
                          ₺{((yearlyReport.totalRevenue || 0) - (yearlyReport.totalExpenses || 0)).toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography color="textSecondary" variant="caption">
                          Aylık Ortalama Gelir
                        </Typography>
                        <Typography variant="h6">
                          ₺{((yearlyReport.totalRevenue || 0) / 12).toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};
