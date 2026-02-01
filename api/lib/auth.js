import jwt from "jsonwebtoken";
import User from "./User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export async function getUserFromToken(req) {
  const authHeader = req.headers?.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(userId).select("-password");
    return user;
  } catch {
    return null;
  }
}

export function requireAuth(handler) {
  return async (req, res) => {
    const user = await getUserFromToken(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    req.user = user;
    return handler(req, res);
  };
}
