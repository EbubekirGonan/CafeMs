**SOFTWARE DESIGN DOCUMENT**

Yazılım Tasarım Belgesi (SDD)

 

   
**Kafe Yönetim Sistemi — CafeMS**

*SRS v1.0 referansıyla hazırlanmıştır*

| Alan | Bilgi |
| :---- | :---- |
| Belge Versiyonu | v1.0 |
| Hazırlayan | Senior Developer / Yazılım Mimarı |
| Referans Belge | CafeMS SRS v1.0 |
| Tarih | 28.03.2026 |
| Durum | Taslak |

# **1\. Sistem Mimarisi**

## **1.1 Mimari Stil**

CafeMS, katmanlı (layered) mimari üzerine kurulu bir REST API \+ SPA (Single Page Application) sistemi olarak tasarlanmaktadır. İstemci ve sunucu birbirinden tam bağımsızdır; aralarındaki iletişim yalnızca JSON tabanlı HTTP istekleriyle sağlanır.

 

| Mimari Karar — Neden SPA \+ REST API? • Kafe ortamında tablet ve masaüstü cihazlar birlikte kullanılabilir; SPA her ikisinde de sorunsuz çalışır. • Sunucu ve istemci bağımsız deploy edilebilir; geliştirme döngüleri birbirini kesmez. • İleriki fazda mobil uygulama eklenirse aynı API'yi tüketebilir — sıfır ek maliyet. |
| :---- |

 

## **1.2 Katmanlar**

 

| Katman | Sorumluluk | Teknoloji |
| :---- | :---- | :---- |
| Presentation (UI) | Kullanıcı arayüzü, state yönetimi, API çağrıları | React \+ TypeScript |
| API Gateway | HTTP routing, auth middleware, rate limiting | Express.js |
| Business Logic | İş kuralları, hesaplamalar, validasyon | Node.js Service katmanı |
| Data Access (DAL) | Veritabanı sorguları, ORM/query builder | Prisma ORM |
| Database | Kalıcı veri saklama | PostgreSQL |
| Cache | Oturum verisi, sık erişilen listeler | Redis |

 

## **1.3 Deployment Mimarisi**

Sistem Docker container'ları üzerinde çalışır. Üretim ortamında aşağıdaki yapı hedeflenmektedir:

 

| Bileşen | Container | Port | Not |
| :---- | :---- | :---- | :---- |
| React Frontend | nginx:alpine | 80 / 443 | Static build serve edilir |
| Express API | node:20-alpine | 3001 | PM2 process manager |
| PostgreSQL | postgres:16 | 5432 | Volume mount ile kalıcı depo |
| Redis | redis:7-alpine | 6379 | Oturum ve önbellek |
| Nginx Reverse Proxy | nginx:alpine | 80 / 443 | SSL terminate, API proxy |

 

# **2\. Kullanılacak Teknolojiler**

## **2.1 Frontend**

 

| Teknoloji | Versiyon | Kullanım Amacı | Karar Gerekçesi |
| :---- | :---- | :---- | :---- |
| React | 18.x | UI bileşen framework | Olgun ekosistem, geniş topluluk |
| TypeScript | 5.x | Tip güvenliği | Büyük ekiplerde hata oranını düşürür |
| React Router | 6.x | SPA yönlendirme | React ekosistemiyle native uyum |
| TanStack Query | 5.x | Sunucu state yönetimi | Cache, refetch, loading state otomasyonu |
| Zustand | 4.x | İstemci state yönetimi | Redux'a göre minimal boilerplate |
| Tailwind CSS | 3.x | Stil | Hızlı prototipleme, utility-first |
| Recharts | 2.x | Grafik/rapor bileşenleri | React native, SVG tabanlı |
| React Hook Form | 7.x | Form yönetimi | Performanslı, validasyon entegrasyonu |
| Zod | 3.x | Schema validasyon | TypeScript'le tam uyumlu |

 

## **2.2 Backend**

 

