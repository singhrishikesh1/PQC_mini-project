export type Role = 'librarian' | 'student'
export type CopyStatus = 'available' | 'loaned' | 'reserved' | 'lost' | 'damaged'
export type MembershipType = 'Student' | 'Faculty' | 'Staff'
export type MembershipStatus = 'Active' | 'Suspended' | 'Expired'
export type LoanStatus = 'active' | 'returned' | 'lost'
export type ReservationStatus = 'pending' | 'ready' | 'fulfilled' | 'cancelled' | 'expired'
export type FineStatus = 'unpaid' | 'paid' | 'waived'

export interface Category { id: string; name: string; description: string }
export interface Book {
  id: string; title: string; author: string; isbn: string; publisher: string; publicationYear: number
  categoryId: string; description: string; coverUrl: string; language: string; edition: string; pageCount: number
  shelfLocation: string; callNumber: string; createdAt: string; archivedAt: string | null
}
export interface BookCopy { id: string; bookId: string; accessionNumber: string; status: CopyStatus; shelfLocation: string }
export interface Member {
  id: string; name: string; email: string; phone: string; membershipType: MembershipType
  membershipStatus: MembershipStatus; registrationDate: string; expiryDate: string
}
export interface Loan {
  id: string; memberId: string; copyId: string; issueDate: string; dueDate: string; returnDate: string | null
  renewalCount: number; status: LoanStatus
}
export interface Reservation {
  id: string; memberId: string; bookId: string; reservationDate: string; queuePosition: number; status: ReservationStatus
}
export interface Fine { id: string; loanId: string; amount: number; status: FineStatus; waivedReason: string | null; createdAt: string }
export interface Notification {
  id: string; memberId: string | null; title: string; message: string; type: 'due' | 'overdue' | 'reservation' | 'returned' | 'announcement'
  createdAt: string; readAt: string | null; href?: string
}
export interface ActivityLog { id: string; actorId: string; action: string; entityType: string; entityId: string; timestamp: string }
export interface Settings {
  libraryName: string; address: string; contactEmail: string; phone: string; hours: string
  loanDurationDays: number; maxActiveLoans: number; maxRenewals: number; finePerDay: number; reservationHoldDays: number
}
export interface LibraryData {
  categories: Category[]; books: Book[]; copies: BookCopy[]; members: Member[]; loans: Loan[]
  reservations: Reservation[]; fines: Fine[]; notifications: Notification[]; activity: ActivityLog[]; settings: Settings
}
