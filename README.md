# GH Raisoni College of Engineering and Management - Central Digital Library Management System

A responsive digital library management system built with React, TypeScript, Vite, React Router, Lucide icons, and Recharts. It provides a complete central library management platform for students and faculty of GH Raisoni College of Engineering and Management (GHRCEM).

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. For a production build, run `npm run build`; use `npm run preview` to serve that build locally.

## Portals & Access

The sign-in screen offers direct portal entries:

- **Librarian Portal** (Head Librarian: Mirkword) — catalog inventory, student & faculty member rosters, circulation (issue, return, renew), reservation queues, overdue fine ledgers, analytics reports, notifications, and operational settings.
- **Student Portal** (Hiya Shaikh, Roll No: 25CO64) — public catalog search, personal active loans, renewal management, book reservation queues, notifications, and student membership card.

Direct sign-in buttons are available on the login page for rapid role access across librarian and student workspaces.

## Included workflows

- Search and filter the catalog, view book details, and switch between grid and list layouts.
- Add and edit catalog titles; track physical copies by accession number; archive titles without erasing circulation history.
- Issue, return, and renew individual copies with membership, borrowing-limit, renewal, and date validation.
- Maintain FIFO reservations and hold returned copies for the next member in line.
- Calculate overdue days and fine balances; record fine payments or waivers with authorized reasons.
- Review reports, filter records, export filtered rows to CSV, and print circulation reports.
- Manage notifications, library operational settings, and restore default library records.

## Data & Persistence

The library database includes 50 catalog titles, physical copies, comprehensive student and faculty member rosters for GHRCEM, active circulation loans, reservations, notifications, and fine ledger records. All records are persisted locally in the browser. Use **Settings → Reset records** to reload campus default records whenever needed.

Circulation dates use standard date formats for precise scheduling. Book covers support custom cover image URLs or responsive typographic covers.

## Credits

Built and maintained by Hiya Shaikh (25CO64).

