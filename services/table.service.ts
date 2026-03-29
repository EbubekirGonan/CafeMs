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
    return this.repository.findAll();
  }

  /**
   * Masa detaylarını getir
   */
  async getTableDetail(id: string) {
    const table = await this.repository.findById(id);
    if (!table) {
      throw new Error('TABLE_NOT_FOUND');
    }

    return table;
  }

  /**
   * Masanın aktif siparişini getir
   */
  async getTableActiveOrder(tableId: string) {
    const order = await this.repository.getActiveOrder(tableId);
    return order;
  }
}
