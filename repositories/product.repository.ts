import prisma from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateProductInput {
  name: string;
  price: number;
  category?: string | null;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  category?: string | null;
}

export class ProductRepository {
  /**
   * Tüm aktif ürünleri getir
   */
  async findAll(category?: string) {
    const where: any = { isActive: true };
    if (category) {
      where.category = category;
    }

    return prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * ID'ye göre ürün getir
   */
  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: {
          select: {
            id: true,
            quantity: true,
            order: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * İsme göre ürün getir
   */
  async findByName(name: string) {
    return prisma.product.findUnique({
      where: { name },
    });
  }

  /**
   * Yeni ürün oluştur
   */
  async create(input: CreateProductInput) {
    return prisma.product.create({
      data: {
        name: input.name,
        price: new Decimal(input.price.toString()),
        category: input.category || null,
        isActive: true,
      },
    });
  }

  /**
   * Ürünü güncelle
   */
  async update(id: string, input: UpdateProductInput) {
    const data: any = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.price !== undefined) data.price = new Decimal(input.price.toString());
    if (input.category !== undefined) data.category = input.category;

    return prisma.product.update({
      where: { id },
      data,
    });
  }

  /**
   * Ürünü soft-delete (pasif yap)
   */
  async deactivate(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Ürünün aktif siparişlerde olup olmadığını kontrol et
   */
  async hasActiveOrders(productId: string): Promise<boolean> {
    const hasActiveOrder = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          status: 'OPEN',
        },
      },
    });

    return !!hasActiveOrder;
  }

  /**
   * Kategori listesini getir
   */
  async getCategories(): Promise<string[]> {
    const products = await prisma.product.findMany({
      distinct: ['category'],
      select: { category: true },
      where: { category: { not: null } },
    });

    return products
      .map((p) => p.category)
      .filter((c): c is string => c !== null);
  }
}
