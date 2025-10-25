import { compare } from 'bcryptjs';
import { users } from './db';

export async function verifyCredentials(email, password) {
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return null;
  }
  
  const isValid = await compare(password, user.password);
  
  if (!isValid) {
    return null;
  }
  
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}