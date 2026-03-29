import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Order Schemas
export const orderItemSchema = z.object({
  productId: z.string().uuid('Geçerli bir ürün ID\'si giriniz'),
  quantity: z.number().int().positive('Adet en az 1 olmalıdır'),
});

export const addOrderItemSchema = orderItemSchema;

export const checkoutSchema = z.object({
  orderId: z.string().uuid(),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

// Product Schemas
export const productSchema = z.object({
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalıdır').max(150),
  price: z.coerce.number().positive('Fiyat 0\'dan büyük olmalıdır'),
  category: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const createProductSchema = productSchema;
export const updateProductSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
