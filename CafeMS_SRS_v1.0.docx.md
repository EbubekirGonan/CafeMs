**YAZILIM GEREKSİNİM**

**BELİRTİM BELGESİ**

Software Requirements Specification (SRS)

 

   
**Kafe Yönetim Sistemi**

Cafe Management System (CafeMS)

| Alan | Bilgi |
| :---- | :---- |
| Belge Versiyonu | v1.0 |
| Hazırlayan | İş Analisti |
| Tarih | 28.03.2026 |
| Durum | Taslak |
| Hedef Kitle | Geliştirici Takımı, Proje Yöneticisi |

# **1\. Giriş**

## **1.1 Amaç**

Bu belge, Kafe Yönetim Sistemi (CafeMS) web uygulamasının yazılım gereksinimlerini tanımlamaktadır. Belge; sistemin işlevsel gereksinimlerini, kısıtlamalarını ve kullanım senaryolarını kapsamaktadır. Geliştirici takımı ve proje paydaşları arasında ortak bir anlayış oluşturmayı hedefler.

## **1.2 Kapsam**

CafeMS, küçük ve orta ölçekli kafelerin günlük operasyonlarını dijitalleştiren bir web uygulamasıdır. Sistem aşağıdaki temel işlevleri kapsar:

* Ürün ve fiyat yönetimi

* Masa bazlı sipariş takibi

* Hesap yönetimi ve ödeme kaydı

* Gider takibi

* Aylık gelir-gider analizi

 

## **1.3 Tanımlar ve Kısaltmalar**

 

| Terim / Kısaltma | Açıklama |
| :---- | :---- |
| CafeMS | Cafe Management System — bu projenin adı |
| Kullanıcı | Sisteme giriş yapan kafe sahibi veya yöneticisi |
| Masa | Kafe içindeki müşteri oturma birimi |
| Sipariş | Bir masaya bağlı ürün kalemleri listesi |
| Hesap | Bir masadaki aktif siparişin toplam tutarı |
| Gider | Kafe işletmesi için yapılan her türlü harcama |
| SRS | Software Requirements Specification |
| UI | User Interface — kullanıcı arayüzü |

 

## **1.4 Referans Belgeler**

* İş Analizi Toplantı Notları, 2026

* Prototip: Kafe Yönetim Sistemi (Mevcut interaktif taslak)

 

# **2\. Genel Tanım**

## **2.1 Ürün Perspektifi**

CafeMS, özel olarak geliştirilmiş bağımsız bir web uygulamasıdır. Mevcut üçüncü taraf POS (satış noktası) sistemleriyle entegrasyon ilk aşamada kapsam dışıdır. Sistem, modern web tarayıcıları üzerinden erişilebilir olacaktır.

## **2.2 Kullanıcı Profili**

Sistemin birincil kullanıcısı kafe sahibi veya yöneticisidir. Teknik bilgisi sınırlı olabilir; dolayısıyla arayüz sade ve öğrenme eğrisi düşük olacak şekilde tasarlanmalıdır.

 

| Kullanıcı Türü | Teknik Yetkinlik | Sorumluluklar |
| :---- | :---- | :---- |
| Kafe Sahibi / Yöneticisi | Düşük – Orta | Tüm modüllere erişim; ürün, sipariş, gider yönetimi |
| Kasiyer / Garson (gelecek faz) | Düşük | Sipariş alma, hesap kapama (kapsam dışı — v1.0) |

 

## **2.3 Genel Kısıtlamalar**

* Sistem yalnızca web tarayıcı üzerinden erişilebilir olacaktır (mobil uyumlu tasarım önerilir).

* v1.0 kapsamında tek kullanıcı (kafe sahibi) yönetimi hedeflenmektedir.

* Çevrimiçi ödeme entegrasyonu (kredi kartı, iyzico vb.) ilk aşamada kapsam dışıdır.

* Sistem Türkçe dil desteğiyle geliştirilecektir.

 

# **3\. Fonksiyonel Gereksinimler**

## **3.1 Modül: Ürün ve Menü Yönetimi**

Bu modül, kafe menüsündeki ürünlerin tanımlanmasını ve güncellenmesini sağlar.

 

### **FR-01: Ürün Ekleme**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-01 |
| Öncelik | Yüksek |
| Açıklama | Kullanıcı sisteme yeni bir ürün ekleyebilmelidir. |
| Girdi | Ürün adı (zorunlu), fiyat (zorunlu, pozitif sayı), kategori (opsiyonel) |
| Çıktı | Ürün sisteme kaydedilir ve ürün listesinde görünür. |
| İş Kuralı | Aynı isimde ürün eklenemez. Fiyat sıfırdan büyük olmalıdır. |

 

