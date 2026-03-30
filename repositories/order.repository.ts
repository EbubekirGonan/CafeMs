import prisma from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export interface AddOrderItemInput {
  productId: string;
  quantity: number;
}

export class OrderRepository {
  /**
   * SessionID'ye göre tüm öğeleri getir (replace for order items in session)
   */
  async findBySessionId(sessionId: string) {
    return prisma.orderItem.findMany({
      where: { sessionId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });
  }

  /**
   * Ürün ekle (FR-06)
   */
  async addItem(sessionId: string, productId: string, quantity: number, unitPrice: Decimal) {
    return prisma.orderItem.create({
      data: {
        sessionId,
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
   * Mevcut kalemin quantity'sini güncelle
   */
  async updateItemQuantity(itemId: string, quantity: number) {
    return prisma.orderItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: true,
      },
    });
  }

  /**
   * SessionID'deki kalem sayısını getir
   */
  async getItemCount(sessionId: string): Promise<number> {
    return prisma.orderItem.count({
      where: { sessionId },
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

    // 2. Transaction: Order + Revenue Record + Session total
    const result = await prisma.$transaction(async (tx) => {
      // Order durumunu güncelle
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          closedAt: new Date(),
          totalAmount,
        },
        include: { session: true },
      });

      // Revenue record oluştur
      const revenueRecord = await tx.revenueRecord.create({
        data: {
          orderId,
          amount: totalAmount,
          revenueDate: new Date().toISOString().split('T')[0],
        },
      });

      // Session toplam tutarını güncelle
      const sessionOrders = await tx.order.findMany({
        where: { sessionId: order.sessionId },
      });

      const sessionTotal = sessionOrders.reduce((sum, o) => {
        return sum.plus(o.totalAmount);
      }, new Decimal(0));

      await tx.session.update({
        where: { id: order.sessionId },
        data: { totalAmount: sessionTotal },
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

  /**
   * Ürünlerle birlikte sipariş oluştur (batch)
   */
  async createWithItems(
    sessionId: string,
    items: Array<{ productId: string; quantity: number; unitPrice: Decimal }>
  ) {
    return prisma.$transaction(async (tx) => {
      // Order oluştur
      const order = await tx.order.create({
        data: { sessionId },
      });

      // Tüm items'i oluştur
      const createdItems = await Promise.all(
        items.map((item) =>
          tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          })
        )
      );

      // Toplam tutarı hesapla
      const totalAmount = items.reduce((sum, item) => {
        return sum.plus(item.unitPrice.mul(item.quantity));
      }, new Decimal(0));

      // Order'ı güncelle (totalAmount)
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { totalAmount },
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
          session: true,
        },
      });

      return {
        order: updatedOrder,
        items: createdItems,
        totalAmount,
      };
    });
  }
}
