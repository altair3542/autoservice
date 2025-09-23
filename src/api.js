import * as SecureStore from 'expo-secure-store';

const BASE = 'https://dummyjson.com';

export async function login({ username, password }) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, expiresInMins: 30 }),
  });
  if (!res.ok) throw new Error('Credenciales inválidas');
  return res.json(); // { accessToken, id, username, email, ... }
}

export async function me() {
  const token = await SecureStore.getItemAsync('accessToken');
  if (!token) throw new Error('No token');
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Sesión inválida');
  return res.json();
}