### **FR-02: Ürün Güncelleme**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-02 |
| Öncelik | Yüksek |
| Açıklama | Kullanıcı mevcut bir ürünün adını ve fiyatını güncelleyebilmelidir. |
| İş Kuralı | Güncelleme, daha önce bu ürünle oluşturulmuş siparişleri geriye dönük etkilemez. |

 

### **FR-03: Ürün Silme**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-03 |
| Öncelik | Orta |
| Açıklama | Kullanıcı bir ürünü sistemden silebilmelidir. |
| İş Kuralı | Aktif (açık) bir siparişte bulunan ürün silinemez. Kullanıcı uyarılır. |

 

### **FR-04: Ürün Listeleme**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-04 |
| Öncelik | Yüksek |
| Açıklama | Kullanıcı tüm ürünleri isim ve fiyat bilgisiyle listeleyebilmelidir. |
| Çıktı | Ürün adı, fiyat, kategori (varsa) sütunlarından oluşan tablo görünümü. |

 

## **3.2 Modül: Masa ve Sipariş Yönetimi**

Bu modül, masaların durumunu ve her masaya ait siparişlerin yönetimini kapsar.

 

### **FR-05: Masa Görüntüleme**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-05 |
| Öncelik | Yüksek |
| Açıklama | Kullanıcı tüm masaları ve her masanın durumunu (Boş / Dolu) görebilmelidir. |
| Çıktı | Masa kartları; masa numarası, durum (Boş/Dolu) ve varsa toplam tutar gösterilir. |

 

### **FR-06: Masaya Sipariş Ekleme**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-06 |
| Öncelik | Yüksek |
| Açıklama | Kullanıcı bir masayı seçerek ürün ekleyebilmeli ve adet belirleyebilmelidir. |
| Girdi | Masa seçimi, ürün seçimi, adet |
| Çıktı | Seçilen ürün masanın sipariş listesine eklenir. Masa durumu 'Dolu' olarak işaretlenir. |
| İş Kuralı | Eklenecek ürün sistemde kayıtlı ürünler arasından seçilir; serbest metin girişi yoktur. |

 

### **FR-07: Masadan Ürün Çıkarma**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-07 |
| Öncelik | Yüksek |
| Açıklama | Kullanıcı masanın sipariş listesinden bir ürünü kaldırabilmelidir. |
| İş Kuralı | Tüm ürünler kaldırılırsa masa durumu otomatik olarak 'Boş' olarak güncellenir. |

 

### **FR-08: Masa Hesabını Görüntüleme**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-08 |
| Öncelik | Yüksek |
| Açıklama | Kullanıcı seçili bir masanın sipariş detaylarını ve toplam tutarını görebilmelidir. |
| Çıktı | Ürün adı, adet, birim fiyat, kalem toplamı ve genel toplam listelenir. |

 

### **FR-09: Hesabı Ödendi Olarak İşaretleme**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-09 |
| Öncelik | Yüksek |
| Açıklama | Kullanıcı bir masanın hesabını 'Ödendi' olarak kapatabilmelidir. |
| Çıktı | Sipariş gelir kaydına eklenir. Masa durumu 'Boş' olarak güncellenir. Sipariş geçmişte saklanır. |
| İş Kuralı | Ödendi işaretlenen hesap düzenlenemez; yalnızca geçmiş kayıtlarda görünür. |

 

## **3.3 Modül: Gider Yönetimi**

Bu modül, kafe işletmesine ait satın alımların ve harcamaların kaydedilmesini sağlar.

 

### **FR-10: Gider Kaydı Ekleme**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-10 |
| Öncelik | Yüksek |
| Açıklama | Kullanıcı satın aldığı malzeme veya yaptığı harcamayı sisteme girebilmelidir. |
| Girdi | Açıklama (zorunlu), miktar/adet, birim (kg / lt / adet / kutu / vb.), birim fiyat, tarih, kategori |
| Çıktı | Gider kaydı sisteme eklenir; toplam tutar otomatik hesaplanır (miktar × birim fiyat). |
| İş Kuralı | Birim alanı serbest metin veya ön tanımlı listeden seçilebilir. Tarih varsayılan olarak bugün gelir. |

 

### **FR-11: Gider Kategorileri**

Sistem aşağıdaki varsayılan gider kategorilerini sunmalıdır (kullanıcı gerekirse ekleyebilir):

* Hammadde / Malzeme

* Faturalar (elektrik, su, doğalgaz, internet)

* Kira

* Personel ödemeleri

* Ekipman / Bakım

* Diğer

 

