# ProjectFlow 🚀

> Production-ready Trello-style Project Management SaaS with real-time collaboration, drag-and-drop, team analytics — built with Next.js 14, GraphQL, MongoDB, and Prisma.

![ProjectFlow Dashboard](https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&q=80)

---

## ✨ Features

- **Kanban Boards** — Drag-and-drop cards across lists with @dnd-kit
- **Real-time Collaboration** — Live updates via Pusher WebSockets
- **GraphQL API** — Apollo Server + Client with full CRUD
- **MongoDB + Prisma 5** — Type-safe ORM with MongoDB Atlas
- **Team Workspaces** — Multi-workspace, roles (Owner/Admin/Member/Viewer)
- **Card Details** — Descriptions, due dates, priority, assignees, labels, checklists, comments, attachments, cover colors
- **Analytics Dashboard** — Recharts: activity trends, status distribution, priority breakdown, team productivity
- **Auth** — NextAuth.js (credentials + Google OAuth + GitHub OAuth)
- **Notifications** — In-app real-time notifications
- **Dark UI** — Polished dark-mode design with Tailwind CSS

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| GraphQL | Apollo Server 4 + Apollo Client 3 |
| Database | MongoDB Atlas |
| ORM | Prisma 5 |
| Auth | NextAuth.js 4 |
| Real-time | Pusher Channels |
| Drag & Drop | @dnd-kit |
| Charts | Recharts |
| State | Zustand |
| Styling | Tailwind CSS + Radix UI |
| Deployment | Vercel (frontend) + Render (optional) |

---

## 🚀 Quick Start (Local)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/projectflow.git
cd projectflow
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# MongoDB Atlas connection string
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/projectflow?retryWrites=true&w=majority"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-char-secret-here"

# Pusher (https://pusher.com — free tier)
PUSHER_APP_ID="your-app-id"
PUSHER_APP_KEY="your-app-key"
PUSHER_APP_SECRET="your-app-secret"
PUSHER_CLUSTER="mt1"
NEXT_PUBLIC_PUSHER_APP_KEY="your-app-key"
NEXT_PUBLIC_PUSHER_CLUSTER="mt1"

# Optional: OAuth providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to MongoDB Atlas
npm run prisma:push

# Optional: seed demo data
npm run prisma:seed
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Demo credentials (after seed): `demo@projectflow.dev` / `password123`

---

## ☁️ Deploy to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/projectflow.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Add all environment variables from `.env.local`
5. Click **Deploy**

### Step 3: Set NEXTAUTH_URL

After first deploy, add to Vercel env vars:
```
NEXTAUTH_URL=https://your-app.vercel.app
```

Then redeploy.

---

## 🍃 MongoDB Atlas Setup

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a **free M0 cluster**
3. Add a database user (username + password)
4. Whitelist IP: `0.0.0.0/0` (allow all, for Vercel)
5. Get connection string: **Connect > Drivers > Node.js**
6. Replace `<password>` with your DB user password
7. Add `/projectflow` before `?retryWrites`

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/projectflow?retryWrites=true&w=majority
```

---

## 📡 Pusher Setup (Real-time)

1. Create account at [pusher.com](https://pusher.com) (free tier: 200k messages/day)
2. Create a **Channels** app
3. Copy App ID, Key, Secret, Cluster to your env vars
4. Enable **client events** in app settings

---

## 🔐 OAuth Setup (Optional)

### Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`

### GitHub OAuth
1. Go to GitHub > Settings > Developer settings > OAuth Apps
2. Homepage URL: `https://your-app.vercel.app`
3. Callback URL: `https://your-app.vercel.app/api/auth/callback/github`

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register pages
│   ├── (dashboard)/     # Protected app pages
│   │   ├── dashboard/   # Home dashboard
│   │   ├── board/[id]/  # Kanban board
│   │   ├── analytics/   # Analytics dashboard
│   │   └── settings/    # User settings
│   ├── api/
│   │   ├── graphql/     # Apollo Server endpoint
│   │   ├── auth/        # NextAuth.js handlers
│   │   ├── pusher/      # Pusher auth endpoint
│   │   └── register/    # User registration
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── board/           # KanbanBoard, ListColumn, CardItem, CardModal, etc.
│   ├── analytics/       # AnalyticsDashboard with Recharts
│   ├── layout/          # Sidebar, Topbar
│   └── ui/              # Shared UI components
├── graphql/
│   ├── schema/          # GraphQL type definitions
│   ├── resolvers/       # All resolvers (queries + mutations)
│   └── queries.ts       # Client-side gql queries/mutations
├── hooks/               # useRealtime, useDebounce
├── lib/                 # prisma, auth, pusher, utils
├── store/               # Zustand stores
└── types/               # TypeScript interfaces
prisma/
└── schema.prisma        # Full data model (14 models)
```

---

## 🗂 Data Model

Key entities:
- **User** → **WorkspaceMember** → **Workspace**
- **Workspace** → **Board** → **List** → **Card**
- **Card** → Labels, Comments, Attachments, Checklists, Activities
- **Notification** per user

---

## 🔧 Scripts

```bash
npm run dev           # Start dev server
npm run build         # Build for production (includes prisma generate)
npm run start         # Start production server
npm run prisma:push   # Sync schema to MongoDB
npm run prisma:seed   # Seed demo data
npm run prisma:studio # Open Prisma Studio (DB GUI)
```

---

## 📊 GraphQL Playground

Visit `/api/graphql` in development to access the Apollo Explorer.

Example query:
```graphql
query {
  me { id name email }
  workspaces { id name boards { id name cardCount } }
}
```

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📜 License

MIT License — free to use for personal and commercial projects.

---

Built with ❤️ using Next.js 14, GraphQL, MongoDB & Prisma
