# Notes App Pro (MERN + JWT)

Per-user secure notes: bcrypt passwords, JWT auth, AES-256-GCM encrypted note content, Helmet, rate limiting.

## Local dev
```bash
cp .env.example .env        # fill in values
npm install
npm run dev:api             # terminal 1 -> :5000
npm run dev                 # terminal 2 -> :5173 (proxies /api)
```

## Deploy to Vercel
1. Push this folder to GitHub.
2. Create a free MongoDB Atlas cluster; Network Access -> allow 0.0.0.0/0; copy the connection string.
3. Vercel -> Add New Project -> import the repo (Root Directory = repo root; framework is detected as Vite).
4. Add env vars: MONGODB_URI, JWT_SECRET, ENCRYPTION_KEY (64 hex chars).
5. Deploy.
