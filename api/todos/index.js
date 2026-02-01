import connectDB from "../lib/db.js";
import Todo from "../lib/Todo.js";
import { getUserFromToken } from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  await connectDB();

  const user = await getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.method === "GET") {
    try {
      const todos = await Todo.find({ user: user._id }).sort({ createdAt: -1 });
      return res.status(200).json(todos);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      // const body =
      //   typeof req.body === "string"
      //     ? JSON.parse(req.body || "{}")
      //     : req.body || {};
      // const { text } = body;
      // let body = {};
      // try {
      //   body =
      //     typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      // } catch {
      //   body = {};
      // }
      let body = {};
      try {
        body =
          typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      } catch (err) {
        console.error("Invalid JSON body", err);
        body = {};
      }
      const { text } = body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Text is required" });
      }
      const todo = await Todo.create({ text: text.trim(), user: user._id });
      return res.status(201).json(todo);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
