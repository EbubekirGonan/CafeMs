import prisma from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export interface AddOrderItemInput {
  productId: string;
  quantity: number;
}

export class OrderRepository {
  /**
   * Siparişi ID'ye göre getir
   */
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        table: true,
      },
    });
  }

  /**
   * Ürün ekle (FR-06)
   */
  async addItem(orderId: string, productId: string, quantity: number, unitPrice: Decimal) {
    return prisma.orderItem.create({
      data: {
        orderId,
        productId,
        quantity,
        unitPrice,
      },
      include: {
        product: true,
      },
    });
  }

  /**
   * Sipariş kalemini sil (FR-07)
   */
  async deleteItem(itemId: string) {
    return prisma.orderItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Siparişin kalan kalem sayısını getir
   */
  async getItemCount(orderId: string): Promise<number> {
    return prisma.orderItem.count({
      where: { orderId },
    });
  }

  /**
   * Sipariş oluştur
   */
  async create(tableId: string) {
    return prisma.order.create({
      data: {
        tableId,
      },
    });
  }

  /**
   * Siparişi kapat (checkout) - FR-09
   */
  async checkout(orderId: string) {
    // 1. Toplam tutarı hesapla
    const items = await prisma.orderItem.findMany({
      where: { orderId },
    });

    const totalAmount = items.reduce((sum, item) => {
      return sum.plus(item.unitPrice.mul(item.quantity));
    }, new Decimal(0));

    // 2. Transaction: Order + Revenue Record + Table status
    const result = await prisma.$transaction(async (tx) => {
      // Order durumunu güncelle
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          closedAt: new Date(),
          totalAmount,
        },
        include: { table: true },
      });

      // Revenue record oluştur
      const revenueRecord = await tx.revenueRecord.create({
        data: {
          orderId,
          amount: totalAmount,
          revenueDate: new Date().toISOString().split('T')[0],
        },
      });

      // Masayı boşal
      await tx.table.update({
        where: { id: order.tableId },
        data: { status: 'EMPTY' },
      });

      return { order, revenueRecord };
    });

    return result;
  }

  /**
   * Siparişin toplam tutarını hesapla
   */
  async calculateTotal(orderId: string): Promise<Decimal> {
    const items = await prisma.orderItem.findMany({
      where: { orderId },
    });

    return items.reduce((sum, item) => {
      return sum.plus(item.unitPrice.mul(item.quantity));
    }, new Decimal(0));
  }
}
