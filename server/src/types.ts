export interface Category {
  id: string
  name: string
  code: string
  description: string
}

export interface BookCopy {
  id: string
  bookId: string
  barcode: string
  copyNumber: number
  status: 'available' | 'loaned' | 'reserved' | 'damaged' | 'lost'
  createdAt?: string
}

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  publisher: string
  publicationYear: number
  categoryId: string
  language: string
  edition: string
  pageCount: number
  description: string
  coverUrl?: string | null
  shelfLocation: string
  callNumber: string
  archivedAt?: string | null
  createdAt?: string
  copies?: BookCopy[]
}

export interface Member {
  id: string
  rollNo?: string | null
  registrationNumber?: string | null
  name: string
  email: string
  phone: string
  membershipType: 'Student' | 'Faculty' | 'Staff'
  membershipStatus: 'Active' | 'Expired' | 'Suspended'
  registrationDate: string
  expiryDate: string
  department: string
}

export interface Loan {
  id: string
  memberId: string
  copyId: string
  issueDate: string
  dueDate: string
  returnDate: string | null
  renewalCount: number
  status: 'active' | 'returned' | 'lost'
}

export interface Reservation {
  id: string
  memberId: string
  bookId: string
  reservationDate: string
  holdUntil: string | null
  status: 'pending' | 'ready' | 'fulfilled' | 'cancelled'
}

export interface Fine {
  id: string
  loanId: string
  memberId: string
  amount: number
  status: 'unpaid' | 'paid' | 'waived'
  reason?: string | null
  paidAt?: string | null
}

export interface Notification {
  id: string
  memberId: string | null
  title: string
  message: string
  type: 'due' | 'overdue' | 'reservation' | 'returned' | 'announcement'
  createdAt: string
  readAt: string | null
}

export interface Activity {
  id: string
  actorId: string
  action: string
  entityType: string
  entityId: string
  timestamp: string
}

export interface LibrarySettings {
  libraryName: string
  contactEmail: string
  address: string
  phone: string
  hours: string
  loanDurationDays: number
  maxActiveLoans: number
  maxRenewals: number
  finePerDay: number
  reservationHoldDays: number
}

export interface LibraryData {
  categories: Category[]
  books: Book[]
  copies: BookCopy[]
  members: Member[]
  loans: Loan[]
  reservations: Reservation[]
  fines: Fine[]
  notifications: Notification[]
  activity: Activity[]
  settings: LibrarySettings
}
