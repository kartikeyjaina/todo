/**
 * Local Express server for development only.
 * On Vercel, /api routes are served as serverless functions.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./lib/db.js";
import User from "./lib/User.js";
import Todo from "./lib/Todo.js";
import { getUserFromToken, signToken } from "./lib/auth.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, message: "API running", base: "/api" });
});

async function requireAuth(req, res, next) {
  await connectDB();
  const user = await getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.user = user;
  next();
}

app.post("/api/auth/register", async (req, res) => {
  await connectDB();
  try {
    const { email, password, name } = req.body || {};
    if (!email || !String(email).trim())
      return res.status(400).json({ error: "Email is required" });
    if (!password || String(password).length < 6)
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    const existing = await User.findOne({
      email: String(email).trim().toLowerCase(),
    });
    if (existing)
      return res.status(400).json({ error: "Email already registered" });
    const user = await User.create({
      email: String(email).trim().toLowerCase(),
      password: String(password),
      name: name ? String(name).trim() : "",
    });
    const token = signToken(user._id.toString());
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ user: userObj, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  await connectDB();
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });
    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    });
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });
    const valid = await user.comparePassword(String(password));
    if (!valid)
      return res.status(401).json({ error: "Invalid email or password" });
    const token = signToken(user._id.toString());
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ user: userObj, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/todos", requireAuth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/todos", requireAuth, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || !String(text).trim())
      return res.status(400).json({ error: "Text is required" });
    const todo = await Todo.create({
      text: String(text).trim(),
      user: req.user._id,
    });
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/todos/:id", requireAuth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/todos/:id", requireAuth, async (req, res) => {
  try {
    const { text, completed } = req.body || {};
    const update = {};
    if (typeof text === "string") update.text = text.trim();
    if (typeof completed === "boolean") update.completed = completed;
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      update,
      { new: true }
    );
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/todos/:id", requireAuth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`API running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
