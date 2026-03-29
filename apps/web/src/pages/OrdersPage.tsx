import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Dialog,
  TextField,
  CircularProgress,
  Alert,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import apiClient from '../lib/api';

interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  status: string;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
}

export const OrdersPage = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<Map<string, Order>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('1');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tablesRes, productsRes, ordersRes] = await Promise.all([
        apiClient.get('/tables'),
        apiClient.get('/products'),
        apiClient.get('/orders'),
      ]);
      setTables(tablesRes.data.data);
      setProducts(productsRes.data.data);
      
      // Group orders by table
      const ordersMap = new Map<string, Order>();
      if (ordersRes.data.data && Array.isArray(ordersRes.data.data)) {
        ordersRes.data.data.forEach((order: Order) => {
          ordersMap.set(order.tableId, order);
        });
      }
      setOrders(ordersMap);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableClick = (tableId: string) => {
    setSelectedTableId(tableId);
  };

  const handleAddToOrder = async () => {
    if (!selectedTableId || !selectedProductId) {
      setError('Lütfen ürün seçiniz');
      return;
    }

    try {
      await apiClient.post(`/orders/${selectedTableId}/items`, {
        productId: selectedProductId,
        quantity: parseInt(selectedQuantity),
      });
      setSelectedProductId('');
      setSelectedQuantity('1');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ürün eklenirken hata oluştu');
    }
  };

  const handleRemoveItem = async (orderId: string, itemId: string) => {
    try {
      await apiClient.delete(`/orders/${orderId}/items/${itemId}`);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ürün kaldırılırken hata oluştu');
    }
  };

  const handleCheckout = async (orderId: string) => {
    if (window.confirm('Masaı kapatıp ödeme işlemini tamamlamak istediğinize emin misiniz?')) {
      try {
        await apiClient.post(`/orders/${orderId}/checkout`, {});
        setSelectedTableId(null);
        await fetchData();
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Ödeme işlemi başarısız');
      }
    }
  };

  const currentOrder = selectedTableId ? orders.get(selectedTableId) : null;
  const selectedTable = tables.find(t => t.id === selectedTableId);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Masalar & Siparişler
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {/* Tables Grid */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">Masalar</Typography>
              </Box>
              <Grid container spacing={2}>
                {tables.map((table) => {
                  const tableOrder = orders.get(table.id);
                  const isSelected = table.id === selectedTableId;
                  return (
                    <Grid item xs={6} sm={4} key={table.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: isSelected ? '3px solid #1976d2' : '1px solid #e0e0e0',
                          backgroundColor: tableOrder ? '#fff3e0' : '#fafafa',
                          p: 2,
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 2,
                          },
                        }}
                        onClick={() => handleTableClick(table.id)}
                      >
                        <Typography variant="h5" sx={{ mb: 1 }}>
                          {table.tableNumber}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Kapasite: {table.capacity}
                        </Typography>
                        {tableOrder && (
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={`${tableOrder.items.length} ürün`}
                              size="small"
                              color="primary"
                            />
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>

            {/* Order Details */}
            <Grid item xs={12} md={6}>
              {selectedTable && currentOrder ? (
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Masa {selectedTable.tableNumber} - Sipariş
                      </Typography>
                      <IconButton size="small" onClick={() => setSelectedTableId(null)}>
                        <CloseIcon />
                      </IconButton>
                    </Box>

                    {/* Items List */}
                    <Box sx={{ mb: 3, maxHeight: 300, overflowY: 'auto' }}>
                      {currentOrder.items.length === 0 ? (
                        <Typography color="textSecondary">Henüz ürün eklenmedi</Typography>
                      ) : (
                        <List>
                          {currentOrder.items.map((item) => (
                            <ListItem
                              key={item.id}
                              secondaryAction={
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleRemoveItem(currentOrder.id, item.id)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              }
                            >
                              <ListItemText
                                primary={`${item.productName} x${item.quantity}`}
                                secondary={`₺${item.subtotal.toFixed(2)}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>

                    {/* Add Product Section */}
                    <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Ürün Ekle
                      </Typography>
                      <TextField
                        fullWidth
                        select
                        size="small"
                        label="Ürün"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        margin="normal"
                      >
                        {products.map((product) => (
                          <MenuItem key={product.id} value={product.id}>
                            {product.name} - ₺{product.price.toFixed(2)}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Miktar"
                        value={selectedQuantity}
                        onChange={(e) => setSelectedQuantity(e.target.value)}
                        margin="normal"
                        inputProps={{ min: 1 }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={handleAddToOrder}
                        sx={{ mt: 1 }}
                      >
                        Ekle
                      </Button>
                    </Box>

                    {/* Total and Checkout */}
                    <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1">Toplam:</Typography>
                        <Typography variant="h6" color="primary">
                          ₺{currentOrder.totalAmount.toFixed(2)}
                        </Typography>
                      </Box>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        onClick={() => handleCheckout(currentOrder.id)}
                        disabled={currentOrder.items.length === 0}
                      >
                        Ödemeyi Tamamla
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">
                      {selectedTableId
                        ? 'Bu masaya ait sipariş bulunmamaktadır'
                        : 'Sipariş yönetmek için bir masa seçiniz'}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};