### **FR-12: Gider Düzenleme ve Silme**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-12 |
| Öncelik | Orta |
| Açıklama | Kullanıcı mevcut bir gider kaydını düzenleyebilmeli veya silebilmelidir. |
| İş Kuralı | Silinen gider kalıcı olarak kaldırılır; aylık raporlara yansımaz. |

 

### **FR-13: Gider Listeleme ve Filtreleme**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-13 |
| Öncelik | Orta |
| Açıklama | Kullanıcı gider kayıtlarını tarih aralığına veya kategoriye göre filtreleyerek listeleyebilmelidir. |

 

## **3.4 Modül: Gelir-Gider Takibi ve Raporlama**

Bu modül, aylık bazda işletmenin finansal özetini sunar.

 

### **FR-14: Aylık Gelir Özeti**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-14 |
| Öncelik | Yüksek |
| Açıklama | Kullanıcı seçilen aya ait toplam satış gelirini görebilmelidir. |
| Çıktı | Toplam gelir, işlem sayısı, günlük ortalama. |

 

### **FR-15: Aylık Gider Özeti**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-15 |
| Öncelik | Yüksek |
| Açıklama | Kullanıcı seçilen aya ait toplam gideri ve kategori bazlı dağılımını görebilmelidir. |
| Çıktı | Toplam gider, kategori bazlı kırılım tablosu. |

 

### **FR-16: Net Kar/Zarar Gösterimi**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-16 |
| Öncelik | Yüksek |
| Açıklama | Sistem seçilen aya ait net kar veya zarar tutarını otomatik hesaplayıp göstermelidir. |
| Hesaplama | Net Kar \= Toplam Gelir − Toplam Gider |
| Çıktı | Net tutar; pozitifse yeşil (kar), negatifse kırmızı (zarar) rengiyle gösterilir. |

 

### **FR-17: Aylık Karşılaştırma**

| Alan | Detay |
| :---- | :---- |
| Gereksinim ID | FR-17 |
| Öncelik | Düşük |
| Açıklama | Kullanıcı son 6 veya 12 aylık gelir-gider trendini grafiksel olarak görebilmelidir. |
| Çıktı | Çubuk veya çizgi grafik; gelir (yeşil) ve gider (kırmızı) serisi. |

 

# **4\. Fonksiyonel Olmayan Gereksinimler**

## **4.1 Performans**

* Sayfa yükleme süresi 3 saniyenin altında olmalıdır (standart internet bağlantısı için).

* Sipariş ekleme ve hesap kapama işlemleri 1 saniye içinde sonuçlanmalıdır.

 

## **4.2 Kullanılabilirlik**

* Arayüz Türkçe olmalı; teknik terim kullanımı minimumda tutulmalıdır.

* Masaüstü ve tablet cihazlarda düzgün görüntülenmelidir (responsive tasarım).

* Kritik işlemler (hesap kapama, gider silme) onay diyaloğu ile doğrulanmalıdır.

 

## **4.3 Güvenlik**

* Sisteme erişim kullanıcı adı ve şifre ile korunmalıdır (kimlik doğrulama zorunlu).

* Oturum süresi hareketsizlik sonrası otomatik sonlanmalıdır (önerilen: 60 dakika).

* Şifreler veritabanında hashlenerek saklanmalıdır (bcrypt veya eşdeğeri).

 

## **4.4 Güvenilirlik**

* Sistem 7/24 erişilebilir olmalı; planlı bakım saatleri dışında kesinti kabul edilemez.

* Veri kaybı önlemek için günlük otomatik yedekleme yapılandırılmalıdır.

 

## **4.5 Sürdürülebilirlik**

* Kod modüler yapıda yazılmalı; her modül bağımsız güncellenebilir olmalıdır.

* API tabanlı mimari tercih edilmeli; ileriki aşamada mobil uygulama entegrasyonuna hazır olmalıdır.

 

# **5\. Veri Modeli (Özet)**

Aşağıda sistemin temel varlıkları ve aralarındaki ilişkiler özetlenmektedir.

 

| Varlık | Temel Alanlar | İlişkiler |
| :---- | :---- | :---- |
| Urun | id, ad, fiyat, kategori, aktif | SiparisKalemi ile 1-N |
| Masa | id, numara, kapasite, durum (Boş/Dolu) | Siparis ile 1-N |
| Siparis | id, masa\_id, acilis\_zamani, durum (Açık/Ödendi) | Masa ile N-1; SiparisKalemi ile 1-N |
| SiparisKalemi | id, siparis\_id, urun\_id, adet, birim\_fiyat | Siparis ile N-1; Urun ile N-1 |
| Gider | id, aciklama, miktar, birim, birim\_fiyat, toplam, kategori, tarih | Bağımsız varlık |
| GelirKaydi | id, siparis\_id, tutar, tarih | Siparis ile 1-1 (hesap kapanınca oluşur) |

 

