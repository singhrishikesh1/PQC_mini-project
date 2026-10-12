import { PrismaClient } from '@prisma/client'
import { createSeedData } from '../server/src/seedData'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Prisma PostgreSQL Database Seeding for GHRCEM...')
  const seed = createSeedData()

  // 1. Categories
  console.log('Seeding categories...')
  for (const cat of seed.categories) {
    await prisma.category.upsert({
      where: { code: cat.code },
      update: { name: cat.name, description: cat.description },
      create: { id: cat.id, name: cat.name, code: cat.code, description: cat.description },
    })
  }

  // 2. Members
  console.log('Seeding members...')
  for (const m of seed.members) {
    await prisma.member.upsert({
      where: { id: m.id },
      update: {
        name: m.name,
        email: m.email,
        phone: m.phone,
        membershipType: m.membershipType,
        membershipStatus: m.membershipStatus,
        registrationDate: m.registrationDate,
        expiryDate: m.expiryDate,
        department: m.department,
        rollNo: m.rollNo,
        registrationNumber: m.registrationNumber,
      },
      create: {
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        membershipType: m.membershipType,
        membershipStatus: m.membershipStatus,
        registrationDate: m.registrationDate,
        expiryDate: m.expiryDate,
        department: m.department,
        rollNo: m.rollNo,
        registrationNumber: m.registrationNumber,
      },
    })
  }

  // 3. Books & Copies
  console.log('Seeding books and copies...')
  for (const b of seed.books) {
    const book = await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {
        title: b.title,
        author: b.author,
        publisher: b.publisher,
        publicationYear: b.publicationYear,
        categoryId: b.categoryId,
        description: b.description,
        shelfLocation: b.shelfLocation,
        callNumber: b.callNumber,
      },
      create: {
        id: b.id,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        publisher: b.publisher,
        publicationYear: b.publicationYear,
        categoryId: b.categoryId,
        language: b.language,
        edition: b.edition,
        pageCount: b.pageCount,
        description: b.description,
        shelfLocation: b.shelfLocation,
        callNumber: b.callNumber,
      },
    })

    const bookCopies = seed.copies.filter(c => c.bookId === b.id)
    for (const c of bookCopies) {
      await prisma.bookCopy.upsert({
        where: { barcode: c.barcode },
        update: { status: c.status },
        create: {
          id: c.id,
          bookId: book.id,
          barcode: c.barcode,
          copyNumber: c.copyNumber,
          status: c.status,
        },
      })
    }
  }

  // 4. Settings
  console.log('Seeding library settings...')
  await prisma.librarySetting.upsert({
    where: { id: 'default' },
    update: seed.settings,
    create: { id: 'default', ...seed.settings },
  })

  console.log('✅ PostgreSQL Database Seeding Completed successfully!')
}

main()
  .catch(e => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