| Teknoloji | Versiyon | Kullanım Amacı | Karar Gerekçesi |
| :---- | :---- | :---- | :---- |
| Node.js | 20 LTS | Runtime | Frontend ile aynı dil, düşük context switch |
| Express.js | 4.x | HTTP framework | Minimal, esnek, geniş middleware ekosistemi |
| TypeScript | 5.x | Tip güvenliği | Frontend ile tip paylaşımı (shared types) |
| Prisma ORM | 5.x | Veritabanı erişimi | Type-safe queries, migration yönetimi |
| PostgreSQL | 16.x | İlişkisel veritabanı | ACID uyumlu, JSON desteği, olgun |
| Redis | 7.x | Cache / Oturum | Session store, hızlı okuma |
| JWT | jsonwebtoken | Kimlik doğrulama | Stateless auth, kolayca ölçeklenir |
| bcrypt | 5.x | Şifre hashleme | SRS güvenlik gereksinimi |
| Zod | 3.x | Request validasyon | Frontend ile aynı schema paylaşımı |
| Winston | 3.x | Loglama | Yapılandırılabilir transport'lar |

 

## **2.3 DevOps & Araçlar**

 

| Araç | Amaç |
| :---- | :---- |
| Docker \+ Docker Compose | Geliştirme ve üretim ortamı container'laştırma |
| GitHub Actions | CI/CD pipeline — lint, test, build, deploy |
| ESLint \+ Prettier | Kod kalite standartları |
| Vitest | Frontend birim testleri |
| Supertest | API entegrasyon testleri |
| Prisma Migrate | Veritabanı migration yönetimi |

 

# **3\. Modüller ve Bileşenler**

## **3.1 Frontend Modül Yapısı**

React uygulaması feature-based (özellik bazlı) klasör yapısıyla organize edilir:

   
src/

  features/

    auth/           ← Giriş ekranı, token yönetimi

    products/       ← Ürün listesi, ekleme/düzenleme formları

    tables/         ← Masa planı, sipariş ekranı

    orders/         ← Sipariş detayı, hesap kapama

    expenses/       ← Gider formu, gider listesi

    reports/        ← Aylık özet, grafik bileşenleri

  components/       ← Paylaşılan UI bileşenleri (Button, Modal, Table...)

  hooks/            ← Paylaşılan custom hook'lar

  lib/              ← API client, util fonksiyonlar

  types/            ← Paylaşılan TypeScript tipleri

  router/           ← Route tanımları

 

## **3.2 Backend Modül Yapısı**

   
src/

  routes/           ← Express router tanımları (ince katman)

  controllers/      ← Request/response yönetimi

  services/         ← İş mantığı (business logic)

  repositories/     ← Prisma sorguları (data access)

  middlewares/      ← Auth, error handler, validator

  schemas/          ← Zod validasyon şemaları

  types/            ← TypeScript tip tanımları

  utils/            ← Yardımcı fonksiyonlar

  prisma/           ← Schema ve migration dosyaları

 

## **3.3 Temel Frontend Bileşenleri**

 

| Bileşen | Modül | Sorumluluk |
| :---- | :---- | :---- |
| TableGrid | tables | Tüm masaları kart görünümünde listeler; durum renklendirmesi yapar |
| TableDetail | tables | Seçili masanın sipariş listesini ve toplam tutarı gösterir |
| OrderItemRow | orders | Tek bir sipariş kalemi — ürün adı, adet, fiyat, sil butonu |
| AddProductModal | tables | Ürün arama \+ adet seçimi ile masaya ürün ekler |
| CheckoutConfirm | orders | Hesap kapama onay diyaloğu |
| ProductForm | products | Ürün ekleme / düzenleme formu (React Hook Form \+ Zod) |
| ExpenseForm | expenses | Gider giriş formu — açıklama, miktar, birim, kategori |
| MonthlyReport | reports | Aylık gelir/gider/kar özet kartları \+ trend grafiği |
| CategoryBreakdown | reports | Kategori bazlı gider pasta/çubuk grafiği |
| PrivateRoute | router | Auth kontrolü; giriş yapılmamışsa Login'e yönlendirir |

 

