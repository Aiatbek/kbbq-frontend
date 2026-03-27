# 🔥 KBBQ Restaurant — Full Stack Web App

A full-stack Korean BBQ restaurant application built with React, Node.js, Express, and MongoDB.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18 · Vite · React Router v6 · Tailwind CSS |
| Data      | TanStack React Query · Axios                    |
| Backend   | Node.js · Express 5 · MongoDB · Mongoose        |
| Auth      | express-session · connect-mongo · bcryptjs      |
| Deploy    | Vercel (frontend) · Railway (backend)           |

---

## Project Structure

```
/
├── kbbq-frontend/          React app (deploy to Vercel)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     Navbar, Layout
│   │   │   ├── menu/       MenuCard, MenuItemModal, CartDrawer
│   │   │   └── ui/         ErrorBoundary, PageLoader, Skeleton, PageTransition
│   │   ├── context/        AuthContext, CartContext, ToastContext
│   │   ├── pages/          All page components
│   │   ├── routes/         PrivateRoute, AdminRoute, GuestRoute
│   │   └── lib/            Axios instance
│   └── vercel.json
│
└── kbbq-backend/           Node.js API (deploy to Railway)
    ├── src/
    │   ├── controllers/    auth, menu, order, reservation, home, orderStats
    │   ├── models/         User, MenuItem, Order, Reservation, Home
    │   ├── routes/         auth, menu, order, reservation, home
    │   ├── middleware/      auth.js, requireRole.js
    │   └── config/         database.js, session.js
    └── railway.toml
```

---

## Local Development

### Prerequisites
- Node.js 18+
- npm
- MongoDB Atlas account (or local MongoDB)

### 1. Clone and install

```bash
# Backend
cd kbbq-backend
npm install

# Frontend
cd kbbq-frontend
npm install
```

### 2. Backend environment variables

Create `kbbq-backend/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/kbbq
PORT=5000
SESSION_SECRET=your-super-secret-key-change-this
ADMIN_EMAIL=admin@kkbbq.com
ADMIN_PASSWORD=Admin123!
CLIENT_URL=http://localhost:5173
```

### 3. Frontend environment variables

Create `kbbq-frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 4. Seed the admin user

```bash
cd kbbq-backend
npm run seed:admin
```

### 5. Start both servers

```bash
# Terminal 1 — backend
cd kbbq-backend
npm run dev        # runs on http://localhost:5000

# Terminal 2 — frontend
cd kbbq-frontend
npm run dev        # runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Endpoints

### Auth
| Method | Route               | Access | Description              |
|--------|---------------------|--------|--------------------------|
| POST   | /api/auth/register  | Public | Create account           |
| POST   | /api/auth/login     | Public | Login, sets session      |
| POST   | /api/auth/logout    | Auth   | Destroy session          |
| GET    | /api/auth/me        | Auth   | Get current user         |

### Menu
| Method | Route           | Access | Description              |
|--------|-----------------|--------|--------------------------|
| GET    | /api/menu       | Public | List all items           |
| POST   | /api/menu       | Admin  | Create item              |
| PUT    | /api/menu/:id   | Admin  | Update item              |
| DELETE | /api/menu/:id   | Admin  | Delete item              |

### Reservations
| Method | Route                        | Access | Description              |
|--------|------------------------------|--------|--------------------------|
| POST   | /api/reservations            | Auth   | Create reservation       |
| GET    | /api/reservations/my         | Auth   | My reservations          |
| GET    | /api/reservations            | Admin  | All reservations         |
| PATCH  | /api/reservations/:id/status | Admin  | Update status            |
| DELETE | /api/reservations/:id        | Admin  | Delete reservation       |

### Orders
| Method | Route                   | Access | Description              |
|--------|-------------------------|--------|--------------------------|
| POST   | /api/orders             | Auth   | Place order              |
| GET    | /api/orders/my          | Auth   | My orders                |
| GET    | /api/orders/admin       | Admin  | All orders               |
| GET    | /api/orders/stats       | Admin  | Order statistics         |
| PATCH  | /api/orders/:id/status  | Admin  | Update order status      |

### Home
| Method | Route      | Access | Description              |
|--------|------------|--------|--------------------------|
| GET    | /api/home  | Public | Get home content         |
| PUT    | /api/home  | Admin  | Update home content      |

---

## Deployment

### Backend → Railway

1. Push your backend to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your backend repo
4. Add environment variables in Railway dashboard:

```
MONGODB_URI=<your atlas URI>
SESSION_SECRET=<strong random string>
CLIENT_URL=<your vercel frontend URL>
PORT=5000
ADMIN_EMAIL=admin@kkbbq.com
ADMIN_PASSWORD=<strong password>
NODE_ENV=production
```

5. Railway will auto-detect Node.js and deploy. Your API will be at:
   `https://your-app.railway.app`

6. Seed admin on Railway (one-time):
   Go to Railway dashboard → your service → Shell tab:
   ```bash
   npm run seed:admin
   ```

### Frontend → Vercel

1. Push your frontend to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Set **Framework Preset** to `Vite`
4. Add environment variable:

```
VITE_API_URL=https://your-app.railway.app
```

5. Deploy. Vercel will run `npm run build` automatically.
6. `vercel.json` in the project root handles SPA routing (all paths → `index.html`).

### Production CORS

Once deployed, update your Railway `CLIENT_URL` env variable to your Vercel URL:
```
CLIENT_URL=https://your-app.vercel.app
```

Then redeploy the backend for the change to take effect.

---

## Session Security Checklist (before going live)

- [ ] `SESSION_SECRET` is a long random string (32+ chars), not a default
- [ ] `cookie.secure = true` in `session.js` (HTTPS only in production)
- [ ] `cookie.sameSite = 'none'` if frontend and backend are on different domains
- [ ] `MONGODB_URI` uses a dedicated Atlas user with least-privilege access
- [ ] Admin password is changed from the default seed value

Update `kbbq-backend/src/config/session.js` for production:

```js
cookie: {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',   // HTTPS in prod
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 1000 * 60 * 60 * 24
}
```

---

## Features Overview

| Feature                 | Customer | Admin |
|-------------------------|----------|-------|
| Browse menu             | ✓        | ✓     |
| Filter / search menu    | ✓        | ✓     |
| Add to cart             | ✓        | —     |
| Place pickup order      | ✓        | —     |
| Track order status      | ✓        | —     |
| Book a table            | ✓        | —     |
| View past reservations  | ✓        | —     |
| Manage menu items       | —        | ✓     |
| Manage all reservations | —        | ✓     |
| Order queue management  | —        | ✓     |
| Order statistics        | —        | ✓     |

---

## Scripts

### Frontend
```bash
npm run dev        # start dev server
npm run build      # production build
npm run preview    # preview production build locally
```

### Backend
```bash
npm run dev        # start with nodemon
npm start          # start for production
npm run seed:admin # seed the admin user
```
