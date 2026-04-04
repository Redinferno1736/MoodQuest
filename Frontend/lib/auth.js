import { compare } from "bcryptjs";
import { getDb } from "./db";

export async function verifyCredentials(email, password) {
  const db = await getDb();

  const user = await db.collection("users").findOne({ email });

  if (!user) return null;

  const isValid = await compare(password, user.password);
  if (!isValid) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}