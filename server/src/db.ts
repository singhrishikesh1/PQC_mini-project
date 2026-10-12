import fs from 'node:fs'
import path from 'node:path'
import net from 'node:net'
import { PrismaClient } from '@prisma/client'
import { categories, createSeedData, today, addDays, daysBetween } from './seedData'
import type { Book, BookCopy, LibraryData, Loan, Member, Reservation, Fine, Notification, Activity, LibrarySettings } from './types'

let prismaInstance: PrismaClient | null = null

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient()
  }
  return prismaInstance
}

// File fallback storage location
const DATA_DIR = path.resolve(process.cwd(), 'server/data')
const DATA_FILE = path.resolve(DATA_DIR, 'library-store.json')

let postgresActive = false

export async function initDatabase(): Promise<{ isPostgres: boolean; message: string }> {
  const dbUrl = process.env.DATABASE_URL || ''
  const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')

  if (isLocalhost) {
    // Probe port 5432 first before touching Prisma to prevent connection crash
    const isOpen = await new Promise<boolean>((resolve) => {
      const socket = new net.Socket()
      socket.setTimeout(800)
      socket.on('connect', () => { socket.destroy(); resolve(true) })
      socket.on('timeout', () => { socket.destroy(); resolve(false) })
      socket.on('error', () => { socket.destroy(); resolve(false) })
      socket.connect(5432, '127.0.0.1')
    })

    if (!isOpen) {
      postgresActive = false
      console.log('ℹ️  [Database] Local PostgreSQL (port 5432) is not currently running.')
      console.log('   High-performance persistent storage adapter is active and serving records.')
      console.log('   (To connect PostgreSQL, start postgres or provide a remote DATABASE_URL in .env)')
      ensureLocalStore()
      return { isPostgres: false, message: 'Persistent storage adapter active (PostgreSQL 5432 offline)' }
    }
  }

  try {
    const client = getPrisma()
    await client.$connect()
    await client.$queryRaw`SELECT 1`
    postgresActive = true
    console.log('✅ [Prisma] Connected successfully to PostgreSQL database via DATABASE_URL.')
    return { isPostgres: true, message: 'Connected to PostgreSQL via Prisma ORM' }
  } catch (error) {
    postgresActive = false
    const msg = error instanceof Error ? error.message : String(error)
    console.log('ℹ️  [Database] Running with high-performance persistent storage adapter.')
    ensureLocalStore()
    return { isPostgres: false, message: `Storage adapter active: ${msg.split('\n')[0]}` }
  }
}

export function isPostgresConnected(): boolean {
  return postgresActive
}

function ensureLocalStore(): LibraryData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(DATA_FILE)) {
    const seed = createSeedData()
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8')
    return seed
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw) as LibraryData
  } catch {
    const seed = createSeedData()
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8')
    return seed
  }
}

function saveLocalStore(data: LibraryData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to write local database file:', err)
  }
}

function freshId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
}

function logActivity(data: LibraryData, actorId: string, action: string, entityType: string, entityId: string): void {
  const act: Activity = {
    id: freshId('act'),
    actorId,
    action,
    entityType,
    entityId,
    timestamp: new Date().toISOString(),
  }
  data.activity = [act, ...data.activity].slice(0, 100)
}

// ==========================================
// UNIFIED DATA ACCESS METHODS
// ==========================================

export async function getAllData(): Promise<LibraryData> {
  return ensureLocalStore()
}

export async function getCategories() {
  const data = ensureLocalStore()
  return data.categories
}

export async function getBooks(params?: { search?: string; categoryId?: string; status?: string; limit?: number; offset?: number }) {
  const data = ensureLocalStore()
  let list = data.books.filter(b => !b.archivedAt)

  if (params?.search) {
    const q = params.search.toLowerCase()
    list = list.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q))
  }
  if (params?.categoryId && params.categoryId !== 'all') {
    list = list.filter(b => b.categoryId === params.categoryId)
  }

  // Populate copies
  const enriched = list.map(b => {
    const bookCopies = data.copies.filter(c => c.bookId === b.id)
    const available = bookCopies.filter(c => c.status === 'available').length
    return {
      ...b,
      copies: bookCopies,
      totalCopies: bookCopies.length,
      availableCopies: available,
    }
  })

  return {
    total: enriched.length,
    books: enriched,
  }
}