# **4\. Veritabanı Şeması**

## **4.1 Entity-Relationship Özeti**

Veritabanı 7 tablodan oluşur. Tüm tablolar soft-delete desteği için created\_at / updated\_at alanlarına sahiptir.

 

### **4.1.1 users**

| Sütun | Tip | Kısıt | Açıklama |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, default gen\_random\_uuid() | Birincil anahtar |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Giriş e-postası |
| password\_hash | VARCHAR(255) | NOT NULL | bcrypt hash |
| name | VARCHAR(100) | NOT NULL | Görünen ad |
| created\_at | TIMESTAMPTZ | default now() |  |
| updated\_at | TIMESTAMPTZ | default now() |  |

 

### **4.1.2 products**

| Sütun | Tip | Kısıt | Açıklama |
| :---- | :---- | :---- | :---- |
| id | UUID | PK |  |
| name | VARCHAR(150) | NOT NULL, UNIQUE | Ürün adı |
| price | NUMERIC(10,2) | NOT NULL, CHECK \> 0 | Satış fiyatı |
| category | VARCHAR(100) | NULLABLE | Opsiyonel kategori |
| is\_active | BOOLEAN | default true | Soft delete yerine pasif/aktif |
| created\_at | TIMESTAMPTZ | default now() |  |
| updated\_at | TIMESTAMPTZ | default now() |  |

 

### **4.1.3 tables**

| Sütun | Tip | Kısıt | Açıklama |
| :---- | :---- | :---- | :---- |
| id | UUID | PK |  |
| number | INTEGER | NOT NULL, UNIQUE | Masa numarası (1, 2, 3...) |
| capacity | INTEGER | NULLABLE | Kaç kişilik |
| status | ENUM | ('EMPTY','OCCUPIED'), default 'EMPTY' | Anlık durum |
| created\_at | TIMESTAMPTZ | default now() |  |

 

### **4.1.4 orders**

| Sütun | Tip | Kısıt | Açıklama |
| :---- | :---- | :---- | :---- |
| id | UUID | PK |  |
| table\_id | UUID | FK → tables.id, NOT NULL | Hangi masa |
| status | ENUM | ('OPEN','PAID'), default 'OPEN' | Sipariş durumu |
| opened\_at | TIMESTAMPTZ | default now() | Sipariş açılış zamanı |
| closed\_at | TIMESTAMPTZ | NULLABLE | Hesap kapanış zamanı |
| total\_amount | NUMERIC(10,2) | default 0 | Kapanış anında hesaplanan toplam |

 

### **4.1.5 order\_items**

| Sütun | Tip | Kısıt | Açıklama |
| :---- | :---- | :---- | :---- |
| id | UUID | PK |  |
| order\_id | UUID | FK → orders.id, NOT NULL | Hangi sipariş |
| product\_id | UUID | FK → products.id, NOT NULL | Hangi ürün |
| quantity | INTEGER | NOT NULL, CHECK \> 0 | Adet |
| unit\_price | NUMERIC(10,2) | NOT NULL | Satış anındaki fiyat (snapshot) |
| created\_at | TIMESTAMPTZ | default now() |  |

 

| Tasarım Notu — unit\_price neden snapshot? Ürün fiyatı ileride değişebilir. order\_items.unit\_price, siparişin oluşturulduğu andaki fiyatı saklar. Bu sayede geçmiş siparişler doğru tutarda kalır; SRS FR-02 iş kuralını karşılar. |
| :---- |

 

### **4.1.6 expenses**

| Sütun | Tip | Kısıt | Açıklama |
| :---- | :---- | :---- | :---- |
| id | UUID | PK |  |
| description | VARCHAR(255) | NOT NULL | Gider açıklaması |
| quantity | NUMERIC(10,3) | NULLABLE | Miktar (kg, lt, adet...) |
| unit | VARCHAR(50) | NULLABLE | Birim (kg, lt, adet, kutu...) |
| unit\_price | NUMERIC(10,2) | NULLABLE | Birim fiyat |
| total\_amount | NUMERIC(10,2) | NOT NULL | quantity × unit\_price veya direkt giriş |
| category | VARCHAR(100) | NOT NULL | Gider kategorisi |
| expense\_date | DATE | NOT NULL, default today | Giderin oluştuğu tarih |
| created\_at | TIMESTAMPTZ | default now() |  |
| updated\_at | TIMESTAMPTZ | default now() |  |

 

