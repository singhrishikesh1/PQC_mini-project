# GH Raisoni College of Engineering and Management - Central Digital Library Management System

A high-performance, full-stack digital library management platform built with React, TypeScript, Express REST API, Prisma ORM, and PostgreSQL. Tailored for GH Raisoni College of Engineering and Management (GHRCEMP), Wagholi, Pune.

---


- **Frontend Client**: React 18, TypeScript, React Router 6, Lucide Icons, Recharts, and Vanilla CSS with light & dark mode tokens.
- **Backend Service Layer**: Express 5.1 REST API with modular controllers, request logging, and structured error responses.
- **Database & ORM Layer**: Prisma ORM v6 with relational models for Books, Copies, Members, Loans, Reservations, Fines, Notifications, Activity Logs, and Settings.
- **Dual-Engine Resilience**: Seamlessly operates with a live PostgreSQL instance or the local persistent storage cache when offline.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default connection string in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ghrcem_library?schema=public"
PORT=3001
```

### 3. Start Full-Stack System
Run both the Express API server and the Vite frontend concurrently:
```bash
npm run dev
```
- **Web Portal**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/api/health`

---

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck, uptime, and database engine diagnostics |
| `GET` | `/api/settings/snapshot` | Full system state snapshot for hydration |
| `GET` | `/api/books` | List books with search, category, and status filters |
| `POST` | `/api/books` | Create new catalog title with physical copies |
| `PUT` | `/api/books/:id` | Update book details and metadata |
| `DELETE` | `/api/books/:id` | Archive catalog title |
| `POST` | `/api/books/:id/copies` | Add or decommission physical book copies |
| `GET` | `/api/members` | List members with student/faculty filtering |
| `POST` | `/api/members` | Register or update member record |
| `GET` | `/api/circulation/loans` | List active, returned, and overdue loans |
| `POST` | `/api/circulation/loans/issue` | Issue copy to member with loan policy validation |
| `POST` | `/api/circulation/loans/:id/return` | Check-in loan with condition assessment & fines |
| `POST` | `/api/circulation/loans/:id/renew` | Renew loan within borrowing limits |
| `GET` | `/api/reservations` | List active FIFO reservation queues |
| `POST` | `/api/reservations` | Place book reservation |
| `POST` | `/api/reservations/:id/cancel` | Cancel reservation and reassign hold queue |
| `GET` | `/api/circulation/fines` | List overdue fines |
| `POST` | `/api/circulation/fines/:id/pay` | Record fine payment |
| `POST` | `/api/circulation/fines/:id/waive` | Waive fine with recorded authorization reason |
| `GET` | `/api/analytics` | Statistical analytics & circulation aggregations |

---

## Portals & Access

- **Librarian Portal** (Head Librarian: Mirkword) — Catalog inventory, physical copy tracking, circulation desk, member management, reservation fulfillment, fine collection, and operational settings.
- **Student Portal** (Hiya Shaikh, Roll No: `25CO64`, Reg: `25ACOE1101100`) — Catalog search, active loans & renewal requests, reservation tracking, student notifications, and digital membership card.
- **Sign In with Google**: Instant single sign-on authentication available on the welcome screen.

---

## Production Build

```bash
npm run build
npm run preview
```

---

## Credits & Attribution

**Built and maintained by Hiya Shaikh (25CO64)**  
Department of Computer Engineering  
GH Raisoni College of Engineering and Management, Wagholi, Pune