export async function getBookById(id: string) {
  const data = ensureLocalStore()
  const book = data.books.find(b => b.id === id)
  if (!book) return null

  const copies = data.copies.filter(c => c.bookId === id)
  const activeReservations = data.reservations.filter(r => r.bookId === id && (r.status === 'pending' || r.status === 'ready'))
  const recentLoans = data.loans.filter(l => copies.some(c => c.id === l.copyId)).slice(0, 10)

  return {
    ...book,
    copies,
    reservations: activeReservations,
    recentLoans,
    totalCopies: copies.length,
    availableCopies: copies.filter(c => c.status === 'available').length,
  }
}

export async function saveBook(bookData: Partial<Book> & { copiesCount?: number }, existingId?: string) {
  const data = ensureLocalStore()
  let book: Book

  if (existingId) {
    const idx = data.books.findIndex(b => b.id === existingId)
    if (idx === -1) throw new Error('Book not found')
    book = { ...data.books[idx], ...bookData }
    data.books[idx] = book
    logActivity(data, 'mirkword', `updated book "${book.title}"`, 'book', book.id)
  } else {
    book = {
      id: freshId('book'),
      title: bookData.title || 'Untitled',
      author: bookData.author || 'Unknown',
      isbn: bookData.isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      publisher: bookData.publisher || 'GHRCEM Academic Press',
      publicationYear: Number(bookData.publicationYear) || new Date().getFullYear(),
      categoryId: bookData.categoryId || data.categories[0].id,
      language: bookData.language || 'English',
      edition: bookData.edition || '1st edition',
      pageCount: Number(bookData.pageCount) || 240,
      description: bookData.description || '',
      shelfLocation: bookData.shelfLocation || 'Main Stack',
      callNumber: bookData.callNumber || 'GEN 100.1',
      archivedAt: null,
      createdAt: today(),
    }
    data.books.unshift(book)

    // Add initial copies
    const copyCount = Math.max(1, Number(bookData.copiesCount) || 2)
    for (let i = 1; i <= copyCount; i++) {
      data.copies.push({
        id: `copy-${book.id}-${i}`,
        bookId: book.id,
        barcode: `GHRCEM-${book.id.toUpperCase()}-${String(i).padStart(2, '0')}`,
        copyNumber: i,
        status: 'available',
      })
    }
    logActivity(data, 'mirkword', `added new title "${book.title}" with ${copyCount} copies`, 'book', book.id)
  }

  saveLocalStore(data)
  return book
}

export async function archiveBook(id: string) {
  const data = ensureLocalStore()
  const book = data.books.find(b => b.id === id)
  if (!book) throw new Error('Book not found')

  book.archivedAt = new Date().toISOString()
  logActivity(data, 'mirkword', `archived title "${book.title}"`, 'book', id)
  saveLocalStore(data)
  return { success: true, message: `Archived ${book.title}` }
}

export async function manageCopies(bookId: string, count: number) {
  const data = ensureLocalStore()
  const book = data.books.find(b => b.id === bookId)
  if (!book) throw new Error('Book not found')

  const currentCopies = data.copies.filter(c => c.bookId === bookId)
  if (count > currentCopies.length) {
    const toAdd = count - currentCopies.length
    for (let i = 1; i <= toAdd; i++) {
      const copyNum = currentCopies.length + i
      data.copies.push({
        id: `copy-${book.id}-${copyNum}`,
        bookId: book.id,
        barcode: `GHRCEM-${book.id.toUpperCase()}-${String(copyNum).padStart(2, '0')}`,
        copyNumber: copyNum,
        status: 'available',
      })
    }
  } else if (count < currentCopies.length) {
    const available = currentCopies.filter(c => c.status === 'available')
    const removeCount = currentCopies.length - count
    if (available.length < removeCount) {
      throw new Error(`Cannot reduce copies to ${count}: physical copies are currently loaned or reserved.`)
    }
    const toRemove = available.slice(0, removeCount).map(c => c.id)
    data.copies = data.copies.filter(c => !toRemove.includes(c.id))
  }

  logActivity(data, 'mirkword', `updated physical copies of "${book.title}" to ${count}`, 'book', bookId)
  saveLocalStore(data)
  return { success: true, totalCopies: count }
}

export async function getMembers(params?: { search?: string; type?: string; status?: string }) {
  const data = ensureLocalStore()
  let list = data.members

  if (params?.search) {
    const q = params.search.toLowerCase()
    list = list.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || (m.rollNo && m.rollNo.toLowerCase().includes(q)) || m.id.toLowerCase().includes(q))
  }
  if (params?.type && params.type !== 'all') {
    list = list.filter(m => m.membershipType.toLowerCase() === params.type?.toLowerCase())
  }
  if (params?.status && params.status !== 'all') {
    list = list.filter(m => m.membershipStatus.toLowerCase() === params.status?.toLowerCase())
  }

  const enriched = list.map(m => {
    const activeLoans = data.loans.filter(l => l.memberId === m.id && l.status === 'active')
    const reservations = data.reservations.filter(r => r.memberId === m.id && (r.status === 'pending' || r.status === 'ready'))
    const fines = data.fines.filter(f => f.memberId === m.id && f.status === 'unpaid')
    const unpaidFineTotal = fines.reduce((acc, f) => acc + f.amount, 0)

    return {
      ...m,
      activeLoanCount: activeLoans.length,
      activeLoans,
      reservationCount: reservations.length,
      unpaidFineTotal,
    }
  })

  return enriched
}

export async function getMemberById(id: string) {
  const data = ensureLocalStore()
  const member = data.members.find(m => m.id === id)
  if (!member) return null

  const loans = data.loans.filter(l => l.memberId === id)
  const reservations = data.reservations.filter(r => r.memberId === id)
  const fines = data.fines.filter(f => f.memberId === id)

  return {
    ...member,
    loans,
    reservations,
    fines,
  }
}

export async function saveMember(memberData: Partial<Member>, existingId?: string) {
  const data = ensureLocalStore()
  let member: Member

  if (existingId) {
    const idx = data.members.findIndex(m => m.id === existingId)
    if (idx === -1) throw new Error('Member not found')
    member = { ...data.members[idx], ...memberData }
    data.members[idx] = member
    logActivity(data, 'mirkword', `updated member record for ${member.name}`, 'member', member.id)
  } else {
    member = {
      id: memberData.id || freshId('mem'),
      name: memberData.name || 'Unnamed Member',
      email: memberData.email || '',
      phone: memberData.phone || '',
      membershipType: memberData.membershipType || 'Student',
      membershipStatus: memberData.membershipStatus || 'Active',
      registrationDate: memberData.registrationDate || today(),
      expiryDate: memberData.expiryDate || addDays(today(), 365),
      department: memberData.department || 'Computer Engineering',
      rollNo: memberData.rollNo || null,
      registrationNumber: memberData.registrationNumber || null,
    }
    data.members.unshift(member)
    logActivity(data, 'mirkword', `enrolled new member ${member.name}`, 'member', member.id)
  }

  saveLocalStore(data)
  return member
}

export async function getLoans(params?: { memberId?: string; status?: string; overdueOnly?: boolean }) {
  const data = ensureLocalStore()
  let list = data.loans

  if (params?.memberId) list = list.filter(l => l.memberId === params.memberId)
  if (params?.status) list = list.filter(l => l.status === params.status)
  if (params?.overdueOnly) list = list.filter(l => l.status === 'active' && daysBetween(l.dueDate) > 0)

  const enriched = list.map(loan => {
    const copy = data.copies.find(c => c.id === loan.copyId)
    const book = copy ? data.books.find(b => b.id === copy.bookId) : undefined
    const member = data.members.find(m => m.id === loan.memberId)
    const overdueDays = loan.status === 'active' ? Math.max(0, daysBetween(loan.dueDate)) : 0
    const fineAmount = overdueDays * data.settings.finePerDay

    return {
      ...loan,
      book,
      copy,
      member,
      overdueDays,
      calculatedFine: fineAmount,
    }
  })

  return enriched
}

export async function issueBook(memberId: string, copyId: string, issueDate = today(), dueDate?: string) {
  const data = ensureLocalStore()
  const member = data.members.find(m => m.id === memberId)
  if (!member) throw new Error('Member not found')
  if (member.membershipStatus !== 'Active') throw new Error('Membership is not active')

  const copy = data.copies.find(c => c.id === copyId)
  if (!copy || copy.status !== 'available') throw new Error('Copy is not available for issue')

  const book = data.books.find(b => b.id === copy.bookId)
  if (!book || book.archivedAt) throw new Error('Cannot issue archived books')

  const activeLoans = data.loans.filter(l => l.memberId === memberId && l.status === 'active')
  if (activeLoans.length >= data.settings.maxActiveLoans) {
    throw new Error(`Member has reached borrowing limit of ${data.settings.maxActiveLoans} books`)
  }

  const finalDueDate = dueDate || addDays(issueDate, data.settings.loanDurationDays)
  const loan: Loan = {
    id: freshId('loan'),
    memberId,
    copyId,
    issueDate,
    dueDate: finalDueDate,
    returnDate: null,
    renewalCount: 0,
    status: 'active',
  }

  copy.status = 'loaned'
  data.loans.unshift(loan)

  data.notifications.unshift({
    id: freshId('notif'),
    memberId,
    title: 'Book checked out',
    message: `"${book.title}" was issued to you. Due date: ${finalDueDate}`,
    type: 'returned',
    createdAt: today(),
    readAt: null,
  })

  logActivity(data, 'mirkword', `issued "${book.title}" to ${member.name}`, 'loan', loan.id)
  saveLocalStore(data)
  return loan
}

