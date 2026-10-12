import type { Book, LibraryData, Loan, Member, Reservation, Fine, Notification } from './types'

const BASE_URL = '/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  const json = await res.json()
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed with status ${res.status}`)
  }
  return json as T
}

export const api = {
  // Health & Diagnostics
  getHealth: () => request<{ status: string; database: { orm: string; engine: string; connected: boolean } }>('/health'),

  // Full state snapshot
  getSnapshot: () => request<{ success: boolean; data: LibraryData }>('/settings/snapshot'),

  // Books
  getBooks: (params?: { search?: string; categoryId?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.categoryId) qs.set('categoryId', params.categoryId)
    return request<{ success: boolean; total: number; books: Book[] }>(`/books?${qs.toString()}`)
  },
  getBook: (id: string) => request<{ success: boolean; data: Book }>(`/books/${id}`),
  saveBook: (bookData: Partial<Book> & { copiesCount?: number }, existingId?: string) => {
    if (existingId) {
      return request<{ success: boolean; data: Book }>(`/books/${existingId}`, {
        method: 'PUT',
        body: JSON.stringify(bookData),
      })
    }
    return request<{ success: boolean; data: Book }>(`/books`, {
      method: 'POST',
      body: JSON.stringify(bookData),
    })
  },
  archiveBook: (id: string) => request<{ success: boolean; message: string }>(`/books/${id}`, { method: 'DELETE' }),
  manageCopies: (bookId: string, count: number) => request<{ success: boolean; totalCopies: number }>(`/books/${bookId}/copies`, {
    method: 'POST',
    body: JSON.stringify({ count }),
  }),

  // Members
  getMembers: (params?: { search?: string; type?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.type) qs.set('type', params.type)
    if (params?.status) qs.set('status', params.status)
    return request<{ success: boolean; count: number; data: Member[] }>(`/members?${qs.toString()}`)
  },
  getMember: (id: string) => request<{ success: boolean; data: Member }>(`/members/${id}`),
  saveMember: (memberData: Partial<Member>, existingId?: string) => {
    if (existingId) {
      return request<{ success: boolean; data: Member }>(`/members/${existingId}`, {
        method: 'PUT',
        body: JSON.stringify(memberData),
      })
    }
    return request<{ success: boolean; data: Member }>(`/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    })
  },

  // Circulation
  getLoans: (params?: { memberId?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.memberId) qs.set('memberId', params.memberId)
    if (params?.status) qs.set('status', params.status)
    return request<{ success: boolean; count: number; data: Loan[] }>(`/circulation/loans?${qs.toString()}`)
  },
  issueBook: (memberId: string, copyId: string, issueDate?: string, dueDate?: string) =>
    request<{ success: boolean; data: Loan }>(`/circulation/loans/issue`, {
      method: 'POST',
      body: JSON.stringify({ memberId, copyId, issueDate, dueDate }),
    }),
  returnBook: (loanId: string, condition?: 'available' | 'damaged' | 'lost') =>
    request<{ success: boolean; data: Loan }>(`/circulation/loans/${loanId}/return`, {
      method: 'POST',
      body: JSON.stringify({ condition }),
    }),
  renewLoan: (loanId: string) =>
    request<{ success: boolean; data: Loan }>(`/circulation/loans/${loanId}/renew`, {
      method: 'POST',
    }),

  // Reservations
  getReservations: (params?: { memberId?: string; bookId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.memberId) qs.set('memberId', params.memberId)
    if (params?.bookId) qs.set('bookId', params.bookId)
    return request<{ success: boolean; count: number; data: Reservation[] }>(`/reservations?${qs.toString()}`)
  },
  createReservation: (memberId: string, bookId: string) =>
    request<{ success: boolean; data: Reservation }>(`/reservations`, {
      method: 'POST',
      body: JSON.stringify({ memberId, bookId }),
    }),
  cancelReservation: (id: string) =>
    request<{ success: boolean; data: Reservation }>(`/reservations/${id}/cancel`, {
      method: 'POST',
    }),

  // Fines
  getFines: (params?: { memberId?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.memberId) qs.set('memberId', params.memberId)
    if (params?.status) qs.set('status', params.status)
    return request<{ success: boolean; count: number; data: Fine[] }>(`/circulation/fines?${qs.toString()}`)
  },
  payFine: (id: string) =>
    request<{ success: boolean; data: Fine }>(`/circulation/fines/${id}/pay`, {
      method: 'POST',
    }),
  waiveFine: (id: string, reason: string) =>
    request<{ success: boolean; data: Fine }>(`/circulation/fines/${id}/waive`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Notifications
  getNotifications: (memberId?: string) => {
    const qs = new URLSearchParams()
    if (memberId) qs.set('memberId', memberId)
    return request<{ success: boolean; count: number; data: Notification[] }>(`/notifications?${qs.toString()}`)
  },
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: (memberId?: string) =>
    request<{ success: boolean }>(`/notifications/read-all`, {
      method: 'POST',
      body: JSON.stringify({ memberId }),
    }),

  // Settings
  getSettings: () => request<{ success: boolean; data: LibraryData['settings'] }>('/settings'),
  updateSettings: (settings: Partial<LibraryData['settings']>) =>
    request<{ success: boolean; data: LibraryData['settings'] }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  resetDatabase: () => request<{ success: boolean; message: string }>('/settings/reset', { method: 'POST' }),

  // Analytics
  getAnalytics: () => request<{ success: boolean; data: any }>('/analytics'),
}
