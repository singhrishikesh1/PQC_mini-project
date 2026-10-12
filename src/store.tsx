import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { addDays, createSeedData, daysBetween, today } from './data'
import type { Book, BookCopy, LibraryData, Loan, Member, Reservation, Role } from './types'

type Toast = { id: number; message: string; tone: 'success' | 'error' | 'info' }
type ReturnCondition = 'available' | 'damaged' | 'lost'
type Store = {
  data: LibraryData; role: Role | null; setRole: (role: Role | null) => void; studentId: string
  toasts: Toast[]; toast: (message: string, tone?: Toast['tone']) => void; dismissToast: (id: number) => void
  issue: (memberId: string, copyId: string, issueDate?: string, dueDate?: string) => Loan
  returnLoan: (loanId: string, condition?: ReturnCondition) => void; renew: (loanId: string) => void
  saveBook: (book: Partial<Book> & Pick<Book, 'title' | 'author' | 'categoryId' | 'isbn'>, existingId?: string, copiesToAdd?: number) => void
  archiveBook: (bookId: string) => void; manageCopies: (bookId: string, count: number) => void
  saveMember: (member: Partial<Member> & Pick<Member, 'name' | 'email' | 'membershipType'>, existingId?: string) => void
  reserve: (memberId: string, bookId: string) => Reservation; cancelReservation: (id: string) => void
  markReservationReady: (id: string) => void; fulfillReservation: (id: string) => void
  payFine: (id: string) => void; waiveFine: (id: string, reason: string) => void
  readNotification: (id: string) => void; readAllNotifications: () => void
  updateSettings: (patch: Partial<LibraryData['settings']>) => void; resetData: () => void
}
const STORAGE_KEY = 'ghrcem-library-system-v6'
const ROLE_KEY = 'ghrcem-library-role-v5'
const DEFAULT_STUDENT: Member = {
  id: '25CO64',
  rollNo: '25CO64',
  registrationNumber: '25ACOE1101100',
  name: 'Hiya Shaikh',
  email: 'hiyashaikh3@gmail.com',
  phone: '+91 93097***78',
  membershipType: 'Student',
  membershipStatus: 'Active',
  registrationDate: '2025-09-10',
  expiryDate: '2029-05-31',
  department: 'Computer Engineering',
}
const StoreContext = createContext<Store | null>(null)
const freshId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
const validateMember = (data: LibraryData, memberId: string) => {
  const member = data.members.find(m => m.id === memberId)
  if (!member) throw new Error('Choose a valid member.')
  if (member.membershipStatus !== 'Active' || member.expiryDate < today()) throw new Error('This membership is not eligible to borrow.')
  if (data.loans.filter(l => l.memberId === memberId && l.status === 'active').length >= data.settings.maxActiveLoans) throw new Error(`This member has reached the ${data.settings.maxActiveLoans}-book borrowing limit.`)
  return member
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LibraryData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as LibraryData
        if (parsed.members && parsed.members.length >= 50) {
          const idx = parsed.members.findIndex(mem => mem.id === '25CO64')
          if (idx !== -1) {
            parsed.members[idx] = { ...parsed.members[idx], ...DEFAULT_STUDENT }
          } else {
            parsed.members.unshift(DEFAULT_STUDENT)
          }
          return parsed
        }
        return createSeedData()
      }
      return createSeedData()
    } catch {
      return createSeedData()
    }
  })
  const [role, setRoleState] = useState<Role | null>(() => {
    try {
      const savedRole = localStorage.getItem(ROLE_KEY)
      if (savedRole === 'librarian' || savedRole === 'student') return savedRole
      return 'student'
    } catch {
      return 'student'
    }
  })
  const setRole = (newRole: Role | null) => {
    setRoleState(newRole)
    try {
      if (newRole) localStorage.setItem(ROLE_KEY, newRole)
      else localStorage.removeItem(ROLE_KEY)
    } catch {}
  }
  const [toasts, setToasts] = useState<Toast[]>([])
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }, [data])
  const toast = (message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(current => [...current, { id, message, tone }])
    window.setTimeout(() => setToasts(current => current.filter(t => t.id !== id)), 3600)
  }
  const log = (state: LibraryData, action: string, entityType: string, entityId: string) => ({
    ...state, activity: [{ id: freshId('activity'), actorId: role === 'student' ? '25CO64' : 'mirkword', action, entityType, entityId, timestamp: new Date().toISOString() }, ...state.activity].slice(0, 80),
  })
  const issue = (memberId: string, copyId: string, issueDate = today(), dueDate?: string) => {
    const member = validateMember(data, memberId)
    const copy = data.copies.find(c => c.id === copyId)
    if (!copy || copy.status !== 'available') throw new Error('That physical copy is no longer available.')
    const book = data.books.find(b => b.id === copy.bookId)
    if (!book || book.archivedAt) throw new Error('Archived titles cannot be issued.')
    const validDueDate = dueDate || addDays(issueDate, data.settings.loanDurationDays)
    if (issueDate > validDueDate) throw new Error('The due date must be on or after the issue date.')
    const loan: Loan = { id: freshId('loan'), memberId, copyId, issueDate, dueDate: validDueDate, returnDate: null, renewalCount: 0, status: 'active' }
    setData(current => {
      const next = { ...current, loans: [loan, ...current.loans], copies: current.copies.map(c => c.id === copyId ? { ...c, status: 'loaned' as const } : c),
        notifications: [{ id: freshId('notification'), memberId, title: 'Book issued', message: `${book.title} has been checked out to you.`, type: 'returned' as const, createdAt: new Date().toISOString(), readAt: null }, ...current.notifications] }
      return log(next, `issued ${book.title} to ${member.name}`, 'loan', loan.id)
    })
    return loan
  }
  const returnLoan = (loanId: string, condition: ReturnCondition = 'available') => {
    const loan = data.loans.find(l => l.id === loanId && l.status === 'active')
    if (!loan) throw new Error('This loan is not active.')
    const copy = data.copies.find(c => c.id === loan.copyId)!
    const book = data.books.find(b => b.id === copy.bookId)!
    const nextReservation = condition === 'available' ? data.reservations.filter(r => r.bookId === book.id && r.status === 'pending').sort((a, b) => a.reservationDate.localeCompare(b.reservationDate))[0] : undefined
    const lateDays = Math.max(0, daysBetween(loan.dueDate))
    setData(current => {
      const updatedLoan = { ...loan, status: condition === 'lost' ? 'lost' as const : 'returned' as const, returnDate: condition === 'lost' ? null : today() }
      const next = { ...current, loans: current.loans.map(l => l.id === loanId ? updatedLoan : l),
        copies: current.copies.map(c => c.id === copy.id ? { ...c, status: nextReservation ? 'reserved' as const : condition } : c),
        reservations: nextReservation ? current.reservations.map(r => r.id === nextReservation.id ? { ...r, status: 'ready' as const } : r) : current.reservations,
        fines: lateDays > 0 && !current.fines.some(f => f.loanId === loanId) ? [{ id: freshId('fine'), loanId, amount: lateDays * current.settings.finePerDay, status: 'unpaid' as const, waivedReason: null, createdAt: today() }, ...current.fines] : current.fines,
        notifications: [
          { id: freshId('notification'), memberId: loan.memberId, title: condition === 'available' ? 'Book returned' : condition === 'lost' ? 'Loan marked lost' : 'Book returned damaged', message: condition === 'available' ? `${book.title} has been checked in.` : `${book.title} has been recorded as ${condition}.`, type: 'returned' as const, createdAt: new Date().toISOString(), readAt: null },
          ...(nextReservation ? [{ id: freshId('notification'), memberId: nextReservation.memberId, title: 'Reservation ready', message: `${book.title} is ready for collection.`, type: 'reservation' as const, createdAt: new Date().toISOString(), readAt: null }] : []),
          ...current.notifications,
        ] }
      return log(next, condition === 'available' ? `returned ${book.title}` : `recorded ${book.title} as ${condition}`, 'loan', loanId)
    })
  }
  const renew = (loanId: string) => {
    const loan = data.loans.find(l => l.id === loanId && l.status === 'active')
    if (!loan) throw new Error('Only active loans can be renewed.')
    if (daysBetween(loan.dueDate) > 0) throw new Error('Overdue loans cannot be renewed. Please return the book first.')
    if (loan.renewalCount >= data.settings.maxRenewals) throw new Error('This loan has reached its renewal limit.')
    const copy = data.copies.find(c => c.id === loan.copyId)!
    const book = data.books.find(b => b.id === copy.bookId)!
    if (data.reservations.some(r => r.bookId === book.id && ['pending', 'ready'].includes(r.status))) throw new Error('This title has a reservation queue and cannot be renewed.')
    setData(current => log({ ...current, loans: current.loans.map(l => l.id === loanId ? { ...l, dueDate: addDays(l.dueDate, current.settings.loanDurationDays), renewalCount: l.renewalCount + 1 } : l) }, `renewed ${book.title}`, 'loan', loanId))
  }
  const saveBook: Store['saveBook'] = (bookInput, existingId, copiesToAdd = 1) => {
    const duplicate = data.books.find(b => b.isbn === bookInput.isbn && b.id !== existingId)
    if (duplicate) throw new Error('A title with this ISBN already exists.')
    const id = existingId || freshId('book')
    const existing = data.books.find(b => b.id === existingId)
    const book: Book = { id, title: bookInput.title.trim(), author: bookInput.author.trim(), isbn: bookInput.isbn.trim(), publisher: bookInput.publisher || 'Independent Press',
      publicationYear: Number(bookInput.publicationYear) || new Date().getFullYear(), categoryId: bookInput.categoryId, description: bookInput.description || '', coverUrl: bookInput.coverUrl || '',
      language: bookInput.language || 'English', edition: bookInput.edition || '1st edition', pageCount: Number(bookInput.pageCount) || 240, shelfLocation: bookInput.shelfLocation || 'Floor 1 · A10',
      callNumber: bookInput.callNumber || 'QA 100.0', createdAt: existing?.createdAt || new Date().toISOString().slice(0, 10), archivedAt: existing?.archivedAt || null }
    const newCopies: BookCopy[] = !existingId ? Array.from({ length: Math.max(1, Math.min(30, Number(copiesToAdd) || 1)) }, (_, i) => ({ id: freshId('copy'), bookId: id, accessionNumber: `GH-${String(100 + data.copies.length + i).padStart(4, '0')}`, status: 'available', shelfLocation: book.shelfLocation })) : []
    setData(current => log({ ...current, books: existingId ? current.books.map(b => b.id === id ? book : b) : [book, ...current.books], copies: [...newCopies, ...current.copies] }, existingId ? `updated ${book.title}` : `added ${book.title}`, 'book', id))
  }
  const archiveBook = (bookId: string) => {
    const book = data.books.find(b => b.id === bookId)
    if (!book) throw new Error('Book not found.')
    if (data.copies.some(c => c.bookId === bookId && c.status === 'loaned')) throw new Error('Return all active copies before archiving this title.')
    setData(current => log({ ...current, books: current.books.map(b => b.id === bookId ? { ...b, archivedAt: today() } : b) }, `archived ${book.title}`, 'book', bookId))
  }
  const manageCopies = (bookId: string, count: number) => {
    const book = data.books.find(b => b.id === bookId)
    if (!book) throw new Error('Book not found.')
    if (!Number.isInteger(count) || count === 0 || Math.abs(count) > 50) throw new Error('Enter a whole number between −50 and 50, excluding zero.')
    const available = data.copies.filter(c => c.bookId === bookId && c.status === 'available')
    if (count < 0 && available.length < Math.abs(count)) throw new Error('You can only remove copies that are currently available.')
    setData(current => {
      let copies = current.copies
      if (count > 0) copies = [...Array.from({ length: count }, (_, i) => ({ id: freshId('copy'), bookId, accessionNumber: `GH-${String(100 + current.copies.length + i).padStart(4, '0')}`, status: 'available' as const, shelfLocation: book.shelfLocation })), ...current.copies]
      else { const remove = new Set(available.slice(0, Math.abs(count)).map(c => c.id)); copies = current.copies.filter(c => !remove.has(c.id)) }
      return log({ ...current, copies }, `${count > 0 ? 'added' : 'removed'} ${Math.abs(count)} copies of ${book.title}`, 'book', bookId)
    })
  }
  const saveMember: Store['saveMember'] = (input, existingId) => {
    if (!input.name.trim() || !input.email.trim()) throw new Error('Name and email are required.')
    if (data.members.some(m => m.email.toLowerCase() === input.email.toLowerCase() && m.id !== existingId)) throw new Error('A member with this email already exists.')
    const id = existingId || input.rollNo || freshId('member')
    const old = data.members.find(m => m.id === existingId)
    const member: Member = { id, name: input.name.trim(), email: input.email.trim(), phone: input.phone || '', membershipType: input.membershipType,
      membershipStatus: input.membershipStatus || 'Active', registrationDate: input.registrationDate || today(), expiryDate: input.expiryDate || addDays(new Date(), 365),
      rollNo: input.rollNo || old?.rollNo, registrationNumber: input.registrationNumber || old?.registrationNumber, department: input.department || old?.department }
    setData(current => log({ ...current, members: existingId ? current.members.map(m => m.id === id ? member : m) : [member, ...current.members] }, `${old ? 'updated' : 'registered'} ${member.name}`, 'member', id))
  }
  const reserve = (memberId: string, bookId: string) => {
    if (!data.members.some(m => m.id === memberId && m.membershipStatus === 'Active' && m.expiryDate >= today())) throw new Error('An active membership is required to reserve a book.')
    const book = data.books.find(b => b.id === bookId && !b.archivedAt)
    if (!book) throw new Error('This title is unavailable for reservation.')
    if (data.copies.some(c => c.bookId === bookId && c.status === 'available')) throw new Error('This title has copies available to borrow now.')
    if (data.reservations.some(r => r.bookId === bookId && r.memberId === memberId && ['pending', 'ready'].includes(r.status))) throw new Error('You already have an active reservation for this title.')
    const existingQueue = data.reservations.filter(r => r.bookId === bookId && ['pending', 'ready'].includes(r.status)).length
    const reservation: Reservation = { id: freshId('reservation'), memberId, bookId, reservationDate: today(), queuePosition: existingQueue + 1, status: 'pending' }
    setData(current => log({ ...current, reservations: [...current.reservations, reservation], notifications: [{ id: freshId('notification'), memberId, title: 'Reservation placed', message: `You are #${reservation.queuePosition} in the queue for ${book.title}.`, type: 'reservation', createdAt: new Date().toISOString(), readAt: null }, ...current.notifications] }, `reserved ${book.title}`, 'reservation', reservation.id))
    return reservation
  }
  const cancelReservation = (id: string) => {
    const reservation = data.reservations.find(r => r.id === id && ['pending', 'ready'].includes(r.status))
    if (!reservation) throw new Error('This reservation can no longer be cancelled.')
    setData(current => {
      let reservations = current.reservations.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r)
      const ordered = reservations.filter(r => r.bookId === reservation.bookId && ['pending', 'ready'].includes(r.status)).sort((a, b) => a.reservationDate.localeCompare(b.reservationDate))
      const nextPending = ordered.find(r => r.status === 'pending')
      const copy = current.copies.find(c => c.bookId === reservation.bookId && c.status === 'reserved')
      if (reservation.status === 'ready' && nextPending) reservations = reservations.map(r => r.id === nextPending.id ? { ...r, status: 'ready' as const } : r)
      const reordered = reservations.filter(r => r.bookId === reservation.bookId && ['pending', 'ready'].includes(r.status)).sort((a, b) => a.reservationDate.localeCompare(b.reservationDate))
      const positions = new Map(reordered.map((r, i) => [r.id, i + 1]))
      reservations = reservations.map(r => positions.has(r.id) ? { ...r, queuePosition: positions.get(r.id)! } : r)
      const next = { ...current, reservations,
        copies: copy && reservation.status === 'ready' && !nextPending ? current.copies.map(c => c.id === copy.id ? { ...c, status: 'available' as const } : c) : current.copies,
        notifications: reservation.status === 'ready' && nextPending ? [{ id: freshId('notification'), memberId: nextPending.memberId, title: 'Reservation ready', message: `A reserved copy is now ready for collection.`, type: 'reservation' as const, createdAt: new Date().toISOString(), readAt: null }, ...current.notifications] : current.notifications }
      return log(next, 'cancelled a reservation', 'reservation', id)
    })
  }
  const markReservationReady = (id: string) => {
    const reservation = data.reservations.find(r => r.id === id && r.status === 'pending')
    if (!reservation) throw new Error('This reservation is not pending.')
    const first = data.reservations.filter(r => r.bookId === reservation.bookId && r.status === 'pending').sort((a, b) => a.reservationDate.localeCompare(b.reservationDate))[0]
    if (first?.id !== id) throw new Error('Serve reservations in the order they were placed.')
    const copy = data.copies.find(c => c.bookId === reservation.bookId && c.status === 'available')
    if (!copy) throw new Error('There is no available copy to hold yet.')
    const book = data.books.find(b => b.id === reservation.bookId)!
    setData(current => log({ ...current, copies: current.copies.map(c => c.id === copy.id ? { ...c, status: 'reserved' as const } : c),
      reservations: current.reservations.map(r => r.id === id ? { ...r, status: 'ready' as const } : r),
      notifications: [{ id: freshId('notification'), memberId: reservation.memberId, title: 'Reservation ready', message: `${book.title} is ready for collection.`, type: 'reservation', createdAt: new Date().toISOString(), readAt: null }, ...current.notifications] }, 'prepared a reservation for collection', 'reservation', id))
  }
  const fulfillReservation = (id: string) => {
    const reservation = data.reservations.find(r => r.id === id && r.status === 'ready')
    if (!reservation) throw new Error('This reservation is not ready for collection.')
    validateMember(data, reservation.memberId)
    const copy = data.copies.find(c => c.bookId === reservation.bookId && c.status === 'reserved')
    if (!copy) throw new Error('The reserved copy could not be found.')
    const book = data.books.find(b => b.id === reservation.bookId)!
    const loan: Loan = { id: freshId('loan'), memberId: reservation.memberId, copyId: copy.id, issueDate: today(), dueDate: addDays(new Date(), data.settings.loanDurationDays), returnDate: null, renewalCount: 0, status: 'active' }
    setData(current => log({ ...current, loans: [loan, ...current.loans], copies: current.copies.map(c => c.id === copy.id ? { ...c, status: 'loaned' as const } : c),
      reservations: current.reservations.map(r => r.id === id ? { ...r, status: 'fulfilled' as const } : r),
      notifications: [{ id: freshId('notification'), memberId: reservation.memberId, title: 'Reservation collected', message: `${book.title} has been checked out to you.`, type: 'returned' as const, createdAt: new Date().toISOString(), readAt: null }, ...current.notifications] }, `fulfilled reservation for ${book.title}`, 'loan', loan.id))
  }
  const payFine = (id: string) => {
    const existingFine = data.fines.find(f => f.id === id)
    if (existingFine) { setData(current => log({ ...current, fines: current.fines.map(f => f.id === id ? { ...f, status: 'paid' as const } : f) }, 'recorded fine payment', 'fine', id)); return }
    const loan = data.loans.find(l => l.id === id && l.status === 'active' && daysBetween(l.dueDate) > 0)
    if (!loan) throw new Error('No unpaid fine is attached to this loan.')
    const fine = { id: freshId('fine'), loanId: loan.id, amount: daysBetween(loan.dueDate) * data.settings.finePerDay, status: 'paid' as const, waivedReason: null, createdAt: today() }
    setData(current => log({ ...current, fines: [fine, ...current.fines] }, 'recorded fine payment', 'fine', fine.id))
  }
  const waiveFine = (id: string, reason: string) => {
    if (!reason.trim()) throw new Error('Enter a reason for waiving this fine.')
    setData(current => log({ ...current, fines: current.fines.map(f => f.id === id ? { ...f, status: 'waived' as const, waivedReason: reason.trim() } : f) }, 'waived fine', 'fine', id))
  }
  const readNotification = (id: string) => setData(current => ({ ...current, notifications: current.notifications.map(n => n.id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n) }))
  const readAllNotifications = () => setData(current => ({ ...current, notifications: current.notifications.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() })) }))
  const updateSettings = (patch: Partial<LibraryData['settings']>) => setData(current => ({ ...current, settings: { ...current.settings, ...patch } }))
  const resetData = () => { setData(createSeedData()); localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(ROLE_KEY) }
  const value = useMemo<Store>(() => ({ data, role, setRole, studentId: '25CO64', toasts, toast, dismissToast: id => setToasts(current => current.filter(t => t.id !== id)),
    issue, returnLoan, renew, saveBook, archiveBook, manageCopies, saveMember, reserve, cancelReservation, markReservationReady, fulfillReservation, payFine, waiveFine, readNotification, readAllNotifications, updateSettings, resetData }), [data, role, toasts])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
export function useLibrary() { const value = useContext(StoreContext); if (!value) throw new Error('useLibrary must be used within LibraryProvider'); return value }
