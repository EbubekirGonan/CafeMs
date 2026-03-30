import bcrypt from 'bcrypt';
import prisma from './prisma';

async function main() {
  // SDD 7.1 uyarınca şifre hashleme (cost factor: 12)
  const passwordHash = await bcrypt.hash('admin123', 12);

  // 1. Test Kullanıcısı Oluşturma
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cafems.com' },
    update: {},
    create: {
      email: 'admin@cafems.com',
      name: 'Admin User',
      passwordHash: passwordHash,
    },
  });

  console.log('✅ Test kullanıcısı oluşturuldu: admin@cafems.com / admin123');

  // 2. Mekan Bölümleri Oluşturma
  const venueSections = [
    { name: 'Giriş' },
    { name: 'Ara Bölüm' },
    { name: 'Bahçe Bölümü' },
  ];

  const createdSections: any[] = [];
  for (const section of venueSections) {
    const created = await prisma.venueSection.upsert({
      where: { name: section.name },
      update: {},
      create: section,
    });
    createdSections.push(created);
  }

  console.log(`✅ ${createdSections.length} adet mekan bölümü sisteme eklendi.`);

  // 3. Başlangıç Masalarını Oluşturma
  const initialTables = [
    { number: 1, capacity: 2, venueSectionId: createdSections[0].id },
    { number: 2, capacity: 2, venueSectionId: createdSections[0].id },
    { number: 3, capacity: 4, venueSectionId: createdSections[1].id },
    { number: 4, capacity: 4, venueSectionId: createdSections[1].id },
    { number: 5, capacity: 6, venueSectionId: createdSections[2].id },
    { number: 6, capacity: 8, venueSectionId: createdSections[2].id },
  ];

  for (const table of initialTables) {
    await prisma.table.upsert({
      where: { number: table.number },
      update: { venueSectionId: table.venueSectionId },
      create: table,
    });
  }

  console.log(`✅ ${initialTables.length} adet masa sisteme eklendi.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });