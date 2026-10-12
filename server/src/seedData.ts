import type { Category, LibraryData, Member, Notification } from './types'

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
  ['cat-cs', 'Computer Science', 'CS', 'Systems, networks, and computing'],
  ['cat-prog', 'Programming', 'PROG', 'Languages and software craft'],
  ['cat-ai', 'Artificial Intelligence', 'AI', 'Machine learning and intelligent systems'],
  ['cat-science', 'Science', 'SCI', 'The natural world and discovery'],
  ['cat-math', 'Mathematics', 'MATH', 'Mathematical ideas and methods'],
  ['cat-fiction', 'Fiction', 'FIC', 'Stories, novels, and imagination'],
  ['cat-lit', 'Literature', 'LIT', 'Essays, poetry, and literary studies'],
  ['cat-business', 'Business', 'BUS', 'Leadership, strategy, and work'],
  ['cat-finance', 'Finance', 'FIN', 'Markets, investing, and economics'],
  ['cat-history', 'History', 'HIST', 'People and events through time'],
].map(([id, name, code, description]) => ({ id, name, code, description }))

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
  ['Fermat’s Last Theorem', 'Simon Singh', 'cat-math', 'The story of a riddle that confounded the greatest minds for centuries.'],
  ['Thinking, Fast and Slow', 'Daniel Kahneman', 'cat-business', 'An investigation of the two modes of thought that drive human judgment.'],
  ['Zero to One', 'Peter Thiel & Blake Masters', 'cat-business', 'Notes on startups, innovation, and how to build a novel future.'],
  ['The Psychology of Money', 'Morgan Housel', 'cat-finance', 'Timeless lessons on wealth, greed, and the psychology behind financial choices.'],
  ['Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'cat-history', 'A narrative of how an insignificant ape became the ruler of planet Earth.'],
  ['Guns, Germs, and Steel', 'Jared Diamond', 'cat-history', 'A study of the environmental factors that shaped human societies.'],
  ['The Little Prince', 'Antoine de Saint-Exupéry', 'cat-fiction', 'A poetic tale of loneliness, friendship, love, and loss.'],
  ['1984', 'George Orwell', 'cat-fiction', 'A vision of totalitarian control and surveillance in a modern dystopia.'],
  ['To Kill a Mockingbird', 'Harper Lee', 'cat-fiction', 'A novel of compassion, justice, and courage in the American South.'],
  ['The Great Gatsby', 'F. Scott Fitzgerald', 'cat-fiction', 'A portrait of the Jazz Age, illusion, obsession, and the American dream.'],
  ['Brave New World', 'Aldous Huxley', 'cat-fiction', 'A speculative vision of a technological society without suffering or freedom.'],
  ['The Alchemist', 'Paulo Coelho', 'cat-fiction', 'A fable about following dreams and listening to one’s own heart.'],
  ['Crime and Punishment', 'Fyodor Dostoevsky', 'cat-lit', 'A psychological study of crime, guilt, and moral redemption.'],
  ['Meditations', 'Marcus Aurelius', 'cat-lit', 'Personal reflections on resilience, duty, and practical stoic wisdom.'],
  ['Man’s Search for Meaning', 'Viktor E. Frankl', 'cat-lit', 'A psychiatrist’s memoir of surviving camps and finding purpose in suffering.'],
  ['Atomic Habits', 'James Clear', 'cat-business', 'A practical guide to building small habits that lead to remarkable results.'],
  ['Deep Work', 'Cal Newport', 'cat-business', 'Rules for focused success in a world full of digital distractions.'],
  ['Continuous Delivery', 'Jez Humble & David Farley', 'cat-prog', 'Reliable software releases through build, test, and deployment automation.'],
  ['Site Reliability Engineering', 'Betsy Beyer et al.', 'cat-cs', 'How Google runs production systems at global scale.'],
  ['Database Internals', 'Alex Petrov', 'cat-cs', 'A deep dive into storage engines and distributed database architectures.'],
  ['Superintelligence', 'Nick Bostrom', 'cat-ai', 'Paths, dangers, and strategies for the future of general artificial intelligence.'],
  ['Life 3.0', 'Max Tegmark', 'cat-ai', 'Being human in the age of artificial intelligence.'],
  ['The Selfish Gene', 'Richard Dawkins', 'cat-science', 'A revolutionary view of natural selection through the lens of the gene.'],
  ['Structure and Interpretation of Computer Programs', 'Harold Abelson & Gerald Jay Sussman', 'cat-prog', 'A classic text on abstraction, programming, and computational thinking.'],
  ['Refactoring', 'Martin Fowler', 'cat-prog', 'Improving the design of existing code without altering its observable behavior.'],
  ['Domain-Driven Design', 'Eric Evans', 'cat-prog', 'Tackling complexity in the heart of software through domain modeling.'],
  ['High Performance Browser Networking', 'Ilya Grigorik', 'cat-cs', 'What every web developer should know about networking performance.'],
  ['Operating Systems: Three Easy Pieces', 'Remzi & Andrea Arpaci-Dusseau', 'cat-cs', 'An introduction to virtualization, concurrency, and persistence in operating systems.'],
  ['Linear Algebra Done Right', 'Sheldon Axler', 'cat-math', 'A clean, modern approach to linear algebra focusing on linear operators.'],
  ['Principles of Mathematical Analysis', 'Walter Rudin', 'cat-math', 'A rigorous foundation in real analysis and metric spaces.'],
  ['The Intelligent Investor', 'Benjamin Graham', 'cat-finance', 'The definitive guide on value investing and long-term capital preservation.'],
]

export const libraryMembers: Member[] = [
  {
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
  },
  { id: 'FAC-01', name: 'Dr. Sarita Patil', email: 'sarita.patil@ghrcem.raisoni.net', phone: '+91 98220 11201', membershipType: 'Faculty', membershipStatus: 'Active', registrationDate: '2021-06-15', expiryDate: '2030-12-31', department: 'Computer Engineering' },
  { id: 'FAC-02', name: 'Narsing Kadam', email: 'narsing.kadam@ghrcem.raisoni.net', phone: '+91 98220 11202', membershipType: 'Faculty', membershipStatus: 'Active', registrationDate: '2020-08-01', expiryDate: '2030-12-31', department: 'Information Technology' },
  { id: 'FAC-03', name: 'Sadashiv Badger', email: 'sadashiv.badger@ghrcem.raisoni.net', phone: '+91 98220 11203', membershipType: 'Faculty', membershipStatus: 'Active', registrationDate: '2019-07-10', expiryDate: '2030-12-31', department: 'Mechanical Engineering' },
  { id: 'FAC-04', name: 'Prajakta Borude', email: 'prajakta.borude@ghrcem.raisoni.net', phone: '+91 98220 11204', membershipType: 'Faculty', membershipStatus: 'Active', registrationDate: '2022-01-18', expiryDate: '2030-12-31', department: 'Electronics & Telecommunication' },
  { id: '25CO01', rollNo: '25CO01', name: 'Aarav Sharma', email: 'aarav.sharma@ghrcem.raisoni.net', phone: '+91 98230 44001', membershipType: 'Student', membershipStatus: 'Active', registrationDate: '2025-08-20', expiryDate: '2029-05-31', department: 'Computer Engineering' },
  { id: '25CO02', rollNo: '25CO02', name: 'Ananya Deshmukh', email: 'ananya.deshmukh@ghrcem.raisoni.net', phone: '+91 98230 44002', membershipType: 'Student', membershipStatus: 'Active', registrationDate: '2025-08-20', expiryDate: '2029-05-31', department: 'Computer Engineering' },
  { id: '25CO03', rollNo: '25CO03', name: 'Rohan Kulkarni', email: 'rohan.kulkarni@ghrcem.raisoni.net', phone: '+91 98230 44003', membershipType: 'Student', membershipStatus: 'Active', registrationDate: '2025-08-21', expiryDate: '2029-05-31', department: 'Computer Engineering' },
  { id: '25IT10', rollNo: '25IT10', name: 'Snehal Joshi', email: 'snehal.joshi@ghrcem.raisoni.net', phone: '+91 98230 44004', membershipType: 'Student', membershipStatus: 'Active', registrationDate: '2025-08-22', expiryDate: '2029-05-31', department: 'Information Technology' },
  { id: '25IT11', rollNo: '25IT11', name: 'Aditya Shinde', email: 'aditya.shinde@ghrcem.raisoni.net', phone: '+91 98230 44005', membershipType: 'Student', membershipStatus: 'Active', registrationDate: '2025-08-22', expiryDate: '2029-05-31', department: 'Information Technology' },
  { id: '25ME05', rollNo: '25ME05', name: 'Pranav Gaikwad', email: 'pranav.gaikwad@ghrcem.raisoni.net', phone: '+91 98230 44006', membershipType: 'Student', membershipStatus: 'Active', registrationDate: '2025-08-23', expiryDate: '2029-05-31', department: 'Mechanical Engineering' },
  { id: '25ENTC08', rollNo: '25ENTC08', name: 'Tanvi Bhosale', email: 'tanvi.bhosale@ghrcem.raisoni.net', phone: '+91 98230 44007', membershipType: 'Student', membershipStatus: 'Active', registrationDate: '2025-08-24', expiryDate: '2029-05-31', department: 'Electronics & Telecommunication' },
  { id: 'STAFF-01', name: 'Rameshwar Pawar', email: 'rameshwar.pawar@ghrcem.raisoni.net', phone: '+91 98220 55001', membershipType: 'Staff', membershipStatus: 'Active', registrationDate: '2018-03-01', expiryDate: '2032-12-31', department: 'Central Administration' }
]

export function createSeedData(): LibraryData {
  const books = bookSpecs.map(([title, author, categoryId, description], i) => {
    const pubYear = 2008 + (i % 16)
    const isbn = `978-${String(1000000000 + i * 18471).slice(0, 3)}-${String(1000000000 + i * 18471).slice(3, 10)}-${(i % 9) + 1}`
    const callPrefix = categories.find(c => c.id === categoryId)?.code || 'GEN'
    return {
      id: `book-${String(i + 1).padStart(3, '0')}`,
      title,
      author,
      isbn,
      publisher: 'GHRCEM Academic Press',
      publicationYear: pubYear,
      categoryId,
      language: 'English',
      edition: `${(i % 4) + 1}${['st', 'nd', 'rd', 'th'][i % 4]} edition`,
      pageCount: 220 + (i * 17) % 520,
      description,
      shelfLocation: `Stack ${String.fromCharCode(65 + (i % 6))}-${(i % 12) + 1}`,
      callNumber: `${callPrefix} ${500 + i * 10}.${(i % 8) + 1}`,
      archivedAt: null,
      createdAt: addDays(new Date(), -120 + i),
    }
  })

  let copyCount = 0
  const copies = books.flatMap(book => {
    const count = 2 + (copyCount % 3)
    return Array.from({ length: count }, (_, idx) => {
      copyCount++
      return {
        id: `copy-${book.id}-${idx + 1}`,
        bookId: book.id,
        barcode: `GHRCEM-${book.id.toUpperCase()}-${String(idx + 1).padStart(2, '0')}`,
        copyNumber: idx + 1,
        status: 'available' as const,
      }
    })
  })

  // Set up active loans for Hiya Shaikh (25CO64) and other members
  const loans = [
    {
      id: 'loan-001',
      memberId: '25CO64',
      copyId: copies[0].id,
      issueDate: addDays(new Date(), -5),
      dueDate: addDays(new Date(), 16),
      returnDate: null,
      renewalCount: 0,
      status: 'active' as const,
    },
    {
      id: 'loan-002',
      memberId: 'FAC-01',
      copyId: copies[3].id,
      issueDate: addDays(new Date(), -10),
      dueDate: addDays(new Date(), 11),
      returnDate: null,
      renewalCount: 1,
      status: 'active' as const,
    },
    {
      id: 'loan-003',
      memberId: '25CO01',
      copyId: copies[6].id,
      issueDate: addDays(new Date(), -28),
      dueDate: addDays(new Date(), -7), // overdue by 7 days
      returnDate: null,
      renewalCount: 0,
      status: 'active' as const,
    },
  ]

  // Mark borrowed copies as loaned
  for (const loan of loans) {
    const copy = copies.find(c => c.id === loan.copyId)
    if (copy) copy.status = 'loaned'
  }

  const reservations = [
    {
      id: 'res-001',
      memberId: '25CO64',
      bookId: books[1].id,
      reservationDate: addDays(new Date(), -2),
      holdUntil: addDays(new Date(), 5),
      status: 'ready' as const,
    },
    {
      id: 'res-002',
      memberId: 'FAC-02',
      bookId: books[2].id,
      reservationDate: addDays(new Date(), -1),
      holdUntil: null,
      status: 'pending' as const,
    },
  ]

  const fines = [
    {
      id: 'fine-001',
      loanId: 'loan-003',
      memberId: '25CO01',
      amount: 35.0,
      status: 'unpaid' as const,
      reason: '7 days overdue (₹5/day)',
      paidAt: null,
    },
  ]

  const notifications: Notification[] = [
    { id: 'notif-01', memberId: '25CO64', title: 'Reservation ready for collection', message: 'Designing Data-Intensive Applications is held for you at the central library desk.', type: 'reservation', createdAt: addDays(new Date(), -1), readAt: null },
    { id: 'notif-02', memberId: '25CO64', title: 'Book issue confirmed', message: 'The Pragmatic Programmer has been checked out to you.', type: 'returned', createdAt: addDays(new Date(), -5), readAt: addDays(new Date(), -4) },
    { id: 'notif-03', memberId: null, title: 'Central Library Hours', message: 'Central Digital Library is open from 8:00 AM to 8:00 PM for the upcoming examination cycle.', type: 'announcement', createdAt: addDays(new Date(), -2), readAt: null },
    { id: 'notif-04', memberId: '25CO01', title: 'Overdue Book Reminder', message: 'Clean Code is overdue. Please return it to avoid daily fine accumulation.', type: 'overdue', createdAt: addDays(new Date(), -3), readAt: null },
  ]

  const activity = [
    { id: 'act-01', actorId: 'mirkword', action: 'issued The Pragmatic Programmer to Hiya Shaikh', entityType: 'loan', entityId: 'loan-001', timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'act-02', actorId: 'mirkword', action: 'fulfilled reservation for Designing Data-Intensive Applications', entityType: 'reservation', entityId: 'res-001', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'act-03', actorId: 'mirkword', action: 'registered faculty Dr. Sarita Patil', entityType: 'member', entityId: 'FAC-01', timestamp: new Date(Date.now() - 30 * 86400000).toISOString() },
  ]

  return {
    categories,
    books,
    copies,
    members: libraryMembers,
    loans,
    reservations,
    fines,
    notifications,
    activity,
    settings: {
      libraryName: 'GH Raisoni College of Engineering and Management',
      address: 'Wagholi, Pune',
      contactEmail: 'ghrcemp@gmail.com',
      phone: '+91 20 6752 4800',
      hours: 'Mon–Fri: 8:00 AM–8:00 PM · Sat: 9:00 AM–5:00 PM',
      loanDurationDays: 21,
      maxActiveLoans: 5,
      maxRenewals: 2,
      finePerDay: 5.0,
      reservationHoldDays: 3,
    },
  }
}
