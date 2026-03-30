import { useState, useEffect } from 'react';
import apiClient from '../lib/api';

export interface MonthlyReport {
  month: number;
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  tableCount: number;
}

export function useReports() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthlyReport = async (month?: number, year?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      const response = await apiClient.get(`/reports/monthly?${params.toString()}`);
      setReport(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyReport();
  }, []);

  return { report, loading, error, fetchMonthlyReport };
}
