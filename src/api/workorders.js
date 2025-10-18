// src/api/workorders.js

// Base del backend (json-server)
const API_BASE = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001').replace(/\/$/, '');

// Helper local (no importamos desde ../api para NO crear ciclos)
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

/** Lista órdenes con filtros y paginación */
export async function listWorkOrders({
  question,
  status,
  page = 1,
  limit = 20,
  customerId,
  vehicleId,
  sortBy,
  order = 'desc',
} = {}) {
  const params = new URLSearchParams();
  params.set('_page', String(page));
  params.set('_limit', String(limit));
  if (question) params.set('q', String(question)); // json-server busca con "q"
  if (status) params.set('status', String(status));
  if (customerId != null) params.set('customerId', String(customerId));
  if (vehicleId != null) params.set('vehicleId', String(vehicleId));
  if (sortBy) {
    params.set('_sort', String(sortBy));
    params.set('_order', order === 'asc' ? 'asc' : 'desc');
  }
  return request(`/workorders?${params.toString()}`);
}

/** Obtiene una orden por id */
// export async function getWorkOrder(id) {
//   if (id == null) throw new Error('Falta id');
//   return request(`/workorders/${id}`);
// }


/** Crea una orden */
export async function createWorkOrder(payload) {
  const body = {
    customerId: payload.customerId ?? null,
    vehicleId: payload.vehicleId ?? null,
    title: (payload.title || '').trim(),
    description: (payload.description || '').trim(),
    status: payload.status || 'pending',          // pending | in_progress | done | cancelled
    priority: payload.priority || 'medium',       // low | medium | high
    scheduledAt: payload.scheduledAt ?? null,     // ISO string si aplica
    startedAt: payload.startedAt ?? null,
    finishedAt: payload.finishedAt ?? null,
    total: payload.total ?? 0,
    items: Array.isArray(payload.items) ? payload.items : [],
    meta: payload.meta ?? {},
    createdAt: payload.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return request('/workorders', { method: 'POST', body });
}

/** Actualiza una orden (PATCH) */
export async function updateWorkOrder(id, payload) {
  if (id == null) throw new Error('Falta id');

  const body = {
    ...payload,
    title: payload.title != null ? String(payload.title).trim() : undefined,
    description: payload.description != null ? String(payload.description).trim() : undefined,
    updatedAt: new Date().toISOString(),
  };

  return request(`/workorders/${id}`, { method: 'PATCH', body });
}

/** Elimina una orden */
export async function deleteWorkOrder(id) {
  if (id == null) throw new Error('Falta id');
  await request(`/workorders/${id}`, { method: 'DELETE' });
  return true;
}

// ---- DEFAULT EXPORT para compatibilidad con import apiWorkorders from '../api/workorders' ----
const workorders = {
  API_BASE,
  listWorkOrders,
  getWorkOrder,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
};

export default workorders;
