import connectDB from "../lib/db.js";
import User from "../lib/User.js";
import { signToken } from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body =
    typeof req.body === "string"
      ? JSON.parse(req.body || "{}")
      : req.body || {};
  const { email, password, name } = body;
  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: "Email is required" });
  }
  if (!password || String(password).length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  await connectDB();

  try {
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
    return res.status(201).json({ user: userObj, token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
