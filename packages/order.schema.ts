import { z } from 'zod';

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