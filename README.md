# MERN Todo App

A modern, glassy-styled todo app built with the MERN stack (MongoDB, Express, React, Node), deployable on Vercel with both frontend and API.

## Features

- **Authentication**: Register and sign in with email/password (JWT). Todos are scoped per user.
- **API**: GET all todos, POST (create), PUT (edit + complete), DELETE — all require auth
- **UI**: Add, edit, delete, and mark todos complete with a glassmorphism-style design
- **Stack**: React (Vite), Express, MongoDB (Mongoose), Vercel serverless API

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. MongoDB

Create a database (e.g. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)) and set:

```bash
# .env (create in project root)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/todos
JWT_SECRET=your-secret-at-least-32-chars  # required in production
```

For local MongoDB:

```bash
MONGODB_URI=mongodb://localhost:27017/todos
```

### 3. Run the app

**Option A – Full stack with Vite proxy (recommended)**

- Terminal 1 – API:
  ```bash
  npm run dev:api
  ```
- Terminal 2 – Frontend:
  ```bash
  npm run dev
  ```
- Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to the Express server.

**Option B – Vercel CLI**

```bash
npx vercel dev
```

(Requires [Vercel CLI](https://vercel.com/cli) and env vars set in `.env` or Vercel.)

## Deploy on Vercel

1. Push the project to GitHub (or connect another Git provider).
2. In [Vercel](https://vercel.com), **Import** the repo.
3. Set **Environment Variables**:
   - `MONGODB_URI` — your MongoDB connection string (e.g. Atlas URI)
   - `JWT_SECRET` — a long random string for signing JWTs (e.g. 32+ chars)
4. Deploy. Vercel will:
   - Build the frontend with `npm run build` (Vite → `dist`)
   - Expose the serverless API under `/api/todos` and `/api/todos/[id]`

No extra build settings are needed if the repo root contains `package.json`, `vercel.json`, and the `api/` folder.

## API reference

All todo endpoints require `Authorization: Bearer <token>` (from login/register).

| Method | Path                 | Description                                             |
| ------ | -------------------- | ------------------------------------------------------- |
| POST   | `/api/auth/register` | Register (`body: { email, password, name? }`)           |
| POST   | `/api/auth/login`    | Login (`body: { email, password }`) → `{ user, token }` |
| GET    | `/api/todos`         | Get all todos for the current user                      |
| POST   | `/api/todos`         | Create todo (`body: { text }`)                          |
| GET    | `/api/todos/:id`     | Get one todo                                            |
| PUT    | `/api/todos/:id`     | Update todo (`body: { text?, completed? }`)             |
| DELETE | `/api/todos/:id`     | Delete todo                                             |

## Project structure

```
├── api/
│   ├── auth/
│   │   ├── login.js   # POST login
│   │   └── register.js # POST register
│   ├── lib/
│   │   ├── auth.js    # JWT verify, getUserFromToken
│   │   ├── db.js      # MongoDB connection (cached for serverless)
│   │   ├── Todo.js    # Mongoose model
│   │   └── User.js    # User model (email, hashed password)
│   ├── todos/
│   │   ├── index.js   # GET all, POST (auth required)
│   │   └── [id].js    # GET one, PUT, DELETE (auth required)
│   └── server.js      # Local Express dev server
├── public/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── components/
│   ├── api.js         # fetch wrapper with auth header
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css     # External glassy theme CSS
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

## License

MIT