### **4.1.7 revenue\_records**

Bir sipariş 'PAID' statüsüne geçtiğinde sistem otomatik olarak bu tabloya kayıt oluşturur. Raporlama sorguları buradan çalışır.

 

| Sütun | Tip | Kısıt | Açıklama |
| :---- | :---- | :---- | :---- |
| id | UUID | PK |  |
| order\_id | UUID | FK → orders.id, UNIQUE | 1 sipariş → 1 gelir kaydı |
| amount | NUMERIC(10,2) | NOT NULL | Kapanan sipariş tutarı |
| revenue\_date | DATE | NOT NULL | Hesap kapanış tarihi (raporlama için) |
| created\_at | TIMESTAMPTZ | default now() |  |

 

## **4.2 İndeksler**

 

| Tablo | İndeks Sütunu | Tür | Gerekçe |
| :---- | :---- | :---- | :---- |
| orders | table\_id, status | Composite | Aktif masa siparişi sorgusu (sık) |
| order\_items | order\_id | B-tree | Siparişe ait kalemleri getirme |
| expenses | expense\_date | B-tree | Aylık filtreleme sorguları |
| revenue\_records | revenue\_date | B-tree | Aylık gelir hesaplama |
| products | is\_active | Partial | Aktif ürün listeleme |

 

# **5\. API Tasarımı**

## **5.1 Genel Prensipler**

* RESTful API — kaynak odaklı URL yapısı

* Tüm yanıtlar JSON formatında

* Base URL: /api/v1

* Kimlik doğrulama: JWT Bearer token (Authorization: Bearer \<token\>)

* Tarih formatı: ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)

* Hata yanıtları: { error: { code, message, details? } }

 

## **5.2 Standart Yanıt Formatı**

   
// Başarılı yanıt

{

  "success": true,

  "data": { ... },

  "meta": { "page": 1, "total": 42 }   // Sayfalama varsa

}

   
// Hata yanıtı

{

  "success": false,

  "error": {

    "code": "PRODUCT\_NOT\_FOUND",

    "message": "Ürün bulunamadı.",

    "details": null

  }

}

 

## **5.3 Auth Endpoint'leri**

 

| Method | Endpoint | Açıklama | Auth |
| :---- | :---- | :---- | :---- |
| POST | /api/v1/auth/login | Kullanıcı girişi — JWT döndürür | Hayır |
| POST | /api/v1/auth/logout | Token geçersiz kılma | Evet |
| GET | /api/v1/auth/me | Mevcut kullanıcı bilgisi | Evet |

 

## **5.4 Ürün Endpoint'leri**

 

| Method | Endpoint | Açıklama | Request Body / Params |
| :---- | :---- | :---- | :---- |
| GET | /api/v1/products | Tüm aktif ürünleri listele | ?category=string (opsiyonel) |
| POST | /api/v1/products | Yeni ürün oluştur | { name, price, category? } |
| GET | /api/v1/products/:id | Tek ürün getir | — |
| PUT | /api/v1/products/:id | Ürün güncelle | { name?, price?, category? } |
| DELETE | /api/v1/products/:id | Ürünü pasif yap (soft) | — |

 

## **5.5 Masa ve Sipariş Endpoint'leri**

 

| Method | Endpoint | Açıklama | Request Body / Params |
| :---- | :---- | :---- | :---- |
| GET | /api/v1/tables | Tüm masaları durumlarıyla listele | — |
| GET | /api/v1/tables/:id/order | Masanın aktif siparişini getir | — |
| POST | /api/v1/tables/:id/order/items | Masaya ürün ekle | { productId, quantity } |
| DELETE | /api/v1/orders/:orderId/items/:itemId | Sipariş kalemini sil | — |
| POST | /api/v1/orders/:orderId/checkout | Hesabı kapat / ödendi işaretle | — |
| GET | /api/v1/orders/history | Geçmiş siparişler | ?from=date\&to=date |

 

