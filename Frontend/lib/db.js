import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("Please add MONGO_URI to environment variables");
}

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db("mood_monitor");
}

// ← ADD THIS — used by /api/auth/signup/route.js
export async function createUser(name, email, password) {
  const db = await getDb();

  const existingUser = await db.collection("users").findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hash(password, 12);

  const result = await db.collection("users").insertOne({
    name,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  });

  return {
    id: result.insertedId.toString(),
    name,
    email,
  };
}