import { useState, useEffect } from 'react';
import apiClient from '../lib/api';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  status: 'available' | 'occupied';
  currentOrderId?: string;
  totalAmount?: number;
  items?: OrderItem[];
  createdAt: string;
}

export function useOrders() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/tables');
      setTables(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTable = async (data: Omit<Table, 'id' | 'createdAt'>) => {
    try {
      const response = await apiClient.post('/tables', data);
      setTables([...tables, response.data.data]);
      return response.data.data;
    } catch (err: any) {
      throw err;
    }
  };

  const addItemToOrder = async (tableId: string, productId: string, quantity: number) => {
    try {
      const response = await apiClient.post(`/tables/${tableId}/order/items`, {
        productId,
        quantity,
      });
      return response.data.data;
    } catch (err: any) {
      throw err;
    }
  };

  const removeItemFromOrder = async (tableId: string, itemId: string) => {
    try {
      await apiClient.delete(`/tables/${tableId}/order/items/${itemId}`);
    } catch (err: any) {
      throw err;
    }
  };

  const checkoutTable = async (tableId: string) => {
    try {
      const response = await apiClient.post(`/tables/${tableId}/order/checkout`);
      await fetchTables();
      return response.data.data;
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return {
    tables,
    loading,
    error,
    createTable,
    addItemToOrder,
    removeItemFromOrder,
    checkoutTable,
    fetchTables,
  };
}
