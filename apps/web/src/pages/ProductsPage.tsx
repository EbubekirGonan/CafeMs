import { useEffect, useState } from 'react';
import {
  Container,
  Button,
  Dialog,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import apiClient from '../lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  isActive: boolean;
}

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Diğer',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products');
      setProducts(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ürünler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category || 'Diğer',
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', category: 'Diğer' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ name: '', price: '', category: 'Diğer' });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await apiClient.put(`/products/${editingId}`, {
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category,
        });
      } else {
        await apiClient.post('/products', {
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category,
        });
      }
      handleCloseDialog();
      await fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        await apiClient.delete(`/products/${id}`);
        await fetchProducts();
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Silme işlemi başarısız');
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Ürünler</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Yeni Ürün
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Adı</TableCell>
                  <TableCell align="right">Fiyat</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell align="center">Durum</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="right">₺{Number(product.price).toFixed(2)}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.isActive ? 'Aktif' : 'İnaktif'}
                        color={product.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(product)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(product.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {editingId ? 'Ürünü Düzenle' : 'Yeni Ürün'}
            </Typography>
            <TextField
              fullWidth
              label="Ürün Adı"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Fiyat"
              type="number"
              inputProps={{ step: '0.01' }}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Kategori"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              margin="normal"
            />
            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Kaydet
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Box>
    </Container>
  );
};
