<div align="center">

<br/>

<img src="https://img.shields.io/badge/CampusPulse-MERN%20Stack-6366f1?style=for-the-badge&logo=react&logoColor=white" alt="CampusPulse"/>

# 🎓 CampusPulse

### The all-in-one college community platform — stay informed, get involved, and connect.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express.js-v4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)](#license)

</div>

---

## 📖 Overview

**CampusPulse** is a full-stack MERN web application built for college communities. It brings together five core pillars of student campus life into a single, cohesive platform:

| Pillar | Description |
|---|---|
| 📰 **News & Announcements** | Role-based posting (Admin/Club) with category filtering and real-time tags |
| 📅 **Events** | RSVP system with live capacity tracking and automatic waitlist promotion |
| 🙋 **Volunteering** | Apply to open volunteer needs with race-condition-safe slot allocation |
| ✍️ **Blogs** | General & placement-specific blog posts with structured interview rounds |
| 🤝 **Connections** | Follow/unfollow system with user profiles and a personalized feed |

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure sign-up gated to institutional email domain (`@college.edu`)
- 👥 **Role-Based Access** — Student, Club, Admin roles with different permissions
- ⚡ **Atomic RSVP & Slots** — MongoDB transactions prevent race conditions on limited-seat events and volunteer needs
- 🔔 **Notifications** — In-app notification system for RSVPs, follows, and volunteer updates
- 📊 **Live Stats & Trending** — Real-time campus stats and trending hashtag aggregation from all content types
- 🌱 **Seed Script** — One-command database seeding with realistic mock users, events, blogs, news, and volunteers

---

## 🏗️ Project Structure

```
CampusPulse/
├── client/                         # Frontend — Vite + React (JSX)
│   ├── public/                     # Static assets (favicon, logos)
│   └── src/
│       ├── api/                    # Axios instance with JWT interceptors
│       ├── components/             # Navbar, Modals, ProtectedRoute, Sidebars
│       ├── context/                # AuthContext — session & user state provider
│       ├── pages/                  # Full page views (News, Events, Blogs, Profile…)
│       └── index.css               # Design system, CSS variables, layout utilities
│
├── server/                         # Backend — Node.js + Express + Mongoose
│   ├── config/
│   │   └── db.js                   # MongoDB connection setup
│   ├── middleware/
│   │   └── auth.js                 # JWT verification middleware
│   ├── models/                     # Mongoose schemas (10 models)
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── RSVP.js
│   │   ├── VolunteerNeed.js
│   │   ├── VolunteerApplication.js
│   │   ├── BlogPost.js
│   │   ├── NewsPost.js
│   │   ├── Connection.js
│   │   ├── Notification.js
│   │   └── Placement.js
│   ├── routes/                     # REST API route handlers
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── events.js
│   │   ├── volunteers.js
│   │   ├── blogs.js
│   │   ├── news.js
│   │   ├── connections.js
│   │   ├── notifications.js
│   │   └── placements.js
│   ├── services/                   # Business logic & atomic operations
│   │   ├── rsvpService.js          # Atomic RSVP + waitlist promotion
│   │   └── volunteerService.js     # Atomic slot allocation
│   └── seed.js                     # Mock data seeder (20 users, events, blogs…)
│
├── .env.example                    # Environment variable template
├── package.json                    # Root runner — concurrent dev scripts
└── README.md
```

---

## ⚡ Concurrency & Atomic Operations

CampusPulse handles race conditions that commonly occur when multiple users compete for limited slots simultaneously.

### 1. Event RSVP — Capacity & Waitlist Promotion
> **File:** `server/services/rsvpService.js`

- RSVPs are handled inside **MongoDB transactions** (`session.startTransaction`) to atomically check confirmed counts and assign a `Confirmed` or `Waitlisted` status.
- When a confirmed RSVP is **cancelled**, the service automatically promotes the **oldest waitlisted user** in the same atomic transaction:
  ```js
  const nextWaitlisted = await RSVP.findOneAndUpdate(
    { event: eventId, status: 'Waitlisted' },
    { $set: { status: 'Confirmed' } },
    { sort: { createdAt: 1 }, new: true, session }
  );
  ```

