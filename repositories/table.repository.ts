import prisma from '../lib/prisma';

export class TableRepository {
  /**
   * Tüm masaları getir
   */
  async findAll() {
    return prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        sessions: {
          include: {
            items: {
              include: {
                product: {
                  select: { name: true },
                },
              },
            },
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
        sessions: {
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
    const session = await prisma.session.findFirst({
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
    return session;
  }
}
