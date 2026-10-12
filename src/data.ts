import type { Book, BookCopy, Category, Fine, LibraryData, Member, Notification, Reservation } from './types'

const DAY = 86_400_000
export const dateOnly = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
export const addDays = (value: string | Date, days: number) => {
  const date = typeof value === 'string' ? value.slice(0, 10) : dateOnly(value)
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}
export const today = () => dateOnly(new Date())
export const daysBetween = (from: string, to = today()) => Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY)

export const categories: Category[] = [
  ['cat-cs', 'Computer Science', 'Systems, networks, and computing'], ['cat-prog', 'Programming', 'Languages and software craft'],
  ['cat-ai', 'Artificial Intelligence', 'Machine learning and intelligent systems'], ['cat-science', 'Science', 'The natural world and discovery'],
  ['cat-math', 'Mathematics', 'Mathematical ideas and methods'], ['cat-fiction', 'Fiction', 'Stories, novels, and imagination'],
  ['cat-lit', 'Literature', 'Essays, poetry, and literary studies'], ['cat-business', 'Business', 'Leadership, strategy, and work'],
  ['cat-finance', 'Finance', 'Markets, investing, and economics'], ['cat-history', 'History', 'People and events through time'],
].map(([id, name, description]) => ({ id, name, description }))

const bookSpecs: [string, string, string, string][] = [
  ['The Pragmatic Programmer', 'David Thomas & Andrew Hunt', 'cat-prog', 'A practical guide to building adaptable software and developing a lasting craft.'],
  ['Designing Data-Intensive Applications', 'Martin Kleppmann', 'cat-cs', 'A tour of the principles behind reliable, scalable, and maintainable data systems.'],
  ['Clean Code', 'Robert C. Martin', 'cat-prog', 'Principles and patterns for writing software that is easier to understand and change.'],
  ['The Algorithm Design Manual', 'Steven S. Skiena', 'cat-cs', 'A hands-on guide to algorithmic thinking, techniques, and problem solving.'],
  ['Introduction to Algorithms', 'Thomas H. Cormen et al.', 'cat-cs', 'A comprehensive introduction to modern algorithms and their analysis.'],
  ['Grokking Algorithms', 'Aditya Bhargava', 'cat-cs', 'An approachable visual introduction to common algorithms and data structures.'],
  ['You Don’t Know JS Yet', 'Kyle Simpson', 'cat-prog', 'A deep exploration of the JavaScript language and its core mechanics.'],
  ['Effective TypeScript', 'Dan Vanderkam', 'cat-prog', 'Practical techniques for getting the most from TypeScript.'],
  ['The Art of Computer Programming', 'Donald E. Knuth', 'cat-cs', 'A foundational study of algorithms, analysis, and computer science.'],
  ['Computer Networking: A Top-Down Approach', 'James Kurose & Keith Ross', 'cat-cs', 'A clear introduction to networking concepts from the application layer down.'],
  ['The Alignment Problem', 'Brian Christian', 'cat-ai', 'A human perspective on the challenges of teaching machines our values.'],
  ['Artificial Intelligence: A Modern Approach', 'Stuart Russell & Peter Norvig', 'cat-ai', 'A broad introduction to the theory and practice of artificial intelligence.'],
  ['Deep Learning', 'Ian Goodfellow et al.', 'cat-ai', 'An introduction to the mathematical foundations and methods of deep learning.'],
  ['Hands-On Machine Learning', 'Aurélien Géron', 'cat-ai', 'Practical approaches to machine learning with clear explanations and examples.'],
  ['The Gene', 'Siddhartha Mukherjee', 'cat-science', 'A history of heredity, genetics, and the search to understand human identity.'],
  ['A Brief History of Time', 'Stephen Hawking', 'cat-science', 'An exploration of cosmology, space, time, and the universe.'],
  ['The Body', 'Bill Bryson', 'cat-science', 'A lively guide to the remarkable systems that make the human body work.'],
  ['Cosmos', 'Carl Sagan', 'cat-science', 'A sweeping journey through science, civilization, and our place in the cosmos.'],
  ['The Joy of x', 'Steven Strogatz', 'cat-math', 'A friendly path through the beauty and usefulness of mathematics.'],
  ['How Not to Be Wrong', 'Jordan Ellenberg', 'cat-math', 'How mathematical thinking can illuminate everyday decisions and public life.'],
  ['The Code Book', 'Simon Singh', 'cat-cs', 'The history of secret writing, from ancient ciphers to modern cryptography.'],
  ['The Little Prince', 'Antoine de Saint-Exupéry', 'cat-fiction', 'A poetic tale of friendship, wonder, and seeing with the heart.'],
  ['Pride and Prejudice', 'Jane Austen', 'cat-fiction', 'A sharp, enduring novel about family, first impressions, and love.'],
  ['The Midnight Library', 'Matt Haig', 'cat-fiction', 'A woman explores the lives she might have lived and what makes a life meaningful.'],
  ['The Book Thief', 'Markus Zusak', 'cat-fiction', 'A story of courage, words, and human kindness in wartime Germany.'],
  ['One Hundred Years of Solitude', 'Gabriel García Márquez', 'cat-lit', 'A landmark family saga woven through the mythical town of Macondo.'],
  ['The God of Small Things', 'Arundhati Roy', 'cat-lit', 'A lyrical novel of family, memory, and the small moments that change everything.'],
  ['Selected Poems', 'Mary Oliver', 'cat-lit', 'Observant poems that invite attention to the natural world and ordinary life.'],
  ['The Art of Stillness', 'Pico Iyer', 'cat-lit', 'A meditation on travel, attention, and the value of slowing down.'],
  ['Thinking, Fast and Slow', 'Daniel Kahneman', 'cat-business', 'A landmark account of the two systems that shape human judgment.'],
  ['Good Strategy Bad Strategy', 'Richard Rumelt', 'cat-business', 'A practical framework for diagnosing challenges and taking coherent action.'],
  ['The Lean Startup', 'Eric Ries', 'cat-business', 'A method for building products through experimentation and continuous learning.'],
  ['Atomic Habits', 'James Clear', 'cat-business', 'A practical system for making small changes that lead to lasting habits.'],
  ['The Psychology of Money', 'Morgan Housel', 'cat-finance', 'Timeless lessons about behavior, wealth, and the stories we tell about money.'],
  ['A Random Walk Down Wall Street', 'Burton G. Malkiel', 'cat-finance', 'A clear introduction to investment markets and long-term financial thinking.'],
  ['The Little Book of Common Sense Investing', 'John C. Bogle', 'cat-finance', 'A straightforward case for low-cost index investing and patient ownership.'],
  ['Capital in the Twenty-First Century', 'Thomas Piketty', 'cat-finance', 'A data-rich history of wealth, inequality, and economic growth.'],
  ['Sapiens', 'Yuval Noah Harari', 'cat-history', 'A broad account of the forces that shaped human societies.'],
  ['The Silk Roads', 'Peter Frankopan', 'cat-history', 'A history that places the crossroads of Asia at the center of world events.'],
  ['The Warmth of Other Suns', 'Isabel Wilkerson', 'cat-history', 'The stories of families who reshaped America through the Great Migration.'],
  ['The Making of the Atomic Bomb', 'Richard Rhodes', 'cat-history', 'A detailed history of the science, people, and decisions behind the atomic age.'],
  ['The Design of Everyday Things', 'Don Norman', 'cat-business', 'How thoughtful design makes everyday products easier and safer to use.'],
  ['Range', 'David Epstein', 'cat-business', 'Why broad experience can help people thrive in a world of specialization.'],
  ['Factfulness', 'Hans Rosling', 'cat-science', 'A data-minded guide to seeing global trends with more clarity and less fear.'],
  ['The Hidden Life of Trees', 'Peter Wohlleben', 'cat-science', 'A close look at the surprising social lives of forests.'],
  ['The House in the Cerulean Sea', 'TJ Klune', 'cat-fiction', 'A gentle fantasy about belonging, kindness, and an unusual found family.'],
  ['The Namesake', 'Jhumpa Lahiri', 'cat-lit', 'A family story about identity, migration, and the meaning of a name.'],
  ['Educated', 'Tara Westover', 'cat-history', 'A memoir about education, family, and finding a voice of one’s own.'],
  ['The Innovators', 'Walter Isaacson', 'cat-cs', 'A history of the people and collaborations that built the digital age.'],
  ['Working Backwards', 'Colin Bryar & Bill Carr', 'cat-business', 'Inside the operating principles and practices of a technology company.'],
  ['A Mathematician’s Apology', 'G. H. Hardy', 'cat-math', 'A classic reflection on the beauty, purpose, and practice of mathematics.'],
]
const publishers = ['Riverhead Books', 'O’Reilly Media', 'Penguin Random House', 'MIT Press', 'HarperCollins', 'W. W. Norton', 'Vintage', 'Oxford University Press']
const languages = ['English', 'English', 'English', 'Hindi', 'French']
const books: Book[] = bookSpecs.slice(0, 50).map(([title, author, categoryId, description], i) => ({
  id: `book-${String(i + 1).padStart(2, '0')}`, title, author, categoryId, description,
  isbn: `978-${(1000000000 + i * 37429).toString().slice(0, 10)}`, publisher: publishers[i % publishers.length],
  publicationYear: 2001 + (i * 7) % 24, coverUrl: '', language: languages[i % languages.length], edition: `${1 + (i % 3)}${i % 3 === 0 ? 'st' : i % 3 === 1 ? 'nd' : 'rd'} edition`,
  pageCount: 220 + (i * 17) % 360, shelfLocation: `Floor ${1 + (i % 3)} · ${['A', 'B', 'C', 'D'][i % 4]}${10 + (i % 20)}`,
  callNumber: `${['QA', 'HM', 'PR', 'BF', 'HG'][i % 5]} ${100 + i}.${i % 10}`, createdAt: addDays(new Date(), -(i * 9) % 400), archivedAt: null,
}))

