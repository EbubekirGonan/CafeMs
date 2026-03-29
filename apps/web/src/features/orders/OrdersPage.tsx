import { useState } from 'react';
import {
  Container,
  Paper,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useOrders, Table as TableType } from '../hooks/useOrders';
import { useProducts } from '../hooks/useProducts';

export const OrdersPage = () => {
  const { tables, loading, error, addItemToOrder, removeItemFromOrder, checkoutTable, fetchTables } =
    useOrders();
  const { products } = useProducts();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleOpenDialog = (tableId: string) => {
    setSelectedTableId(tableId);
    setSelectedProductId('');
    setQuantity(1);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTableId(null);
  };

  const handleAddItem = async () => {
    if (!selectedTableId || !selectedProductId) return;
    try {
      await addItemToOrder(selectedTableId, selectedProductId, quantity);
      await fetchTables();
      handleCloseDialog();
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRemoveItem = async (tableId: string, itemId: string) => {
    try {
      await removeItemFromOrder(tableId, itemId);
      await fetchTables();
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCheckout = async (tableId: string) => {
    if (confirm('Checkout this table?')) {
      try {
        await checkoutTable(tableId);
      } catch (err: any) {
        alert('Error: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <h1>Tables & Orders</h1>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {tables.map((table) => (
            <Grid item xs={12} sm={6} md={4} key={table.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Table {table.tableNumber}</Typography>
                    <Chip
                      label={table.status}
                      color={table.status === 'available' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary">Capacity: {table.capacity}</Typography>
                  {table.items && table.items.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Order Items:</Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell padding="none">Qty</TableCell>
                            <TableCell padding="none">Price</TableCell>
                            <TableCell padding="none" align="right">
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {table.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell padding="none">{item.quantity}</TableCell>
                              <TableCell padding="none">${item.price.toFixed(2)}</TableCell>
                              <TableCell padding="none" align="right">
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveItem(table.id, item.id)}
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Typography variant="subtitle2" sx={{ mt: 1 }}>
                        Total: ${table.totalAmount?.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleOpenDialog(table.id)}>
                    Add Item
                  </Button>
                  {table.items && table.items.length > 0 && (
                    <Button size="small" color="success" onClick={() => handleCheckout(table.id)}>
                      Checkout
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Item to Order</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Product"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - ${p.price.toFixed(2)}
              </option>
            ))}
          </TextField>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            fullWidth
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
