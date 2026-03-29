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

  // 2. Başlangıç Masalarını Oluşturma
  const initialTables = [
    { number: 1, capacity: 2 },
    { number: 2, capacity: 2 },
    { number: 3, capacity: 4 },
    { number: 4, capacity: 4 },
    { number: 5, capacity: 6 },
    { number: 6, capacity: 8 },
  ];

  for (const table of initialTables) {
    await prisma.table.upsert({
      where: { number: table.number },
      update: {},
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