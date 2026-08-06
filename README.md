# School ERP Software

Full-stack School / College Management System.

- **Backend:** Node.js + Express + MySQL (Sequelize ORM) + JWT auth
- **Frontend:** React (Vite) + Tailwind CSS + React Router + Recharts
- **Roles:** Admin, Management, Teacher, Student — each with different access levels
- Fully responsive (mobile, tablet, desktop)

## Features

- Login / Signup (students, teachers & parents can self-register; admin/management
  accounts are created by an existing admin)
- Role-based dashboards and navigation — **Admin, Management, Teacher, Student, Parent**
- Student Management (CRUD) with printable ID cards (PDF)
- Teacher Management (CRUD) with printable ID cards (PDF)
- Class Management
- Attendance (mark daily attendance by class, students view their own history)
- Fee Management (track dues, partial/paid/unpaid status)
- Examination Management (create exams, enter marks, students view results)
- **Timetable & Class Schedule** (weekly grid per class; students/teachers see their own)
- **Library Management** (book catalogue, issue/return tracking, students see their own issued books)
- **Announcements board** (targeted by role, priority levels, live notification bell)
- **Parent Portal** (parents view their linked children's attendance, fees & results)
- **Audit Log** (admin-only activity trail — who created/updated/deleted what, and when)
- **Transport Management** (vehicles, routes, student route assignment)
- **Hostel Management** (hostels, rooms, student room allotment)
- **Homework / Assignments** (teachers assign, students submit, teachers grade)
- **Leave Management** (any role can apply; admin/management approve or reject)
- **Payroll** (admin manages teacher salary records, allowances/deductions, payment status)
- **Online Quizzes / MCQ Exams** (teacher-built quizzes, timed, auto-graded)
- **Marksheet & Certificate PDF generator** (per-student marksheets; Bonafide/Transfer/Character certificates)
- **In-app + optional email notifications** (attendance, fees, results, homework, leave — auto-triggered)
- **Dark mode** toggle
- **Online Admissions/Enquiry** (public form at `/admissions` + admin CRM to track leads)
- **Online Fee Payment** (demo checkout flow — see note below on going live with a real gateway)
- **Events & Holiday Calendar**
- **Bulk Import** (CSV/Excel) for Students and Teachers
- **Student Performance Analytics** (exam score trend + attendance per student)
- **Two-Factor Authentication (2FA)** via authenticator apps (TOTP)
- **Custom Branding** (school name, tagline, logo — shown on login, sidebar, PDFs)
- **Multi-language UI** (English / Hindi toggle)
- **Inventory / Asset Management**
- Reports & Analytics (charts: attendance trend, fee status, class distribution)
- **Data tables with sorting, search/filter, pagination, and Excel/PDF export** on
  Students, Teachers, Fees, Library and Audit Log screens
- User Access management (admin can create/disable/change roles for any account)
- Profile Settings

## Folder Structure

```
school-erp/
├── backend/     Node.js + Express + MySQL API
└── frontend/    React (Vite) + Tailwind app
```

---

## 1. Prerequisites

- Node.js v18+ and npm
- MySQL server running locally (or a remote MySQL/compatible instance)

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set your MySQL credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=school_erp
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=change_this_to_a_long_random_secret
```

Create the database (Sequelize will create the tables automatically, but the
database itself must exist first):

```sql
CREATE DATABASE school_erp;
```

Start the backend (this will connect, auto-create/sync all tables):

```bash
npm run dev
```

Seed a default admin account:

```bash
npm run seed
```

This creates:
- Email: `admin@school.com`
- Password: `Admin@123`

(You can change these in `.env` via `ADMIN_EMAIL` / `ADMIN_PASSWORD` before seeding.)

The API runs at `http://localhost:5000/api`.

## 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # already points to http://localhost:5000/api
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## 4. Logging In

- **Admin:** use the seeded admin account above — full access to everything,
  including creating Management/Teacher/Student/Parent logins under "User Access".
- **Teacher / Student / Parent:** use the Signup page to self-register, or have
  an admin create the account under "User Access".
- **Management:** created by an admin (choose role "management" when adding a user).
- **Linking a Parent to their child:** an admin edits the student's record
  (Students page) and selects the parent's account under "Linked Parent Portal
  account". The parent will then see that child under "My Children".

### Optional: email notifications

In-app notifications (bell icon) work out of the box. To also send emails when
a student is marked absent, a fee is due, results are published, etc., fill in
the `SMTP_*` values in `backend/.env` (e.g. a Gmail address with an
[app password](https://support.google.com/accounts/answer/185833)). Leave them
blank to skip email — nothing else changes.

## 5. Role Access Summary

| Module               | Admin | Management | Teacher | Student | Parent |
|-----------------------|:-----:|:----------:|:-------:|:-------:|:------:|
| Dashboard stats       | ✅ | ✅ | ✅ | own data only | own children only |
| Students              | ✅ full | ✅ full | view only | own profile | — |
| Teachers              | ✅ full | ✅ full | — | — | — |
| Classes               | ✅ full | ✅ full | view | view | — |
| Attendance            | ✅ mark | — | ✅ mark | view own | view child's |
| Timetable             | ✅ full | ✅ full | view own | view own | — |
| Fees                  | ✅ full | ✅ full | — | view own | view child's |
| Library               | ✅ full | ✅ full | — | view own issues | — |
| Examination           | ✅ full | ✅ full | ✅ create/grade | view own results | view child's |
| Announcements         | ✅ post | ✅ post | view | view | view |
| Reports & Analytics   | ✅ | ✅ | — | — | — |
| User Access           | ✅ | — | — | — | — |
| Audit Log             | ✅ | — | — | — | — |
| Settings              | ✅ | ✅ | ✅ | ✅ | ✅ |

## 6. Production Build (frontend)

```bash
cd frontend
npm run build
```

Output goes to `frontend/dist/` — deploy it to any static host (Netlify, Vercel,
Nginx, etc.) and point `VITE_API_URL` to your deployed backend URL.

## 7. Notes / Next Steps

- This is a working MVP covering the core modules shown in your reference design
  (Student/Teacher/Fee/Exam management, Reports, Secure role-based access).
- You can extend it further: printable ID cards for staff, SMS gateway
  integration, multi-branch support, etc.
- For production, also set a strong random `JWT_SECRET`, enable HTTPS, and
  restrict `CLIENT_URL` in the backend `.env` to your real frontend domain.

### Bulk Import format

Students: an .xlsx/.csv with columns `name, email, roll_no, admission_no`
(any extra recognized student fields like `class_id`, `dob`, `gender` also work).
Teachers: `name, email, phone, subject`. Go to Students/Teachers → **Bulk Import**.

### Online Fee Payment — going live

The "Pay Now" button on the student Fees page currently uses a **demo
checkout** (`backend/controllers/paymentController.js`) that instantly marks
payments successful — no real money moves. To connect a real gateway:
1. Sign up for Razorpay or Stripe and get API keys.
2. In `createOrder()`, call the gateway's real "create order" API instead of
   generating a local mock order id.
3. In `confirmPayment()`, verify the gateway's signature/webhook instead of
   trusting the client-supplied payment id.
4. On the frontend (`Fees.jsx`), swap the demo confirm call for the gateway's
   checkout widget (e.g. Razorpay Checkout.js).

### Two-Factor Authentication

Any user can enable 2FA under Settings → scan the QR code with Google
Authenticator/Authy, then confirm. Once enabled, login requires the 6-digit
code from the app in addition to the password.

### Custom Branding

Admin → Settings → School Branding lets you set the school name, tagline and
logo. These appear on the login page, sidebar, and generated PDFs (ID cards,
marksheets, certificates use the school name; wire in the logo there too if
needed).