export const rawStudentList = [
  { rollNo: '25CO56', regNo: '25ACOE1101051', name: 'Dhiraj Sadashiv Mote' },
  { rollNo: '25CO57', regNo: '25ACOE1101176', name: 'Durga Ajay Bhandari' },
  { rollNo: '25CO58', regNo: '25ACOE1101014', name: 'Suzan Faiyaz Sayyed' },
  { rollNo: '25CO59', regNo: '25ACOE1101015', name: 'Gaurav Jitendra Gangbhoj' },
  { rollNo: '25CO60', regNo: '25ACOE1101055', name: 'Harsh Anandilal Kankani' },
  { rollNo: '25CO61', regNo: '25ACOE1101009', name: 'Harshal Sanjaykumar Pandit' },
  { rollNo: '25CO62', regNo: '25ACOE1101201', name: 'Harshwardhan Bhuleshwar Hingmire' },
  { rollNo: '25CO63', regNo: '25ACOE1101160', name: 'Himanshu Sanjay Patil' },
  { rollNo: '25CO64', regNo: '25ACOE1101100', name: 'Hiya Shaikh' },
  { rollNo: '25CO65', regNo: '25ACOE1101111', name: 'Isha Indrajit Malapure' },
  { rollNo: '25CO66', regNo: '25ACOE1101067', name: 'Jay Hemraj Nandardhane' },
  { rollNo: '25CO67', regNo: '25ACOE1101143', name: 'Jaydeep Vinod Sarade' },
  { rollNo: '25CO68', regNo: '25ACOE1101010', name: 'Jeet Sadanand Pandey' },
  { rollNo: '25CO69', regNo: '25ACOE1101139', name: 'Kajal Bagish Mishra' },
  { rollNo: '25CO70', regNo: '25ACOE1101024', name: 'Kanvesh Umeshrao Raut' },
  { rollNo: '25CO71', regNo: '25ACOE1101105', name: 'Karan Sadashivrao Ambhure' },
  { rollNo: '25CO72', regNo: '25ACOE1121269', name: 'Kartik Suryakant Wandhare' },
  { rollNo: '25CO73', regNo: '25ACOE1121210', name: 'Kaustubh Balaji Biradar' },
  { rollNo: '25CO74', regNo: '25ACOE1301197', name: 'Keshav Rajeshwar Toshniwal' },
  { rollNo: '25CO75', regNo: '25ACOE1121262', name: 'Ketan Dinesh Sonawane' },
  { rollNo: '25CO76', regNo: '25ACOE1121257', name: 'Khushal Anandrao Buddhewar' },
  { rollNo: '25CO77', regNo: '25ACOE1101066', name: 'Khushi Rajeev Maurya' },
  { rollNo: '25CO78', regNo: '25ACOE1301153', name: 'Krishna Rajesh Kumar Mishra' },
  { rollNo: '25CO79', regNo: '25ACOE1101044', name: 'Krishna Jitendra Yadav' },
  { rollNo: '25CO80', regNo: '25ACOE1101121', name: 'Krishna Gurucharansingh Yadu' },
  { rollNo: '25CO81', regNo: '25ACOE1101048', name: 'Krishna Laxman Chinchalpalle' },
  { rollNo: '25CO82', regNo: '25ACOE1101049', name: 'Kunal Manohar Salunke' },
  { rollNo: '25CO83', regNo: '25ACOE1101011', name: 'Kundan Sandeep Pandey' },
  { rollNo: '25CO84', regNo: '25ACOE1101004', name: 'Laxmi Anil Yadav' },
  { rollNo: '25CO85', regNo: '25ACOE1101134', name: 'Mayuri Anil Baviskar' },
  { rollNo: '25CO86', regNo: '25ACOE1101129', name: 'Madhu Harishankar Jha' },
  { rollNo: '25CO87', regNo: '25ACOE1101159', name: 'Manas Ramesh Latwal' },
  { rollNo: '25CO88', regNo: '25ACOE1121238', name: 'Manjit Lalan Singh' },
  { rollNo: '25CO89', regNo: '25ACOE1101077', name: 'Mayur Kailas Amrutkar' },
  { rollNo: '25CO90', regNo: '25ACOE1101016', name: 'Mehak Nandkishore Choudhari' },
  { rollNo: '25CO91', regNo: '25ACOE1101053', name: 'Mohamad Salman' },
  { rollNo: '25CO92', regNo: '25ACOE1101082', name: 'Mohammad Muzzammil Abdul Salim Sheikh' },
  { rollNo: '25CO93', regNo: '25ACOE1121233', name: 'Mrunalini Anil Gaikwad' },
  { rollNo: '25CO94', regNo: '25ACOE1101146', name: 'Nabiya Kainaat Shaikh Yusuf Shahzad Shaikh' },
  { rollNo: '25CO95', regNo: '25ACOE1121218', name: 'Nagesh Ananda Sapkal' },
  { rollNo: '25CO96', regNo: '25ACOE1101178', name: 'Nakul Dagdu Thale' },
  { rollNo: '25CO97', regNo: '25ACOE1101169', name: 'Naman Ramesh Jain' },
  { rollNo: '25CO98', regNo: '25ACOE1101162', name: 'Namish Rajesh Dhawale' },
  { rollNo: '25CO99', regNo: '25ACOE1121219', name: 'Namrata Narendra Ghulaxe' },
  { rollNo: '25CO100', regNo: '25ACOE1101228', name: 'Nandini Adhikar Patil' },
  { rollNo: '25CO101', regNo: '25ACOE1121252', name: 'Niraj Subhash Puri' },
  { rollNo: '25CO102', regNo: '25ACOE1101168', name: 'Niranjan Shivaji Chaudhari' },
  { rollNo: '25CO103', regNo: '25ACOE1101052', name: 'Nirmal Patil' },
  { rollNo: '25CO104', regNo: '25ACOE1101088', name: 'Nishita Vinod Milmile' },
  { rollNo: '25CO105', regNo: '25ACOE1101056', name: 'Noorulain Rizwan Bedrekar' },
  { rollNo: '25CO106', regNo: '25ACOE1301059', name: 'Om Arjun Gaikwad' },
  { rollNo: '25CO107', regNo: '25ACOE1112125', name: 'Om Pramod Godse' },
  { rollNo: '25CO108', regNo: '25ACOE1121215', name: 'Om Vitthal Kundgir' },
]