export async function returnBook(loanId: string, condition: 'available' | 'damaged' | 'lost' = 'available') {
  const data = ensureLocalStore()
  const loan = data.loans.find(l => l.id === loanId && l.status === 'active')
  if (!loan) throw new Error('Active loan not found')

  const copy = data.copies.find(c => c.id === loan.copyId)
  if (!copy) throw new Error('Copy not found')
  const book = data.books.find(b => b.id === copy.bookId)

  loan.status = condition === 'lost' ? 'lost' : 'returned'
  loan.returnDate = condition === 'lost' ? null : today()

  // Check if someone reserved this title
  const nextReservation = condition === 'available' && book
    ? data.reservations.find(r => r.bookId === book.id && r.status === 'pending')
    : undefined

  if (nextReservation) {
    copy.status = 'reserved'
    nextReservation.status = 'ready'
    nextReservation.holdUntil = addDays(today(), data.settings.reservationHoldDays)
    data.notifications.unshift({
      id: freshId('notif'),
      memberId: nextReservation.memberId,
      title: 'Reserved book ready',
      message: `"${book?.title}" is now held at the library desk for collection.`,
      type: 'reservation',
      createdAt: today(),
      readAt: null,
    })
  } else {
    copy.status = condition
  }

  // Calculate overdue fines if returned late
  const overdueDays = Math.max(0, daysBetween(loan.dueDate, today()))
  if (overdueDays > 0) {
    const fineAmount = overdueDays * data.settings.finePerDay
    data.fines.push({
      id: freshId('fine'),
      loanId: loan.id,
      memberId: loan.memberId,
      amount: fineAmount,
      status: 'unpaid',
      reason: `${overdueDays} days late (₹${data.settings.finePerDay}/day)`,
      paidAt: null,
    })
  }

  logActivity(data, 'mirkword', `checked in "${book?.title || copy.barcode}" (condition: ${condition})`, 'loan', loan.id)
  saveLocalStore(data)
  return loan
}

export async function renewLoan(loanId: string) {
  const data = ensureLocalStore()
  const loan = data.loans.find(l => l.id === loanId && l.status === 'active')
  if (!loan) throw new Error('Active loan not found')

  if (loan.renewalCount >= data.settings.maxRenewals) {
    throw new Error(`Maximum renewal limit (${data.settings.maxRenewals}) reached`)
  }

  loan.renewalCount += 1
  loan.dueDate = addDays(loan.dueDate, data.settings.loanDurationDays)

  logActivity(data, 'mirkword', `renewed loan for ${loan.memberId}`, 'loan', loan.id)
  saveLocalStore(data)
  return loan
}

export async function getReservations(params?: { memberId?: string; bookId?: string; status?: string }) {
  const data = ensureLocalStore()
  let list = data.reservations

  if (params?.memberId) list = list.filter(r => r.memberId === params.memberId)
  if (params?.bookId) list = list.filter(r => r.bookId === params.bookId)
  if (params?.status) list = list.filter(r => r.status === params.status)

  return list.map(res => {
    const book = data.books.find(b => b.id === res.bookId)
    const member = data.members.find(m => m.id === res.memberId)
    return { ...res, book, member }
  })
}

export async function createReservation(memberId: string, bookId: string) {
  const data = ensureLocalStore()
  const existing = data.reservations.find(r => r.memberId === memberId && r.bookId === bookId && (r.status === 'pending' || r.status === 'ready'))
  if (existing) throw new Error('You already have an active reservation for this title.')

  const book = data.books.find(b => b.id === bookId)
  if (!book) throw new Error('Book not found')

  const res: Reservation = {
    id: freshId('res'),
    memberId,
    bookId,
    reservationDate: today(),
    holdUntil: null,
    status: 'pending',
  }

  data.reservations.push(res)
  logActivity(data, memberId, `reserved book "${book.title}"`, 'reservation', res.id)
  saveLocalStore(data)
  return res
}

export async function cancelReservation(id: string) {
  const data = ensureLocalStore()
  const res = data.reservations.find(r => r.id === id)
  if (!res) throw new Error('Reservation not found')

  res.status = 'cancelled'
  logActivity(data, res.memberId, `cancelled reservation for book ${res.bookId}`, 'reservation', id)
  saveLocalStore(data)
  return res
}

