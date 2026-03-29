import { TableRepository } from '../repositories/table.repository';
import { OrderRepository, AddOrderItemInput } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { Decimal } from '@prisma/client/runtime/library';

export class OrderService {
  private tableRepo: TableRepository;
  private orderRepo: OrderRepository;
  private productRepo: ProductRepository;

  constructor() {
    this.tableRepo = new TableRepository();
    this.orderRepo = new OrderRepository();
    this.productRepo = new ProductRepository();
  }

  /**
   * Masaya ürün ekle (FR-06)
   */
  async addItemToTable(tableId: string, input: AddOrderItemInput) {
    // Masayı kontrol et
    const table = await this.tableRepo.findById(tableId);
    if (!table) {
      throw new Error('TABLE_NOT_FOUND');
    }

    // Ürünü kontrol et
    const product = await this.productRepo.findById(input.productId);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    // Çokluğu kontrol et
    if (input.quantity <= 0) {
      throw new Error('INVALID_QUANTITY');
    }

    // Aktif sipariş var mı?
    let order = table.orders.find((o) => o.id);
    if (!order) {
      // Yeni sipariş oluştur
      const createdOrder = await this.orderRepo.create(tableId);
      order = createdOrder as any;
    }

    // Ürün ekle (unit_price snapshot)
    const item = await this.orderRepo.addItem(
      order.id,
      input.productId,
      input.quantity,
      new Decimal(product.price.toString())
    );

    // Masayı 'OCCUPIED' olarak işaretle
    await this.tableRepo.updateStatus(tableId, 'OCCUPIED');

    return item;
  }

  /**
   * Siparişten ürün çıkar (FR-07)
   */
  async removeItemFromOrder(orderId: string, itemId: string) {
    // Siparişi kontrol et
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    // Kalemi kontrol et
    const item = order.items.find((i) => i.id === itemId);
    if (!item) {
      throw new Error('ORDER_ITEM_NOT_FOUND');
    }

    // Kalemi sil
    await this.orderRepo.deleteItem(itemId);

    // Kalan kalem var mı?
    const remainingCount = await this.orderRepo.getItemCount(orderId);
    if (remainingCount === 0) {
      // Masayı 'EMPTY' yap
      await this.tableRepo.updateStatus(order.tableId, 'EMPTY');
    }

    return item;
  }

  /**
   * Hesabı kapat (checkout) - FR-09
   */
  async checkoutOrder(orderId: string) {
    // Siparişi kontrol et
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    // İş kuralı: Açık (OPEN) siparişler kapanabilir
    if (order.status !== 'OPEN') {
      throw new Error('ORDER_NOT_OPEN');
    }

    // İş kuralı: Kalem gerekli
    if (order.items.length === 0) {
      throw new Error('ORDER_EMPTY');
    }

    // Checkout yap
    const result = await this.orderRepo.checkout(orderId);
    return result;
  }

  /**
   * Sipariş detaylarını getir (FR-08)
   */
  async getOrderDetails(orderId: string) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    // Toplam tutarı hesapla
    const totalAmount = await this.orderRepo.calculateTotal(orderId);

    return {
      ...order,
      totalAmount,
    };
  }
}