export const facultyMembers: Member[] = [
  {
    id: 'GH-FAC-01',
    rollNo: 'FAC-01',
    registrationNumber: 'GH-FAC-01',
    name: 'Dr. Sarita Patil',
    email: 'sarita.patil@ghrcem.raisoni.net',
    phone: '+91 98221 45012',
    membershipType: 'Faculty',
    membershipStatus: 'Active',
    registrationDate: '2021-06-15',
    expiryDate: '2030-12-31',
    department: 'Computer Engineering',
  },
  {
    id: 'GH-FAC-02',
    rollNo: 'FAC-02',
    registrationNumber: 'GH-FAC-02',
    name: 'Narsing Kadam',
    email: 'narsing.kadam@ghrcem.raisoni.net',
    phone: '+91 98224 78103',
    membershipType: 'Faculty',
    membershipStatus: 'Active',
    registrationDate: '2022-07-20',
    expiryDate: '2030-12-31',
    department: 'Computer Engineering',
  },
  {
    id: 'GH-FAC-03',
    rollNo: 'FAC-03',
    registrationNumber: 'GH-FAC-03',
    name: 'Sadashiv Badger',
    email: 'sadashiv.badger@ghrcem.raisoni.net',
    phone: '+91 98230 19342',
    membershipType: 'Faculty',
    membershipStatus: 'Active',
    registrationDate: '2020-01-10',
    expiryDate: '2030-12-31',
    department: 'Computer Engineering',
  },
  {
    id: 'GH-FAC-04',
    rollNo: 'FAC-04',
    registrationNumber: 'GH-FAC-04',
    name: 'Prajakta Borude',
    email: 'prajakta.borude@ghrcem.raisoni.net',
    phone: '+91 98235 67291',
    membershipType: 'Faculty',
    membershipStatus: 'Active',
    registrationDate: '2023-08-05',
    expiryDate: '2030-12-31',
    department: 'Computer Engineering',
  },
]

