import { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { useReports } from '../hooks/useReports';

export const ReportsPage = () => {
  const { report, loading, error, fetchMonthlyReport } = useReports();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleFetch = () => {
    fetchMonthlyReport(month, year);
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <h1>Financial Reports</h1>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Month"
            type="number"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            inputProps={{ min: 1, max: 12 }}
            sx={{ width: 120 }}
          />
          <TextField
            label="Year"
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            sx={{ width: 120 }}
          />
          <Button variant="contained" onClick={handleFetch}>
            Get Report
          </Button>
        </Box>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : report ? (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#4caf50', color: 'white' }}>
              <CardContent>
                <Typography color="inherit" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5">${report.totalRevenue.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#f44336', color: 'white' }}>
              <CardContent>
                <Typography color="inherit" gutterBottom>
                  Total Expenses
                </Typography>
                <Typography variant="h5">${report.totalExpenses.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#2196f3', color: 'white' }}>
              <CardContent>
                <Typography color="inherit" gutterBottom>
                  Net Profit
                </Typography>
                <Typography variant="h5">${report.netProfit.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#ff9800', color: 'white' }}>
              <CardContent>
                <Typography color="inherit" gutterBottom>
                  Tables
                </Typography>
                <Typography variant="h5">{report.tableCount}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Summary for {monthNames[month - 1]} {year}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 2 }}>
                <Typography fontWeight="bold">Revenue:</Typography>
                <Typography>${report.totalRevenue.toFixed(2)}</Typography>
                <Typography fontWeight="bold">Expenses:</Typography>
                <Typography>${report.totalExpenses.toFixed(2)}</Typography>
                <Typography fontWeight="bold">Profit Margin:</Typography>
                <Typography>
                  {report.totalRevenue > 0
                    ? ((report.netProfit / report.totalRevenue) * 100).toFixed(2)
                    : 0}
                  %
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info">Select a month and year to view report</Alert>
      )}
    </Container>
  );
};
