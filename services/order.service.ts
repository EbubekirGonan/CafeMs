import { TableRepository } from '../repositories/table.repository';
import { OrderRepository, AddOrderItemInput } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma';

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

    // Aktif session var mı?
    let session = table.sessions?.find((s) => !s.closedAt);
    let itemResult;

    if (!session) {
      // Yeni session oluştur
      session = await prisma.session.create({
        data: { tableId },
        include: { items: true },
      });
    } else {
      // Session'ı items ile yeniden yükle
      session = await prisma.session.findUnique({
        where: { id: session.id },
        include: { items: true },
      });
    }

    // Mevcut ürün kontrol et
    const existingItem = session.items?.find((item) => item.productId === input.productId);

    if (existingItem) {
      // Mevcut ürünün quantity'sini güncelle
      itemResult = await this.orderRepo.updateItemQuantity(
        existingItem.id,
        existingItem.quantity + input.quantity
      );
    } else {
      // Yeni ürün ekle (unit_price snapshot)
      itemResult = await this.orderRepo.addItem(
        session.id,
        input.productId,
        input.quantity,
        new Decimal(product.price.toString())
      );
    }

    // Masayı 'OCCUPIED' olarak işaretle
    await this.tableRepo.updateStatus(tableId, 'OCCUPIED');

    return itemResult;
  }

  /**
   * Siparişten ürün çıkar (FR-07)
   */
  async removeItemFromOrder(sessionId: string, itemId: string) {
    // Session'ı kontrol et
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        items: {
          where: { id: itemId },
        },
        table: true,
      },
    });

    if (!session) {
      throw new Error('SESSION_NOT_FOUND');
    }

    if (session.items.length === 0) {
      throw new Error('ORDER_ITEM_NOT_FOUND');
    }

    const item = session.items[0];

    // Kalemi sil
    await this.orderRepo.deleteItem(itemId);

    // Kalan kalem var mı?
    const remainingCount = await this.orderRepo.getItemCount(sessionId);
    if (remainingCount === 0) {
      // Masayı boşalt
      await this.tableRepo.updateStatus(session.table.id, 'EMPTY');
    }

    return item;
  }

  /**
   * Hesabı kapat (checkout) - FR-09
   */
  async checkoutOrder(sessionId: string) {
    // Session ve items'ını getir
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        items: {
          include: { product: true },
        },
        table: true,
      },
    });

    if (!session) {
      throw new Error('SESSION_NOT_FOUND');
    }

    // İş kuralı: Açık (OPEN) oturumlar kapanabilir
    if (session.status !== 'OPEN') {
      throw new Error('SESSION_NOT_OPEN');
    }

    // İş kuralı: Kalem gerekli
    if (session.items.length === 0) {
      throw new Error('SESSION_EMPTY');
    }

    // Transaction: Session'ı kapatma + Revenue record
    const result = await prisma.$transaction(async (tx) => {
      // Total hesapla
      const totalAmount = session.items.reduce((sum, item) => {
        return sum.plus(new Decimal(item.unitPrice).mul(item.quantity));
      }, new Decimal(0));

      // Session'ı güncelle
      const updatedSession = await tx.session.update({
        where: { id: sessionId },
        data: {
          status: 'PAID',
          closedAt: new Date(),
          totalAmount,
        },
        include: { items: { include: { product: true } } },
      });

      // Revenue record oluştur
      const revenueRecord = await tx.revenueRecord.create({
        data: {
          sessionId,
          amount: totalAmount,
          revenueDate: new Date(),
        },
      });

      // Table'ı EMPTY yap
      await tx.table.update({
        where: { id: session.table.id },
        data: { status: 'EMPTY' },
      });

      return { session: updatedSession, revenueRecord };
    });

    return result;
  }

  /**
   * Sipariş (Session) detaylarını getir (FR-08)
   */
  async getOrderDetails(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!session) {
      throw new Error('SESSION_NOT_FOUND');
    }

    return session;
  }

  /**
   * Batch: Ürünlerle sipariş oluştur
   */
  async createOrderWithItems(
    tableId: string,
    items: Array<{ productId: string; quantity: number }>
  ) {
    // Masayı kontrol et
    const table = await this.tableRepo.findById(tableId);
    if (!table) {
      throw new Error('TABLE_NOT_FOUND');
    }

    // Tüm ürünleri kontrol et
    for (const item of items) {
      const product = await this.productRepo.findById(item.productId);
      if (!product) {
        throw new Error(`PRODUCT_NOT_FOUND: ${item.productId}`);
      }

      if (item.quantity <= 0) {
        throw new Error('INVALID_QUANTITY');
      }
    }

    // Aktif session var mı?
    let session = table.sessions?.find((s) => !s.closedAt);
    if (!session) {
      // Yeni session oluştur
      session = await prisma.session.create({
        data: { tableId },
      });
    }

    // Ürün fiyatlarını snapshot'la
    const itemsWithPrices = await Promise.all(
      items.map(async (item) => {
        const product = await this.productRepo.findById(item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: new Decimal(product!.price.toString()),
        };
      })
    );

    // Batch order oluştur
    const result = await this.orderRepo.createWithItems(session.id, itemsWithPrices);

    // Masayı 'OCCUPIED' olarak işaretle
    await this.tableRepo.updateStatus(tableId, 'OCCUPIED');

    return result;
  }
}