const studentMembers: Member[] = rawStudentList.map((s, i) => {
  if (s.rollNo === '25CO64') {
    return {
      id: '25CO64',
      rollNo: '25CO64',
      registrationNumber: '25ACOE1101100',
      name: 'Hiya Shaikh',
      email: 'hiyashaikh3@gmail.com',
      phone: '+91 93097***78',
      membershipType: 'Student' as const,
      membershipStatus: 'Active' as const,
      registrationDate: '2025-09-10',
      expiryDate: '2029-05-31',
      department: 'Computer Engineering',
    }
  }
  const emailPrefix = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '')
  return {
    id: s.rollNo,
    rollNo: s.rollNo,
    registrationNumber: s.regNo,
    name: s.name,
    email: `${emailPrefix}@ghrcem.raisoni.net`,
    phone: `+91 98${String(10000000 + i * 48219).slice(0, 8)}`,
    membershipType: 'Student' as const,
    membershipStatus: i === 25 ? 'Suspended' : 'Active',
    registrationDate: '2025-08-16',
    expiryDate: '2029-05-31',
    department: 'Computer Engineering',
  }
})

export const allMembers: Member[] = [...studentMembers, ...facultyMembers]

export function createSeedData(): LibraryData {
  const members = allMembers
  const copies: BookCopy[] = books.flatMap((book, i) => Array.from({ length: i < 30 ? 2 : 1 }, (_, copyIndex) => ({
    id: `copy-${book.id}-${copyIndex + 1}`, bookId: book.id, accessionNumber: `GH-${String(i + 1).padStart(3, '0')}-${copyIndex + 1}`,
    status: 'available' as const, shelfLocation: book.shelfLocation,
  })))
  const borrowedBookIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 30, 31, 32, 33]
  const overdueOffsets = [-19, -11, -6, -2, 1, 3, 5, 7, 10, 12, 14, 16, 18, 20]
  const activeLoans = borrowedBookIndexes.map((bookIndex, i) => {
    const copy = copies.find(c => c.bookId === books[bookIndex].id && c.status === 'available')!
    copy.status = 'loaned'
    const issueDate = addDays(new Date(), -18 + i)
    const borrowerId = i === 0 ? '25CO64' : members[(i * 3) % members.length].id
    return { id: `loan-${String(i + 1).padStart(3, '0')}`, memberId: borrowerId, copyId: copy.id,
      issueDate, dueDate: addDays(new Date(), overdueOffsets[i]), returnDate: null, renewalCount: i % 3 === 0 ? 1 : 0, status: 'active' as const }
  })
  const returnedLoans = Array.from({ length: 6 }, (_, i) => ({
    id: `loan-${String(i + 15).padStart(3, '0')}`, memberId: members[(i * 4 + 1) % members.length].id,
    copyId: copies.find(c => c.bookId === books[15 + i].id)!.id, issueDate: addDays(new Date(), -50 + i * 3),
    dueDate: addDays(new Date(), -29 + i * 2), returnDate: addDays(new Date(), -24 + i * 2), renewalCount: i % 2, status: 'returned' as const,
  }))
  // One copy is held for the oldest ready reservation and is not available to new borrowers.
  const heldCopy = copies.find(c => c.bookId === books[34].id)!
  heldCopy.status = 'reserved'
  const reservations: Reservation[] = [
    [members[1].id, 'book-31', 'pending'], [members[2].id, 'book-31', 'pending'], [members[3].id, 'book-32', 'pending'],
    [members[4].id, 'book-33', 'pending'], [members[5].id, 'book-34', 'pending'], [members[6].id, 'book-35', 'ready'],
    [members[7].id, 'book-36', 'pending'], [members[8].id, 'book-37', 'pending'],
  ].map(([memberId, bookId, status], i) => ({ id: `reservation-${String(i + 1).padStart(3, '0')}`, memberId, bookId,
    reservationDate: addDays(new Date(), -12 + i), queuePosition: i + 1, status: status as LibraryData['reservations'][number]['status'] }))
  // Match the ready reservation to a reserved copy of its title.
  reservations[5].bookId = books[34].id
  const queueCounts = new Map<string, number>()
  reservations.forEach(reservation => { const position = (queueCounts.get(reservation.bookId) || 0) + 1; reservation.queuePosition = position; queueCounts.set(reservation.bookId, position) })
  const loans = [...activeLoans, ...returnedLoans]
  const fineLoans = [...activeLoans.slice(0, 4), ...returnedLoans]
  const fines = fineLoans.map((loan, i) => {
    const lateDays = Math.max(1, daysBetween(loan.dueDate, loan.returnDate || today()))
    return { id: `fine-${String(i + 1).padStart(3, '0')}`, loanId: loan.id, amount: Math.min(lateDays, 30) * 5,
      status: (i === 1 ? 'paid' : i === 8 ? 'waived' : 'unpaid') as Fine['status'], waivedReason: i === 8 ? 'Courtesy waiver · first late return' : null,
      createdAt: loan.returnDate ?? today() }
  })
  const notificationSeed: [string | null, string, string, Notification['type']][] = [
    ['25CO64', 'Your book is due soon', 'The Pragmatic Programmer is due in 3 days.', 'due'],
    [members[1].id, 'Overdue book reminder', 'Please return Clean Code at your earliest convenience.', 'overdue'],
    [members[2].id, 'Reservation ready', 'The Little Prince is ready for collection at the central library desk.', 'reservation'],
    [members[3].id, 'Book returned', 'Your return was checked in successfully.', 'returned'],
    [null, 'Library hours this week', 'The library is open from 8:00 AM to 8:00 PM on weekdays.', 'announcement'],
    [members[4].id, 'Your book is due tomorrow', 'A Brief History of Time is due tomorrow.', 'due'],
    [members[5].id, 'Reservation update', 'You are next in the queue for The Gene.', 'reservation'],
    ['25CO64', 'New arrivals are here', 'Explore this month’s new additions to the GH Raisoni collection.', 'announcement'],
    [members[6].id, 'Overdue book reminder', 'Please return your borrowed title to avoid additional overdue fines.', 'overdue'],
    [members[7].id, 'Book returned', 'Your recent return has been recorded.', 'returned'],
  ]
  const notifications: Notification[] = notificationSeed.map(([memberId, title, message, type], i) => ({ id: `notification-${i + 1}`, memberId, title, message,
    type, createdAt: addDays(new Date(), -i), readAt: i > 4 ? addDays(new Date(), -i) : null }))
  const activity = [
    { id: 'activity-new-title', actorId: 'mirkword', action: 'added a new title', entityType: 'book', entityId: books[42].id, timestamp: new Date(Date.now() - 25 * 3_600_000).toISOString() },
    { id: 'activity-new-member', actorId: 'mirkword', action: 'registered as a member', entityType: 'member', entityId: members[0].id, timestamp: new Date(Date.now() - 35 * 3_600_000).toISOString() },
    ...activeLoans.slice(0, 2).map((loan, i) => ({ id: `activity-${i + 1}`, actorId: 'mirkword', action: 'issued a book', entityType: 'loan', entityId: loan.id, timestamp: new Date(Date.now() - i * 3_600_000).toISOString() })),
    ...returnedLoans.slice(0, 1).map((loan, i) => ({ id: `activity-return-${i}`, actorId: 'mirkword', action: 'returned a book', entityType: 'loan', entityId: loan.id, timestamp: new Date(Date.now() - 4 * 3_600_000).toISOString() })),
    ...activeLoans.slice(2, 3).map((loan, i) => ({ id: `activity-later-${i}`, actorId: 'mirkword', action: 'issued a book', entityType: 'loan', entityId: loan.id, timestamp: new Date(Date.now() - 48 * 3_600_000).toISOString() })),
    ...returnedLoans.slice(1, 2).map((loan, i) => ({ id: `activity-return-later-${i}`, actorId: 'mirkword', action: 'returned a book', entityType: 'loan', entityId: loan.id, timestamp: new Date(Date.now() - 55 * 3_600_000).toISOString() })),
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  return {
    categories, books, copies, members, loans, reservations, fines, notifications, activity,
    settings: {
      libraryName: 'GH Raisoni College of Engineering and Management',
      address: 'Wagholi, Pune',
      contactEmail: 'ghrcemp@gmail.com',
      phone: '+91 20 6752 4800',
      hours: 'Mon–Fri, 8:00 AM–8:00 PM · Sat, 9:00 AM–5:00 PM',
      loanDurationDays: 21,
      maxActiveLoans: 5,
      maxRenewals: 2,
      finePerDay: 5,
      reservationHoldDays: 3,
    },
  }
}

export const libraryMembers = allMembers
