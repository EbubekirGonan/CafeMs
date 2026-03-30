import { useState, useEffect } from 'react';
import apiClient from '../lib/api';

export interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  isActive: boolean;
  createdAt: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const response = await apiClient.post('/products', data);
      setProducts([...products, response.data.data]);
      return response.data.data;
    } catch (err: any) {
      throw err;
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      const response = await apiClient.put(`/products/${id}`, data);
      setProducts(products.map(p => p.id === id ? response.data.data : p));
      return response.data.data;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await apiClient.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, createProduct, updateProduct, deleteProduct, fetchProducts };
}
