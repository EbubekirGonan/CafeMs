import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  MenuItem,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/api';

interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  status: string;
  venueSectionId?: string;
}

interface OrderItem {
  id: string;
  productId?: string;
  product?: { name: string };
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
}

interface VenueSection {
  id: string;
  name: string;
  tables: Table[];
}

type NavigationLevel = 'sections' | 'tables';

export const OrdersPage = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [venueSections, setVenueSections] = useState<VenueSection[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<Map<string, Order>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('1');
  const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false);
  const [checkoutOrderId, setCheckoutOrderId] = useState<string | null>(null);
  
  // Navigation state for sidebar menu levels
  const [navLevel, setNavLevel] = useState<NavigationLevel>('sections');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const SIDEBAR_WIDTH = 300;

  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setNavLevel('tables');
    setSelectedTableId(null);
  };

  const handleBackToSections = () => {
    setNavLevel('sections');
    setSelectedSectionId(null);
    setSelectedTableId(null);
  };

  const handleTableClick = (tableId: string) => {
    setSelectedTableId(tableId);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tablesRes, productsRes, venueRes] = await Promise.all([
        apiClient.get('/tables'),
        apiClient.get('/products'),
        apiClient.get('/venue-sections'),
      ]);
      const tableData = tablesRes.data.data;
      setTables(tableData);
      setProducts(productsRes.data.data);
      
      const venueSectionData = venueRes.data.data || [];
      // Group tables by venue section
      const sectionsWithTables = venueSectionData.map((section: any) => ({
        ...section,
        tables: tableData.filter((t: Table) => t.venueSectionId === section.id),
      }));
      setVenueSections(sectionsWithTables);

      // Orders'ı backend'den al ve local state'e koy
      const ordersMap = new Map<string, Order>();
      if (tableData && Array.isArray(tableData)) {
        tableData.forEach((table: any) => {
          if (table.orders && table.orders.length > 0) {
            const order = table.orders[0]; // İlk açık sipariş
            ordersMap.set(table.id, order);
          }
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

  const handleAddToOrder = async () => {
    if (!selectedTableId || !selectedProductId) {
      setError('Lütfen ürün seçiniz');
      return;
    }

    const quantity = parseInt(selectedQuantity);
    const currentOrder = orders.get(selectedTableId);

    try {
      setLoading(true);
      // Her ürün eklenmesi backend'e istek yapacak
      const response = await apiClient.post(`/tables/${selectedTableId}/order/items`, {
        productId: selectedProductId,
        quantity,
      });

      // Backend'den dönen item ile state'i güncelle
      const newItem: OrderItem = {
        id: response.data.data.id,
        productId: response.data.data.productId,
        product: {
          name: response.data.data.product?.name || '',
        },
        quantity: response.data.data.quantity,
        unitPrice: Number(response.data.data.unitPrice),
      };

      if (!currentOrder) {
        // İlk ürün: Yeni order oluştur
        const newOrder: Order = {
          id: response.data.data.sessionId,
          tableId: selectedTableId,
          items: [newItem],
          totalAmount: newItem.unitPrice * newItem.quantity,
          status: 'OPEN',
        };
        setOrders(prev => new Map(prev).set(selectedTableId, newOrder));
      } else {
        // Sonraki ürünler: Mevcut order'a ekle
        const existingItem = currentOrder.items.find(i => i.productId === selectedProductId);
        let newItems: OrderItem[];

        if (existingItem) {
          // Aynı ürün varsa quantity'sini güncelle
          newItems = currentOrder.items.map(i =>
            i.productId === selectedProductId ? newItem : i
          );
        } else {
          // Yeni ürün ise ekle
          newItems = [...currentOrder.items, newItem];
        }

        const totalAmount = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

        setOrders(prev => new Map(prev).set(selectedTableId, {
          ...currentOrder,
          items: newItems,
          totalAmount,
        }));
      }

      setSelectedProductId('');
      setSelectedQuantity('1');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ürün eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (tableId: string, itemId: string) => {
    const currentOrder = orders.get(tableId);
    if (!currentOrder) return;

    try {
      setLoading(true);
      // Backend'e silme isteği gönder
      await apiClient.delete(`/orders/${currentOrder.id}/items/${itemId}`);

      // Backend'den silme başarılıysa state'i güncelle
      const newItems = currentOrder.items.filter(i => i.id !== itemId);

      if (newItems.length === 0) {
        // Tüm ürünler silindiyse siparişi kaldır
        setOrders(prev => {
          const newMap = new Map(prev);
          newMap.delete(tableId);
          return newMap;
        });
      } else {
        // Kalan items'ları güncelle
        const totalAmount = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

        setOrders(prev => new Map(prev).set(tableId, {
          ...currentOrder,
          items: newItems,
          totalAmount,
        }));
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ürün silinirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (orderId: string) => {
    // Dialog aç
    setCheckoutOrderId(orderId);
    setOpenCheckoutDialog(true);
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutOrderId) return;

    try {
      setLoading(true);
      // Local state'teki siparişi al
      const orderToCheckout = Array.from(orders.values()).find(o => o.id === checkoutOrderId);

      if (!orderToCheckout) {
        setError('Sipariş bulunamadı');
        setOpenCheckoutDialog(false);
        setCheckoutOrderId(null);
        return;
      }

      // Backend'e göndermeden önce items'ı gönder
      await apiClient.post(`/orders/${checkoutOrderId}/checkout`, {
        items: orderToCheckout.items.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      // Local state'den kaldır
      const tableIdToRemove = Array.from(orders.entries()).find(([_, order]) => order.id === checkoutOrderId)?.[0];

      if (tableIdToRemove) {
        setOrders(prev => {
          const newMap = new Map(prev);
          newMap.delete(tableIdToRemove);
          return newMap;
        });
        setSelectedTableId(null);
      }

      setError(null);
      setOpenCheckoutDialog(false);
      setCheckoutOrderId(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ödeme işlemi başarısız');
      setOpenCheckoutDialog(false);
      setCheckoutOrderId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCheckout = () => {
    setOpenCheckoutDialog(false);
    setCheckoutOrderId(null);
  };

  const currentOrder = selectedTableId ? orders.get(selectedTableId) : null;
  const selectedTable = tables.find(t => t.id === selectedTableId);
  const selectedSection = venueSections.find(s => s.id === selectedSectionId);
  const sectionTables = selectedSection?.tables || [];

  // Sidebar content based on navigation level
  const renderSidebarContent = () => {
    if (navLevel === 'sections') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              🏪 Mekan Bölümleri
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            <List>
              {venueSections.map((section) => (
                <ListItemButton
                  key={section.id}
                  onClick={() => handleSelectSection(section.id)}
                  sx={{
                    mb: 1,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    '&:hover': { backgroundColor: '#eeeeee' },
                  }}
                >
                  <ListItemText
                    primary={section.name}
                    secondary={`${section.tables.length} masa`}
                    primaryTypographyProps={{ sx: { fontWeight: 600 } }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Box>
      );
    } else if (navLevel === 'tables' && selectedSection) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleBackToSections}
              sx={{ color: 'white' }}
              title="Geri gel"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
              {selectedSection.name}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            <List>
              {sectionTables.map((table) => {
                const tableOrder = orders.get(table.id);
                const isSelected = table.id === selectedTableId;
                const isOccupied = table.status === 'OCCUPIED' || tableOrder;

                return (
                  <ListItemButton
                    key={table.id}
                    selected={isSelected}
                    onClick={() => handleTableClick(table.id)}
                    sx={{
                      mb: 0.5,
                      backgroundColor: isOccupied ? '#ffe0b2' : '#c8e6c9',
                      borderRadius: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                      },
                      '&:hover': {
                        backgroundColor: isSelected ? 'primary.dark' : '#f0f0f0',
                      },
                    }}
                  >
                    <ListItemText
                      primary={`Masa ${table.tableNumber} ${isOccupied ? '🔴' : '🟢'}`}
                      secondary={tableOrder ? `${tableOrder.items.reduce((sum, item) => sum + item.quantity, 0)} ürün` : 'Boş'}
                      primaryTypographyProps={{ sx: { fontWeight: 600, color: isSelected ? 'white' : 'inherit' } }}
                      secondaryTypographyProps={{ sx: { color: isSelected ? 'rgba(255,255,255,0.7)' : 'inherit' } }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        </Box>
      );
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Left Sidebar - Dynamic Navigation */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          backgroundColor: '#fafafa',
          borderRight: '1px solid #e0e0e0',
          overflow: 'hidden',
        }}
      >
        {renderSidebarContent()}
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            backgroundColor: 'white',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h6">
            Masalar & Siparişler
          </Typography>
          <Button
            size="small"
            onClick={() => navigate('/')}
          >
            Kapat
          </Button>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : selectedTable && navLevel === 'tables' ? (
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  📋 Masa {selectedTable.tableNumber}
                </Typography>

                {/* Items List */}
                <Box sx={{ mb: 3, maxHeight: 300, overflowY: 'auto', flex: 1 }}>
                  {!currentOrder || currentOrder.items.length === 0 ? (
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
                              onClick={() => handleRemoveItem(selectedTableId!, item.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={`${item.product?.name || 'Bilinmeyen Ürün'} x${item.quantity}`}
                            secondary={`₺${Number(item.unitPrice * item.quantity).toFixed(2)}`}
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
                        {product.name} - ₺{Number(product.price).toFixed(2)}
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
                {currentOrder && (
                  <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1">Toplam:</Typography>
                      <Typography variant="h6" color="primary">
                        ₺{Number(currentOrder.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)).toFixed(2)}
                      </Typography>
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={() => handleCheckout(currentOrder.id)}
                      disabled={currentOrder.items.length === 0 || loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Ödemeyi Tamamla'}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                {navLevel === 'sections' ? 'Başlamak için sol menüden bir bölüm seçin' : 'Bir masa seçin'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Checkout Confirmation Dialog */}
      <Dialog
        open={openCheckoutDialog}
        onClose={handleCancelCheckout}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Ödeme Onayı</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            Masaı kapatıp ödeme işlemini tamamlamak istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCheckout} color="inherit">
            İptal
          </Button>
          <Button
            onClick={handleConfirmCheckout}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Ödemeyi Tamamla'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