| Tasarım Notu — POST /checkout akışı 1\. Order status OPEN → PAID güncellenir. 2\. orders.total\_amount hesaplanıp yazılır. 3\. orders.closed\_at \= now() set edilir. 4\. revenue\_records tablosuna kayıt oluşturulur. 5\. tables.status OCCUPIED → EMPTY güncellenir. Bu 5 adım tek bir veritabanı transaction içinde çalışır — atomiklik garantilenir. |
| :---- |

 

## **5.6 Gider Endpoint'leri**

 

| Method | Endpoint | Açıklama | Request Body / Params |
| :---- | :---- | :---- | :---- |
| GET | /api/v1/expenses | Gider listesi | ?from=date\&to=date\&category=string |
| POST | /api/v1/expenses | Yeni gider ekle | { description, quantity?, unit?, unitPrice?, totalAmount, category, expenseDate } |
| GET | /api/v1/expenses/:id | Tek gider getir | — |
| PUT | /api/v1/expenses/:id | Gider güncelle | { ...aynı alanlar } |
| DELETE | /api/v1/expenses/:id | Gider sil | — |

 

## **5.7 Rapor Endpoint'leri**

 

| Method | Endpoint | Açıklama | Request Params |
| :---- | :---- | :---- | :---- |
| GET | /api/v1/reports/monthly | Aylık gelir/gider/net özet | ?year=2025\&month=3 |
| GET | /api/v1/reports/monthly/trend | Son N aylık trend verisi | ?months=6 |
| GET | /api/v1/reports/expenses/breakdown | Kategori bazlı gider dağılımı | ?year=2025\&month=3 |

 

## **5.8 HTTP Durum Kodları**

 

| Kod | Kullanım Durumu |
| :---- | :---- |
| 200 OK | Başarılı GET, PUT, DELETE |
| 201 Created | Başarılı POST (yeni kayıt oluşturuldu) |
| 204 No Content | Başarılı DELETE (yanıt gövdesi yok) |
| 400 Bad Request | Validasyon hatası (Zod schema ihlali) |
| 401 Unauthorized | Token yok veya geçersiz |
| 403 Forbidden | Yetki yetersiz |
| 404 Not Found | Kayıt bulunamadı |
| 409 Conflict | Benzersizlik ihlali (örn: aynı ürün adı) |
| 422 Unprocessable | İş kuralı ihlali (örn: aktif siparişte ürün silme) |
| 500 Internal Server Error | Beklenmeyen sunucu hatası |

 

# **6\. Akış Diyagramları (Metin Temsili)**

Aşağıdaki akışlar, UML araçlarıyla diyagram oluşturulurken referans alınacak metin temsillerdir.

 

## **6.1 Kullanıcı Giriş Akışı**

 

| Adım | Aktör | Eylem | Sonuç |
| :---- | :---- | :---- | :---- |
| 1 | Kullanıcı | Login formunu doldurur (e-posta \+ şifre) | — |
| 2 | Frontend | POST /api/v1/auth/login çağrısı yapar | — |
| 3 | API | E-posta ile users tablosunu sorgular | — |
| 4a | API | Kullanıcı bulunamazsa | 401 döner → Hata mesajı |
| 4b | API | bcrypt.compare() ile şifre doğrular | — |
| 5a | API | Şifre yanlışsa | 401 döner → Hata mesajı |
| 5b | API | Şifre doğruysa JWT oluşturur | 200 \+ { token, user } döner |
| 6 | Frontend | Token'ı localStorage'a kaydeder | Dashboard'a yönlendirir |

 

## **6.2 Masaya Sipariş Ekleme Akışı**

 

