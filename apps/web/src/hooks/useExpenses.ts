import { useState, useEffect } from 'react';
import apiClient from '../lib/api';

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description?: string;
  createdAt: string;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/expenses');
      setExpenses(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (data: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      const response = await apiClient.post('/expenses', data);
      setExpenses([...expenses, response.data.data]);
      return response.data.data;
    } catch (err: any) {
      throw err;
    }
  };

  const updateExpense = async (id: string, data: Partial<Expense>) => {
    try {
      const response = await apiClient.put(`/expenses/${id}`, data);
      setExpenses(expenses.map(e => e.id === id ? response.data.data : e));
      return response.data.data;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await apiClient.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return { expenses, loading, error, createExpense, updateExpense, deleteExpense, fetchExpenses };
};
