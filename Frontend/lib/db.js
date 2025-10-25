import { hash } from 'bcryptjs';

// Simple in-memory user storage
// In production, replace with a real database
export let users = [];

export async function createUser(name, email, password) {
  // Check if user exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash password
  const hashedPassword = await hash(password, 12);
  
  // Create user
  const user = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword,
    createdAt: new Date()
  };
  
  users.push(user);
  
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

export function getUserByEmail(email) {
  return users.find(u => u.email === email);
}

export function getUserById(id) {
  return users.find(u => u.id === id);
}