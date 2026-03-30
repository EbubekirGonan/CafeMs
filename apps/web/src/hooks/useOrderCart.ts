import { useState, useCallback } from 'react';
import apiClient from '../lib/api';

export interface CartItem {
  productId: string;
  productName?: string;
  quantity: number;
  price?: number;
}

export interface CartState {
  tableId: string;
  items: CartItem[];
  totalAmount: number;
}

export function useOrderCart(tableId: string) {
  const [cart, setCart] = useState<CartState>({
    tableId,
    items: [],
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ürün ekle
  const addItem = useCallback((productId: string, quantity: number, productName?: string, price?: number) => {
    setCart((prev) => {
      const existingItem = prev.items.find((item) => item.productId === productId);

      let newItems: CartItem[];
      if (existingItem) {
        // Miktar arttır
        newItems = prev.items.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        // Yeni ürün ekle
        newItems = [...prev.items, { productId, quantity, productName, price }];
      }

      const totalAmount = newItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

      return {
        ...prev,
        items: newItems,
        totalAmount,
      };
    });
  }, []);

  // Ürün kaldır
  const removeItem = useCallback((productId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((item) => item.productId !== productId);
      const totalAmount = newItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

      return {
        ...prev,
        items: newItems,
        totalAmount,
      };
    });
  }, []);

  // Miktar güncelle
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setCart((prev) => {
      const newItems = prev.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      const totalAmount = newItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

      return {
        ...prev,
        items: newItems,
        totalAmount,
      };
    });
  }, [removeItem]);

  // Sepeti temizle
  const clearCart = useCallback(() => {
    setCart({
      tableId,
      items: [],
      totalAmount: 0,
    });
  }, [tableId]);

  // Siparişi gönder (DB'ye yaz)
  const submitOrder = useCallback(async () => {
    if (cart.items.length === 0) {
      setError('Sepet boş, ürün ekleyin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/tables/${tableId}/order/create-with-items`, {
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      clearCart();
      return response.data.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Siparişi gönderirken hata oluştu';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart.items, tableId, clearCart]);

  return {
    cart,
    loading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    submitOrder,
  };
}
