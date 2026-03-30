import { TableRepository } from '../repositories/table.repository';

export class TableService {
  private repository: TableRepository;

  constructor() {
    this.repository = new TableRepository();
  }

  /**
   * Tüm masaları getir (FR-05)
   */
  async getAllTables() {
    const tables = await this.repository.findAll();
    
    // Frontend için veriyi dönüştür
    return tables.map((table) => {
      // Tüm session'ları order olarak dönüştür
      const orders = table.sessions
        ?.filter(s => s.status === 'OPEN') // Sadece açık siparişleri al
        .map((session) => ({
          id: session.id,
          tableId: table.id,
          items: session.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            product: item.product,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
          })),
          totalAmount: Number(session.totalAmount),
          status: session.status,
        })) || [];
      
      return {
        id: table.id,
        tableNumber: table.number,
        capacity: table.capacity,
        status: table.status === 'OCCUPIED' ? 'occupied' : 'available',
        venueSectionId: table.venueSectionId,
        orders, // orders array'i gönder
        createdAt: table.createdAt.toISOString(),
      };
    });
  }

  /**
   * Masa detaylarını getir
   */
  async getTableDetail(id: string) {
    const table = await this.repository.findById(id);
    if (!table) {
      throw new Error('TABLE_NOT_FOUND');
    }

    // Frontend için veriyi dönüştür
    const orders = table.sessions
      ?.filter(s => s.status === 'OPEN')
      .map((session) => ({
        id: session.id,
        tableId: table.id,
        items: session.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          product: item.product,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
        })),
        totalAmount: Number(session.totalAmount),
        status: session.status,
      })) || [];
    
    return {
      id: table.id,
      tableNumber: table.number,
      capacity: table.capacity,
      status: table.status === 'OCCUPIED' ? 'occupied' : 'available',
      orders,
      createdAt: table.createdAt.toISOString(),
    };
  }

  /**
   * Masanın aktif siparişini getir
   */
  async getTableActiveOrder(tableId: string) {
    const order = await this.repository.getActiveOrder(tableId);
    return order;
  }
}
