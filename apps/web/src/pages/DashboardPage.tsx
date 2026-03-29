import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Receipt,
} from '@mui/icons-material';
import apiClient from '../lib/api';

interface DashboardMetrics {
  currentMonthRevenue: number;
  currentMonthExpenses: number;
  netProfit: number;
  isProfit: boolean;
  tableCount: number;
  productCount: number;
}

export const DashboardPage = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const [revenueRes, expensesRes, productsRes, tablesRes] =
          await Promise.all([
            apiClient.get(`/reports/revenue?year=${currentYear}&month=${currentMonth}`),
            apiClient.get(`/reports/expenses?year=${currentYear}&month=${currentMonth}`),
            apiClient.get('/products'),
            apiClient.get('/tables'),
          ]);

        const revenue = parseFloat(revenueRes.data.data.totalRevenue);
        const expenses = parseFloat(expensesRes.data.data.totalExpenses);
        const netProfit = revenue - expenses;

        setMetrics({
          currentMonthRevenue: revenue,
          currentMonthExpenses: expenses,
          netProfit: netProfit,
          isProfit: netProfit >= 0,
          productCount: productsRes.data.data.length,
          tableCount: tablesRes.data.data.length,
        });
      } catch (err: any) {
        setError(err.message || 'Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Revenue Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Aylık Gelir
                  </Typography>
                </Box>
                <Typography variant="h5">
                  ₺{metrics?.currentMonthRevenue.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Expenses Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Receipt color="error" sx={{ mr: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Aylık Giderler
                  </Typography>
                </Box>
                <Typography variant="h5">
                  ₺{metrics?.currentMonthExpenses.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Net Profit Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                backgroundColor: metrics?.isProfit ? '#e8f5e9' : '#ffebee',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {metrics?.isProfit ? (
                    <TrendingUp color="success" sx={{ mr: 1 }} />
                  ) : (
                    <TrendingDown color="error" sx={{ mr: 1 }} />
                  )}
                  <Typography color="textSecondary" gutterBottom>
                    Net Kar/Zarar
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: metrics?.isProfit ? '#2e7d32' : '#c62828',
                  }}
                >
                  ₺{metrics?.netProfit.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Products Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ShoppingCart color="primary" sx={{ mr: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Ürünler
                  </Typography>
                </Box>
                <Typography variant="h5">
                  {metrics?.productCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
