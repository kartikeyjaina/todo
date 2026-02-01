import connectDB from "../lib/db.js";
import Todo from "../lib/Todo.js";
import { getUserFromToken } from "../lib/auth.js";

export default async function handler(req, res) {
  const { id } = req.query;
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,DELETE,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!id) return res.status(400).json({ error: "Todo id required" });
  await connectDB();

  const user = await getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.method === "GET") {
    try {
      const todo = await Todo.findOne({ _id: id, user: user._id });
      if (!todo) return res.status(404).json({ error: "Todo not found" });
      return res.status(200).json(todo);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    try {
      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};
      const update = {};
      if (typeof body.text === "string") update.text = body.text.trim();
      if (typeof body.completed === "boolean")
        update.completed = body.completed;
      const todo = await Todo.findOneAndUpdate(
        { _id: id, user: user._id },
        update,
        { new: true }
      );
      if (!todo) return res.status(404).json({ error: "Todo not found" });
      return res.status(200).json(todo);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      const todo = await Todo.findOneAndDelete({ _id: id, user: user._id });
      if (!todo) return res.status(404).json({ error: "Todo not found" });
      return res.status(200).json({ message: "Todo deleted" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
