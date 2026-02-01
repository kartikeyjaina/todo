import connectDB from "../lib/db.js";
import User from "../lib/User.js";
import { signToken } from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  //added authorization to header above
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body =
    typeof req.body === "string"
      ? JSON.parse(req.body || "{}")
      : req.body || {};
  const { email, password } = body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  await connectDB();

  try {
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
    return res.status(200).json({ user: userObj, token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
