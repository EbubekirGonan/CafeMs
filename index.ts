import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import tableRoutes from './routes/table.routes';
import orderRoutes from './routes/order.routes';
import expenseRoutes from './routes/expense.routes';
import reportRoutes from './routes/report.routes';
import { venueSectionRoutes } from './routes/venue-section.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/venue-sections', venueSectionRoutes);

app.listen(port, () => {
  console.log(`[server]: CafeMS Backend is running at http://localhost:${port}`);
});