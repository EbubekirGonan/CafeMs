import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalıdır').max(150),
  price: z.coerce.number().positive('Fiyat 0\'dan büyük olmalıdır'),
  category: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const createProductSchema = productSchema;
export const updateProductSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;