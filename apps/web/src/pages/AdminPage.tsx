import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import apiClient from '../lib/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function AdminPage() {
  const [tabValue, setTabValue] = useState(0);
  const [tables, setTables] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTable, setNewTable] = useState({ tableNumber: '1', capacity: '4' });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tablesRes, productsRes] = await Promise.all([
        apiClient.get('/tables'),
        apiClient.get('/products'),
      ]);

      if (tablesRes.data?.success) {
        setTables(tablesRes.data.data || []);
        
        // Fetch sessions for each table
        const allSessions: any[] = [];
        for (const table of tablesRes.data.data || []) {
          try {
            const sessRes = await apiClient.get(`/tables/${table.id}/sessions`);
            if (sessRes.data?.success && sessRes.data?.data) {
              allSessions.push(...sessRes.data.data);
            }
          } catch (e) {
            console.log('Error fetching sessions for table:', table.id);
          }
        }
        setSessions(allSessions);
      }

      if (productsRes.data?.success) {
        setProducts(productsRes.data.data || []);
      }

      // Fetch order items
      try {
        const itemsRes = await apiClient.get('/order-items');
        if (itemsRes.data?.success) {
          setOrderItems(itemsRes.data.data || []);
        }
      } catch (e) {
        console.log('Error fetching order items');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const handleAddTable = async () => {
    try {
      await apiClient.post('/tables', {
        tableNumber: parseInt(newTable.tableNumber),
        capacity: parseInt(newTable.capacity),
      });
      setOpenDialog(false);
      setNewTable({ tableNumber: '1', capacity: '4' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Tablo eklenirken hata oluştu');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <h1>📊 Admin Paneli - Veritabanı Görüntüle</h1>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={fetchData}>
          🔄 Yenile
        </Button>
        <Button variant="contained" color="success" onClick={() => setOpenDialog(true)}>
          ➕ Tablo Ekle
        </Button>
      </Box>

      {loading && !tables.length ? (
        <CircularProgress />
      ) : (
        <>
          <Paper>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label={`📍 Masalar (${tables.length})`} id="tab-0" />
              <Tab label={`🛏️ Oturumlar (${sessions.length})`} id="tab-1" />
              <Tab label={`☕ Ürünler (${products.length})`} id="tab-2" />
              <Tab label={`📦 Sipariş Öğeleri (${orderItems.length})`} id="tab-3" />
            </Tabs>
          </Paper>

          {/* TABLES TAB */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><b>Masa No</b></TableCell>
                    <TableCell><b>Kapasite</b></TableCell>
                    <TableCell><b>Durum</b></TableCell>
                    <TableCell><b>Oluşturma Tarihi</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table.id}>
                      <TableCell>#{table.tableNumber}</TableCell>
                      <TableCell>{table.capacity} kişi</TableCell>
                      <TableCell>{table.isActive ? '✅ Aktif' : '❌ İnaktif'}</TableCell>
                      <TableCell>{new Date(table.createdAt).toLocaleString('tr-TR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* SESSIONS TAB */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><b>Masa</b></TableCell>
                    <TableCell><b>Durum</b></TableCell>
                    <TableCell><b>Toplam</b></TableCell>
                    <TableCell><b>Açıldı</b></TableCell>
                    <TableCell><b>Kapatıldı</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        #{tables.find(t => t.id === session.tableId)?.tableNumber || '?'}
                      </TableCell>
                      <TableCell>
                        {session.status === 'OPEN' ? '🟢 AÇIK' : '🔴 ÖDENDİ'}
                      </TableCell>
                      <TableCell>₺{session.totalAmount}</TableCell>
                      <TableCell>{new Date(session.openedAt).toLocaleString('tr-TR')}</TableCell>
                      <TableCell>
                        {session.closedAt ? new Date(session.closedAt).toLocaleString('tr-TR') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* PRODUCTS TAB */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><b>Ürün Adı</b></TableCell>
                    <TableCell><b>Kategori</b></TableCell>
                    <TableCell><b>Fiyat</b></TableCell>
                    <TableCell><b>Durum</b></TableCell>
                    <TableCell><b>Oluşturma Tarihi</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>₺{product.price}</TableCell>
                      <TableCell>{product.isActive ? '✅ Aktif' : '❌ İnaktif'}</TableCell>
                      <TableCell>{new Date(product.createdAt).toLocaleString('tr-TR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* ORDER ITEMS TAB */}
          <TabPanel value={tabValue} index={3}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><b>Ürün</b></TableCell>
                    <TableCell><b>Miktar</b></TableCell>
                    <TableCell><b>Birim Fiyat</b></TableCell>
                    <TableCell><b>Toplam</b></TableCell>
                    <TableCell><b>Oturum ID</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {products.find(p => p.id === item.productId)?.name || 'Bilinmiyor'}
                      </TableCell>
                      <TableCell>{item.quantity}x</TableCell>
                      <TableCell>₺{item.unitPrice}</TableCell>
                      <TableCell>₺{(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>{item.sessionId.substring(0, 8)}...</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </>
      )}

      {/* ADD TABLE DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Masa Ekle</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Masa Numarası"
            type="number"
            value={newTable.tableNumber}
            onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
            fullWidth
          />
          <TextField
            label="Kapasite"
            type="number"
            value={newTable.capacity}
            onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button onClick={handleAddTable} variant="contained">Ekle</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
