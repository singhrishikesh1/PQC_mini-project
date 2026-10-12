# Northstar Library

A responsive library management demo built with React, TypeScript, Vite, Tailwind CSS, React Router, Lucide icons, and Recharts. It uses fictional sample records and stores changes in the browser's local storage. There is no backend or real authentication.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. For a production build, run `npm run build`; use `npm run preview` to serve that build locally.

## Explore the demo

The sign-in screen offers two one-click experiences:

- **Librarian** — inventory, members, circulation, reservations, overdue fines, reports, notifications, and settings.
- **Student** — the public catalog, a sample member account, loans, reservations, notifications, and profile.

The email and password fields are demonstration-only. Use the demo buttons; there are no real credentials.

## Included workflows

- Search and filter the catalog, view book details, and switch between grid and list layouts.
- Add and edit catalog titles; track physical copies by accession number; archive titles without erasing circulation history.
- Issue, return, and renew individual copies with membership, borrowing-limit, renewal, and date validation.
- Maintain FIFO reservations and hold returned copies for the next member in line.
- Calculate overdue days and simulated fines; record demo payments or waivers with a reason.
- Review reports, filter records, export the filtered rows to CSV, and print reports.
- Manage notifications, library settings, and reset the sample data.

## Sample data and persistence

The initial dataset includes 50 titles, 80 physical copies, 25 members, 20 loans, 8 reservations, 10 notifications, and 10 simulated fine records. All sample people and email addresses are fictional. Use **Settings → Reset data** to restore the original records in the current browser.

The demo uses date-only values for circulation dates to avoid timezone shifts. Images are local typographic cover treatments by default; a direct cover image URL may be added to a title record.
