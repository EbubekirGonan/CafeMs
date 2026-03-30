import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const venueSections = await prisma.venueSection.findMany({
    include: {
      tables: true,
    },
  });
  
  console.log('VenueSections found:', venueSections.length);
  venueSections.forEach(section => {
    console.log(`\n✅ ${section.name}`);
    console.log(`   ID: ${section.id}`);
    console.log(`   Tables: ${section.tables.map(t => t.number).join(', ')}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
