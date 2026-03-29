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
  Typography,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import apiClient from '../lib/api';

interface Expense {
  id: string;
  description: string;
  category: string;
  totalAmount: number;
  quantity: number;
  unit: string;
  unitPrice: number;
  date: string;
}

const EXPENSE_CATEGORIES = [
  'Hammadde',
  'Kütlü Maddeler',
  'Ambalaj',
  'Elektrik',
  'Su',
  'Diğer',
];

export const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    category: 'Hammadde',
    quantity: '',
    unit: 'kg',
    unitPrice: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let url = '/expenses';
      const params = new URLSearchParams();

      if (filterCategory) params.append('category', filterCategory);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await apiClient.get(url);
      setExpenses(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Giderler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filterCategory, filterStartDate, filterEndDate]);

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingId(expense.id);
      setFormData({
        description: expense.description,
        category: expense.category,
        quantity: expense.quantity.toString(),
        unit: expense.unit,
        unitPrice: expense.unitPrice.toString(),
        date: expense.date.split('T')[0],
      });
    } else {
      setEditingId(null);
      setFormData({
        description: '',
        category: 'Hammadde',
        quantity: '',
        unit: 'kg',
        unitPrice: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({
      description: '',
      category: 'Hammadde',
      quantity: '',
      unit: 'kg',
      unitPrice: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleSave = async () => {
    try {
      const totalAmount = parseFloat(formData.quantity) * parseFloat(formData.unitPrice);

      if (editingId) {
        await apiClient.put(`/expenses/${editingId}`, {
          description: formData.description,
          category: formData.category,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          unitPrice: parseFloat(formData.unitPrice),
          totalAmount,
          date: formData.date,
        });
      } else {
        await apiClient.post('/expenses', {
          description: formData.description,
          category: formData.category,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          unitPrice: parseFloat(formData.unitPrice),
          totalAmount,
          date: formData.date,
        });
      }
      handleCloseDialog();
      await fetchExpenses();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu gideri silmek istediğinize emin misiniz?')) {
      try {
        await apiClient.delete(`/expenses/${id}`);
        await fetchExpenses();
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Silme işlemi başarısız');
      }
    }
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Giderler</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Yeni Gider
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Kategori"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                size="small"
              >
                <MenuItem value="">Tümü</MenuItem>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Başlangıç Tarihi"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Bitiş Tarihi"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                Toplam Gider: <strong>₺{totalAmount.toFixed(2)}</strong>
              </Typography>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Açıklama</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell align="right">Miktar</TableCell>
                    <TableCell align="right">Birim Fiyat</TableCell>
                    <TableCell align="right">Toplam</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell align="right">
                        {expense.quantity} {expense.unit}
                      </TableCell>
                      <TableCell align="right">₺{expense.unitPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">₺{expense.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(expense.date).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(expense)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(expense.id)}
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
          </>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {editingId ? 'Gideri Düzenle' : 'Yeni Gider'}
            </Typography>
            <TextField
              fullWidth
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Kategori"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              margin="normal"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Miktar"
              type="number"
              inputProps={{ step: '0.01' }}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Birim"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Birim Fiyat"
              type="number"
              inputProps={{ step: '0.01' }}
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              type="date"
              label="Tarih"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
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