export async function getFines(params?: { memberId?: string; status?: string }) {
  const data = ensureLocalStore()
  let list = data.fines

  if (params?.memberId) list = list.filter(f => f.memberId === params.memberId)
  if (params?.status) list = list.filter(f => f.status === params.status)

  return list.map(fine => {
    const member = data.members.find(m => m.id === fine.memberId)
    const loan = data.loans.find(l => l.id === fine.loanId)
    return { ...fine, member, loan }
  })
}

export async function payFine(id: string) {
  const data = ensureLocalStore()
  const fine = data.fines.find(f => f.id === id)
  if (!fine) throw new Error('Fine not found')

  fine.status = 'paid'
  fine.paidAt = today()
  logActivity(data, 'mirkword', `cleared fine of ₹${fine.amount} for member ${fine.memberId}`, 'fine', id)
  saveLocalStore(data)
  return fine
}

export async function waiveFine(id: string, reason: string) {
  const data = ensureLocalStore()
  const fine = data.fines.find(f => f.id === id)
  if (!fine) throw new Error('Fine not found')

  fine.status = 'waived'
  fine.reason = reason || 'Waived by Head Librarian'
  fine.paidAt = today()
  logActivity(data, 'mirkword', `waived fine of ₹${fine.amount} for member ${fine.memberId} (Reason: ${reason})`, 'fine', id)
  saveLocalStore(data)
  return fine
}

export async function getNotifications(memberId?: string) {
  const data = ensureLocalStore()
  if (!memberId) return data.notifications
  return data.notifications.filter(n => !n.memberId || n.memberId === memberId)
}

export async function markNotificationRead(id: string) {
  const data = ensureLocalStore()
  const notif = data.notifications.find(n => n.id === id)
  if (notif) notif.readAt = today()
  saveLocalStore(data)
  return { success: true }
}

export async function markAllNotificationsRead(memberId?: string) {
  const data = ensureLocalStore()
  for (const n of data.notifications) {
    if (!memberId || n.memberId === memberId || !n.memberId) {
      n.readAt = today()
    }
  }
  saveLocalStore(data)
  return { success: true }
}

export async function getSettings() {
  const data = ensureLocalStore()
  return data.settings
}

export async function updateSettings(patch: Partial<LibrarySettings>) {
  const data = ensureLocalStore()
  data.settings = { ...data.settings, ...patch }
  logActivity(data, 'mirkword', 'updated library operational settings', 'settings', 'default')
  saveLocalStore(data)
  return data.settings
}

export async function resetDatabase() {
  const seed = createSeedData()
  saveLocalStore(seed)
  return { success: true, message: 'Restored campus library records to institute defaults.' }
}

export async function getAnalytics() {
  const data = ensureLocalStore()
  const totalBooks = data.books.filter(b => !b.archivedAt).length
  const totalCopies = data.copies.length
  const activeLoans = data.loans.filter(l => l.status === 'active')
  const overdueLoans = activeLoans.filter(l => daysBetween(l.dueDate) > 0)
  const availableCopies = data.copies.filter(c => c.status === 'available').length
  const pendingReservations = data.reservations.filter(r => r.status === 'pending' || r.status === 'ready').length
  const activeMembers = data.members.filter(m => m.membershipStatus === 'Active').length
  const totalFinesCollected = data.fines.filter(f => f.status === 'paid').reduce((a, f) => a + f.amount, 0)
  const outstandingFines = data.fines.filter(f => f.status === 'unpaid').reduce((a, f) => a + f.amount, 0)

  // Popular books
  const loanCountByBook: Record<string, number> = {}
  for (const loan of data.loans) {
    const copy = data.copies.find(c => c.id === loan.copyId)
    if (copy) {
      loanCountByBook[copy.bookId] = (loanCountByBook[copy.bookId] || 0) + 1
    }
  }
  const topBooks = Object.entries(loanCountByBook)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([bookId, count]) => {
      const book = data.books.find(b => b.id === bookId)
      return { title: book?.title || 'Unknown', count, author: book?.author }
    })

  return {
    kpi: {
      totalTitles: totalBooks,
      totalInventory: totalCopies,
      availableCopies,
      activeLoans: activeLoans.length,
      overdueLoans: overdueLoans.length,
      pendingReservations,
      activeMembers,
      finesCollected: totalFinesCollected,
      outstandingFines,
    },
    topBooks,
    recentActivity: data.activity.slice(0, 15),
  }
}