| Adım | Aktör | Eylem | Sonuç / Kontrol |
| :---- | :---- | :---- | :---- |
| 1 | Kullanıcı | Masa planından masayı seçer | Masa detay paneli açılır |
| 2 | Frontend | GET /tables/:id/order çağrısı yapar | Aktif sipariş varsa getirir; yoksa boş panel |
| 3 | Kullanıcı | 'Ürün Ekle' butonuna basar; ürün ve adet seçer | — |
| 4 | Frontend | POST /tables/:id/order/items çağrısı yapar | — |
| 5a | API | Masa için OPEN sipariş yoksa | Yeni sipariş oluşturur; table.status \= OCCUPIED |
| 5b | API | OPEN sipariş varsa | Mevcut siparişe kalem ekler |
| 6 | API | order\_items kaydını yazar; unit\_price snapshot alır | 201 Created döner |
| 7 | Frontend | Sipariş listesini günceller (TanStack Query invalidate) | Toplam tutar anlık güncellenir |

 

## **6.3 Hesap Kapama Akışı**

 

| Adım | Aktör | Eylem | Sonuç / Kontrol |
| :---- | :---- | :---- | :---- |
| 1 | Kullanıcı | Hesap panelinde 'Hesabı Kapat' butonuna basar | — |
| 2 | Frontend | Onay diyaloğu gösterir (toplam tutar ile) | — |
| 3 | Kullanıcı | Onaylar | — |
| 4 | Frontend | POST /orders/:orderId/checkout çağrısı yapar | — |
| 5 | API (Transaction) | ORDER status: OPEN → PAID | — |
| 6 | API (Transaction) | order.total\_amount hesaplanıp yazılır | — |
| 7 | API (Transaction) | order.closed\_at \= now() | — |
| 8 | API (Transaction) | revenue\_records kaydı oluşturulur | — |
| 9 | API (Transaction) | table.status: OCCUPIED → EMPTY | — |
| 10 | API | Transaction commit | 200 döner |
| 11 | Frontend | Masa paneli kapanır; masa planı güncellenir | Masa artık 'Boş' görünür |

 

## **6.4 Aylık Rapor Hesaplama Akışı**

 

| Adım | Açıklama |
| :---- | :---- |
| 1 | Kullanıcı Raporlar ekranında yıl ve ay seçer. |
| 2 | Frontend GET /reports/monthly?year=\&month= çağırır. |
| 3 | API, revenue\_records tablosunu filtreler: WHERE revenue\_date BETWEEN ayın ilk günü AND son günü. |
| 4 | Toplam gelir: SUM(amount) from revenue\_records. |
| 5 | API, expenses tablosunu filtreler: WHERE expense\_date BETWEEN ... aynı aralık. |
| 6 | Toplam gider: SUM(total\_amount) from expenses. |
| 7 | Net kar \= Toplam Gelir − Toplam Gider. |
| 8 | Kategori kırılımı: expenses GROUP BY category, SUM(total\_amount). |
| 9 | Yanıt { totalRevenue, totalExpense, netProfit, expenseByCategory\[\] } döner. |
| 10 | Frontend kartları ve grafiği render eder. |

 

# **7\. Güvenlik Tasarımı**

## **7.1 Kimlik Doğrulama**

* JWT access token süresi: 60 dakika (SRS gereksinimi)

* Refresh token: 7 gün, HTTP-only cookie içinde saklanır

* Token yenileme: /auth/refresh endpoint'i üzerinden

* Şifreler minimum 8 karakter, bcrypt cost factor: 12

 

## **7.2 API Güvenliği**

* Tüm /api/v1/\* rotaları auth middleware'den geçer (login ve refresh hariç)

* Rate limiting: 100 istek/dakika per IP (express-rate-limit)

* Helmet.js ile güvenlik header'ları (CSP, HSTS, X-Frame-Options vb.)

* CORS: yalnızca frontend origin'e izin verilir

* Tüm input'lar Zod ile sunucu tarafında doğrulanır — SQL injection, XSS önlemi

 

## **7.3 Veritabanı Güvenliği**

* Prisma parametreli sorgular kullanır — SQL injection mümkün değil

