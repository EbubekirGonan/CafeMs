"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = exports.productSchema = exports.checkoutSchema = exports.addOrderItemSchema = exports.orderItemSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Auth Schemas
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: zod_1.z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
});
// Order Schemas
exports.orderItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('Geçerli bir ürün ID\'si giriniz'),
    quantity: zod_1.z.number().int().positive('Adet en az 1 olmalıdır'),
});
exports.addOrderItemSchema = exports.orderItemSchema;
exports.checkoutSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
});
// Product Schemas
exports.productSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Ürün adı en az 2 karakter olmalıdır').max(150),
    price: zod_1.z.coerce.number().positive('Fiyat 0\'dan büyük olmalıdır'),
    category: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().default(true),
});
exports.createProductSchema = exports.productSchema;
exports.updateProductSchema = exports.productSchema.partial();
