import prisma from '../lib/prisma';

export class TableRepository {
  /**
   * Tüm masaları getir
   */
  async findAll() {
    return prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: { status: 'OPEN' },
          select: {
            id: true,
            totalAmount: true,
          },
        },
      },
    });
  }

  /**
   * ID'ye göre masa getir
   */
  async findById(id: string) {
    return prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: { status: 'OPEN' },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Masanın durumunu güncelle
   */
  async updateStatus(id: string, status: 'EMPTY' | 'OCCUPIED') {
    return prisma.table.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Masanın aktif siparişini getir
   */
  async getActiveOrder(tableId: string) {
    return prisma.order.findFirst({
      where: {
        tableId,
        status: 'OPEN',
      },
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
      },
    });
  }
}
