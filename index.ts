import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);

app.listen(port, () => {
  console.log(`[server]: CafeMS Backend is running at http://localhost:${port}`);
});