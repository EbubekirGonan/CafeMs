import { ProductRepository, CreateProductInput, UpdateProductInput } from '../repositories/product.repository';

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  /**
   * Tüm ürünleri getir (kategori filtrelemeli)
   */
  async getAllProducts(category?: string) {
    return this.repository.findAll(category);
  }

  /**
   * Tek ürünü getir
   */
  async getProductById(id: string) {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    return product;
  }

  /**
   * Ürün oluştur - FR-01
   */
  async createProduct(input: CreateProductInput) {
    // İş kuralı: Aynı isimde ürün olamaz
    const existingProduct = await this.repository.findByName(input.name);
    if (existingProduct) {
      throw new Error('PRODUCT_NAME_DUPLICATE');
    }

    // İş kuralı: Fiyat pozitif olmalı
    if (input.price <= 0) {
      throw new Error('INVALID_PRICE');
    }

    return this.repository.create(input);
  }

  /**
   * Ürünü güncelle - FR-02
   */
  async updateProduct(id: string, input: UpdateProductInput) {
    // Ürünün mevcut olup olmadığını kontrol et
    const product = await this.repository.findById(id);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    // Yeni isim varsa ve başkası tarafından kullanılıyorsa hata
    if (input.name && input.name !== product.name) {
      const existingProduct = await this.repository.findByName(input.name);
      if (existingProduct) {
        throw new Error('PRODUCT_NAME_DUPLICATE');
      }
    }

    // Yeni fiyat varsa ve pozitif değilse hata
    if (input.price !== undefined && input.price <= 0) {
      throw new Error('INVALID_PRICE');
    }

    // İş kuralı: Güncelleme, daha önce bu ürünle oluşturulmuş siparişleri geriye dönük etkilemez
    // (unit_price snapshot alındığı için otomatik sağlanıyor)
    return this.repository.update(id, input);
  }

  /**
   * Ürünü sil - FR-03
   */
  async deleteProduct(id: string) {
    // Ürünün mevcut olup olmadığını kontrol et
    const product = await this.repository.findById(id);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    // İş kuralı: Aktif (açık) bir siparişte bulunan ürün silinemez
    const hasActiveOrders = await this.repository.hasActiveOrders(id);
    if (hasActiveOrders) {
      throw new Error('PRODUCT_HAS_ACTIVE_ORDERS');
    }

    // Soft delete (pasif yap)
    return this.repository.deactivate(id);
  }

  /**
   * Kategori listesini getir
   */
  async getCategories() {
    return this.repository.getCategories();
  }
}
