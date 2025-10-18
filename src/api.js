// src/api.js

// -------------------- AUTH (DummyJSON) --------------------
const DUMMY_BASE = 'https://dummyjson.com';

/**
 * login({ username, password })   o   login(username, password)
 * Devuelve el JSON de DummyJSON: { accessToken, id, username, email, ... }
 */
export async function login(arg1, arg2) {
  const creds = typeof arg1 === 'object' ? arg1 : { username: arg1, password: arg2 };
  const username = creds?.username ?? '';
  const password = creds?.password ?? '';

  if (!username) throw new Error('Falta username');
  // Nota: DummyJSON NO exige email; usa username.
  const res = await fetch(`${DUMMY_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, expiresInMins: 30 }),
  });
  if (!res.ok) throw new Error('Credenciales inválidas');
  return res.json();
}

export async function logout() {
  // No hay logout real en DummyJSON; deja el token en tu estado si lo usas.
  return true;
}

export async function me(id) {
  // Si quieres, puedes pedir datos al endpoint de usuarios de DummyJSON:
  // https://dummyjson.com/users/<id>
  if (id == null) return null;
  const r = await fetch(`${DUMMY_BASE}/users/${id}`);
  if (!r.ok) throw new Error('No se pudo cargar el perfil');
  return r.json();
}

// -------------------- Helper JSON local (json-server) --------------------
export const API_BASE = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001').replace(/\/$/, '');

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let msg = 'Request error';
    try {
      const t = await res.text();
      msg = t || `${res.status} ${res.statusText}`;
    } catch {
      msg = `${res.status} ${res.statusText}`;
    }
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

// -------------------- CLIENTES --------------------
export async function listCustomers({ q, page = 1, limit = 50, sortBy, order = 'asc' } = {}) {
  const params = new URLSearchParams();
  params.set('_page', String(page));
  params.set('_limit', String(limit));
  if (q) params.set('q', String(q));
  if (sortBy) { params.set('_sort', String(sortBy)); params.set('_order', order === 'desc' ? 'desc' : 'asc'); }
  return request(`/customers?${params.toString()}`);
}

export async function getCustomer(id) {
  if (id == null) throw new Error('Falta id de cliente');
  return request(`/customers/${id}`);
}

export async function createCustomer(payload) {
  const body = {
    name: (payload.name || '').trim(),
    email: (payload.email || '').trim(),
    phone: (payload.phone || '').trim(),
    document: (payload.document || '').trim(),
    address: (payload.address || '').trim(),
    meta: payload.meta ?? {},
    createdAt: payload.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return request('/customers', { method: 'POST', body });
}

export async function updateCustomer(id, payload) {
  if (id == null) throw new Error('Falta id de cliente');
  const body = {
    ...payload,
    name: payload.name != null ? String(payload.name).trim() : undefined,
    email: payload.email != null ? String(payload.email).trim() : undefined,
    phone: payload.phone != null ? String(payload.phone).trim() : undefined,
    document: payload.document != null ? String(payload.document).trim() : undefined,
    address: payload.address != null ? String(payload.address).trim() : undefined,
    updatedAt: new Date().toISOString(),
  };
  return request(`/customers/${id}`, { method: 'PATCH', body });
}

export async function deleteCustomer(id) {
  if (id == null) throw new Error('Falta id de cliente');
  await request(`/customers/${id}`, { method: 'DELETE' });
  return true;
}

// -------------------- VEHÍCULOS --------------------
export async function listVehicles({ q, page = 1, limit = 50, sortBy, order = 'asc', customerId, plate } = {}) {
  const params = new URLSearchParams();
  params.set('_page', String(page));
  params.set('_limit', String(limit));
  if (q) params.set('q', String(q));
  if (customerId != null) params.set('customerId', String(customerId));
  if (plate) params.set('plate', String(plate).toUpperCase());
  if (sortBy) { params.set('_sort', String(sortBy)); params.set('_order', order === 'desc' ? 'desc' : 'asc'); }
  return request(`/vehicles?${params.toString()}`);
}

export async function getVehicle(id) {
  if (id == null) throw new Error('Falta id de vehículo');
  return request(`/vehicles/${id}`);
}

export async function createVehicle(payload) {
  const body = {
    customerId: payload.customerId ?? null,
    plate: (payload.plate || '').trim().toUpperCase(),
    brand: (payload.brand || '').trim(),
    model: (payload.model || '').trim(),
    year: payload.year ? Number(payload.year) : null,
    meta: payload.meta ?? {},
    createdAt: payload.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return request('/vehicles', { method: 'POST', body });
}

export async function updateVehicle(id, payload) {
  if (id == null) throw new Error('Falta id de vehículo');
  const body = {
    ...payload,
    plate: payload.plate != null ? String(payload.plate).trim().toUpperCase() : undefined,
    brand: payload.brand != null ? String(payload.brand).trim() : undefined,
    model: payload.model != null ? String(payload.model).trim() : undefined,
    year: payload.year != null ? Number(payload.year) : undefined,
    updatedAt: new Date().toISOString(),
  };
  return request(`/vehicles/${id}`, { method: 'PATCH', body });
}

export async function deleteVehicle(id) {
  if (id == null) throw new Error('Falta id de vehículo');
  await request(`/vehicles/${id}`, { method: 'DELETE' });
  return true;
}

// -------------------- TÉCNICOS --------------------
export async function listTechnicians({ q, page = 1, limit = 50, sortBy, order = 'asc' } = {}) {
  const params = new URLSearchParams();
  params.set('_page', String(page));
  params.set('_limit', String(limit));
  if (q) params.set('q', String(q));
  if (sortBy) { params.set('_sort', String(sortBy)); params.set('_order', order === 'desc' ? 'desc' : 'asc'); }
  return request(`/technicians?${params.toString()}`);
}

export async function getTechnician(id) {
  if (id == null) throw new Error('Falta id de técnico');
  return request(`/technicians/${id}`);
}

export async function createTechnician(payload) {
  const body = {
    name: (payload.name || '').trim(),
    email: (payload.email || '').trim(),
    phone: (payload.phone || '').trim(),
    skills: Array.isArray(payload.skills) ? payload.skills : [],
    active: payload.active ?? true,
    meta: payload.meta ?? {},
    createdAt: payload.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return request('/technicians', { method: 'POST', body });
}

export async function updateTechnician(id, payload) {
  if (id == null) throw new Error('Falta id de técnico');
  const body = {
    ...payload,
    name: payload.name != null ? String(payload.name).trim() : undefined,
    email: payload.email != null ? String(payload.email).trim() : undefined,
    phone: payload.phone != null ? String(payload.phone).trim() : undefined,
    updatedAt: new Date().toISOString(),
  };
  return request(`/technicians/${id}`, { method: 'PATCH', body });
}

export async function deleteTechnician(id) {
  if (id == null) throw new Error('Falta id de técnico');
  await request(`/technicians/${id}`, { method: 'DELETE' });
  return true;
}

// -------------------- DEFAULT EXPORT (compat api.login(...)) --------------------
const api = {
  // auth (DummyJSON)
  login, logout, me,
  // helpers locales (json-server)
  API_BASE, request,
  // customers
  listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer,
  // vehicles
  listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle,
  // technicians
  listTechnicians, getTechnician, createTechnician, updateTechnician, deleteTechnician


};

export default api;
export {
  API_BASE as WORKORDERS_API_BASE,
  listWorkOrders,
  getWorkOrder,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
} from './api/workorders';