# **6\. Kullanım Senaryoları (Use Cases)**

## **UC-01: Masaya Sipariş Alma ve Hesap Kapama**

| Alan | Detay |
| :---- | :---- |
| Aktör | Kafe Sahibi / Garson |
| Ön Koşul | Kullanıcı giriş yapmış; ürünler sisteme eklenmiş. |
| Ana Akış | 1\. Kullanıcı masa planını açar.2. İlgili masayı seçer.3. Ürün ekler (ürün seç, adet belirle).4. İsterse ürün çıkarır.5. Hesabı görüntüler.6. 'Hesabı Kapat / Ödendi' butonuna basar.7. Sistem siparişi kapatır, masayı boşaltır, gelir kaydı oluşturur. |
| Alternatif Akış | 6a. Kullanıcı hesabı kapatmadan önce ürün ekler veya çıkarır — sistem tutarı anında günceller. |
| Son Koşul | Masa boş durumuna geçer; gelir raporuna tutar yansır. |

 

## **UC-02: Gider Girişi**

| Alan | Detay |
| :---- | :---- |
| Aktör | Kafe Sahibi |
| Ön Koşul | Kullanıcı giriş yapmış. |
| Ana Akış | 1\. Kullanıcı Giderler modülünü açar.2. 'Yeni Gider' formunu doldurur: açıklama, miktar, birim, birim fiyat, kategori, tarih.3. Kaydet butonuna basar.4. Sistem toplam tutarı hesaplar ve kaydeder. |
| Son Koşul | Gider kaydı sisteme eklenir; aylık gider özetine yansır. |

 

## **UC-03: Aylık Rapor İnceleme**

| Alan | Detay |
| :---- | :---- |
| Aktör | Kafe Sahibi |
| Ön Koşul | Kullanıcı giriş yapmış; en az bir gelir veya gider kaydı mevcut. |
| Ana Akış | 1\. Kullanıcı Raporlar modülünü açar.2. Ay ve yıl seçer.3. Sistem toplam gelir, toplam gider ve net kar/zarar hesaplar.4. Kategori bazlı gider dağılımı tablosu ve trend grafiği gösterilir. |
| Son Koşul | Kullanıcı seçilen dönemin finansal özetini görür. |

 

# **7\. Gereksinim Öncelik Matrisi**

Aşağıdaki tablo MoSCoW metoduna göre önceliklendirme yapmaktadır.

 

| Gereksinim | Açıklama | Öncelik |
| :---- | :---- | :---- |
| FR-01 – FR-04 | Ürün yönetimi (ekleme, güncelleme, silme, listeleme) | Must Have |
| FR-05 – FR-09 | Masa ve sipariş yönetimi, hesap kapama | Must Have |
| FR-10 – FR-11 | Gider kaydı ekleme ve kategorilendirme | Must Have |
| FR-14 – FR-16 | Aylık gelir, gider ve net kar özeti | Must Have |
| FR-12 – FR-13 | Gider düzenleme, silme ve filtreleme | Should Have |
| FR-17 | Aylık trend grafiği | Should Have |
| Çoklu kullanıcı / rol yönetimi | Garson, kasiyer rolleri | Won't Have (v1.0) |
| Online ödeme entegrasyonu | iyzico, Stripe vb. | Won't Have (v1.0) |
| Stok / Envanter takibi | Hammadde stok yönetimi | Won't Have (v1.0) |

 

# **8\. Açık Noktalar ve Kararlaştırılacak Konular**

 

| \# | Konu | Sorumlu | Hedef Tarih |
| :---- | :---- | :---- | :---- |
| 1 | Masa sayısı kullanıcı tarafından mı tanımlanacak, yoksa sabit mi olacak? | Ürün Sahibi | — |
| 2 | Gider birim listesi: Ön tanımlı mı, serbest metin mi, yoksa ikisi birden mi? | İş Analisti | — |
| 3 | Hesap kapatma sırasında ödeme yöntemi (nakit / kart) kaydedilecek mi? | Ürün Sahibi | — |
| 4 | Sipariş geçmişi ne kadar süre tutulacak? (örn. 1 yıl) | Teknik Takım | — |
| 5 | Uygulama hangi teknoloji stack'iyle geliştirilecek? (React, Vue, backend framework) | Teknik Takım | — |

 

# **9\. Onay**

Aşağıdaki paydaşlar bu belgeyi incelemiş ve onaylamıştır:

 

| İsim | Rol | İmza | Tarih |
| :---- | :---- | :---- | :---- |
|  | Kafe Sahibi / Ürün Sahibi |  |  |
|  | İş Analisti |  |  |
|  | Baş Geliştirici |  |  |

   
*— Belge Sonu —*