* Veritabanı kullanıcısı yalnızca uygulama scheması üzerinde yetkili

* Connection string environment variable içinde (.env), repo'ya commit edilmez

 

# **8\. Hata Yönetimi**

## **8.1 Backend — Global Error Handler**

Express'te merkezi bir error handler middleware tüm hataları yakalar ve standart formata dönüştürür. Operasyonel hatalar (404, 422 vb.) kullanıcıya açık mesajla dönerken, programatik hatalar (500) loglama yapılır, istemciye yalnızca genel mesaj gönderilir.

 

## **8.2 Frontend — Hata Sınıflandırması**

 

| Hata Türü | Gösterim Stratejisi |
| :---- | :---- |
| 400 / 422 Validasyon | Form alanının altında inline hata mesajı |
| 401 Unauthorized | Kullanıcı login ekranına yönlendirilir, toast mesajı |
| 404 Not Found | İlgili bileşende 'Bulunamadı' empty state gösterilir |
| 409 Conflict | Toast bildirimi (örn: 'Bu ürün adı zaten kullanılıyor') |
| 500 Server Error | Genel hata toast'u \+ Sentry'ye log (opsiyonel) |
| Network Hatası | Toast: 'Bağlantı hatası. Lütfen tekrar deneyin.' |

 

# **9\. Geliştirme Ortamı ve Proje Yapısı**

## **9.1 Monorepo Yapısı**

   
cafems/

  apps/

    frontend/        ← React uygulaması (Vite)

    backend/         ← Express API

  packages/

    shared-types/    ← Ortak TypeScript tip tanımları

    shared-schemas/  ← Ortak Zod şemaları

  docker-compose.yml

  docker-compose.prod.yml

  .github/workflows/ ← CI/CD pipeline'ları

 

| Neden Monorepo? shared-types ve shared-schemas paketleri sayesinde frontend ve backend aynı TypeScript tiplerini kullanır. API değiştiğinde frontend'de tip hatası alınır — runtime'da değil, compile-time'da yakalanır. Araç: pnpm workspaces (npm/yarn workspaces da geçerlidir). |
| :---- |

 

## **9.2 CI/CD Pipeline**

 

| Aşama | Tetikleyici | Adımlar |
| :---- | :---- | :---- |
| Lint & Test | Her PR ve push | ESLint, TypeScript check, Vitest, Supertest |
| Build | main branch push | Frontend Vite build, Backend tsc compile |
| Deploy Staging | main branch push | Docker build → staging sunucu |
| Deploy Production | Tag push (v\*.\*.\*) | Docker build → production sunucu |

 

# **10\. Açık Teknik Kararlar**

Geliştirmeye başlanmadan önce aşağıdaki konularda ekip kararı alınmalıdır:

 

| \# | Konu | Seçenekler | Önerilen |
| :---- | :---- | :---- | :---- |
| T-01 | Masa sayısı yönetimi | Sabit (admin tanımlar) / Dinamik (kullanıcı ekler/siler) | Dinamik — admin panelinde masa ekle/sil |
| T-02 | Gider birim alanı | Serbest metin / Ön tanımlı liste / Her ikisi | Her ikisi — dropdown \+ serbest metin fallback |
| T-03 | Oturum stratejisi | Sadece access token / Access \+ Refresh token | Access \+ Refresh (güvenlik için) |
| T-04 | Sipariş geçmişi saklama | Süresiz / N yıl sonra arşiv | 12 ay aktif, sonra arşiv tablosu |
| T-05 | Frontend test stratejisi | Yalnızca unit / Unit \+ E2E (Playwright) | Unit \+ kritik akışlar için E2E |

 

# **11\. Onay**

Bu belge aşağıdaki paydaşlar tarafından incelenmiş ve onaylanmıştır:

 

| İsim | Rol | İmza | Tarih |
| :---- | :---- | :---- | :---- |
|  | Yazılım Mimarı / Senior Developer |  |  |
|  | İş Analisti |  |  |
|  | Proje Yöneticisi |  |  |

   
*— Belge Sonu —*