### 2. Volunteer Slot Allocation
> **File:** `server/services/volunteerService.js`

- Instead of a JS-level check followed by a save (which creates a TOCTOU gap), slot approval uses a **single atomic `findOneAndUpdate`** with an embedded `$expr` condition:
  ```js
  const need = await VolunteerNeed.findOneAndUpdate(
    {
      _id: volunteerNeedId,
      $expr: { $lt: ['$slotsFilled', '$slotsTotal'] }
    },
    { $inc: { slotsFilled: 1 } },
    { new: true, session }
  );
  // Returns null if slots are already full — approval safely aborted
  ```

---

## ⚙️ Environment Setup

Create a `.env` file in the **project root** (copy from `.env.example`):

```env
# MongoDB connection string (local or Atlas)
MONGO_URI=mongodb://localhost:27017/campus-pulse

# Secret key for JWT signing — change this in production!
JWT_SECRET=your_jwt_secret_change_me_in_production

# Port for the Express API server
PORT=5000

# Only emails matching *@<domain> are allowed to register
COLLEGE_EMAIL_DOMAIN=college.edu
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **MongoDB** running locally on port `27017`, **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) cloud URI

### 1. Clone the repository

```bash
git clone https://github.com/Janani12407/CampusPulse.git
cd CampusPulse
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and set your MONGO_URI, JWT_SECRET, and COLLEGE_EMAIL_DOMAIN
```

### 3. Install all dependencies

```bash
npm run install-all
```
> This installs packages for the root, `server/`, and `client/` in one command.

### 4. Seed mock data *(optional but recommended)*

```bash
npm run seed
```
Populates the database with **20 mock users**, 4 events, 5 news posts, 3 volunteer needs, and 5 blog posts (General & Placement).

### 5. Start the development servers

```bash
npm run dev
```

| Service | URL |
|---|---|
| 🌐 Frontend (React/Vite) | http://localhost:5173 |
| 🔌 Backend API (Express) | http://localhost:5000/api |
| ❤️ Health Check | http://localhost:5000/api/health |

---

## 🔑 Seeded Test Accounts

All seeded accounts share the password: **`password123`**

| Role | Email |
|---|---|
| 👑 Admin | `admin@college.edu` |
| 🎭 Verified Club | `cultural@college.edu` |
| 🧑‍🎓 Student — CSE Year 1 | `arjun@college.edu` |
| 🧑‍🎓 Student — CSE Year 2 | `priya@college.edu` |
| 🧑‍🎓 Student — CSE Year 3 | `rahul@college.edu` |
| 🧑‍🎓 Student — ECE Year 2 | `ananya@college.edu` |
| 🧑‍🎓 Student — Chemical Year 4 | `varun@college.edu` |

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login & receive JWT |
| `GET` | `/api/news` | ❌ | List news/announcements |
| `POST` | `/api/news` | ✅ Admin/Club | Create news post |
| `GET` | `/api/events` | ❌ | List events |
| `POST` | `/api/events/:id/rsvp` | ✅ | RSVP to event |
| `DELETE` | `/api/events/:id/rsvp` | ✅ | Cancel RSVP |
| `GET` | `/api/volunteers` | ❌ | List volunteer needs |
| `POST` | `/api/volunteers/:id/apply` | ✅ | Apply to volunteer need |
| `GET` | `/api/blogs` | ❌ | List blog posts |
| `POST` | `/api/blogs` | ✅ | Create blog post |
| `GET` | `/api/connections/:id` | ✅ | Get user connections |
| `POST` | `/api/connections/:id/follow` | ✅ | Follow a user |
| `GET` | `/api/stats` | ❌ | Live campus statistics |
| `GET` | `/api/trending` | ❌ | Trending hashtags |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, react-hot-toast |
| **Backend** | Node.js, Express.js, Mongoose ODM |
| **Database** | MongoDB (local or Atlas) |
| **Auth** | JSON Web Tokens (JWT), bcryptjs |
| **Dev Tools** | Nodemon, Concurrently, dotenv |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for campus communities

</div>
