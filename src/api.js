import * as SecureStore from 'expo-secure-store';

const BASE = 'https://dummyjson.com';
const BASE_URL = 'http://10.0.2.2:3001';


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

// ---------- Helpers ----------
function qs(obj){ const u=new URLSearchParams(); Object.entries(obj||{}).forEach(([k,v])=>{ if(v!==''&&v!==undefined&&v!==null) u.set(k,v); }); return u.toString(); }
async function http(path, opts){ const r=await fetch(`${BASE_URL}${path}`, opts); if(!r.ok){ throw new Error(await r.text()||'Request error'); } return r.json(); }


export async function listWorkOrders({ question, status, page = 1, limit = 20} = {}) {
  const params = new URLSearchParams();
  params.set('_page', page)
  params.set('_limit', limit)
  if (question) params.set('question', question)
  if (status) params.set('status', status)

  const res = await fetch(`${API_BASE}/workorders?${params.toString()}`)
  if (!res.ok) throw new Error('No se pudo cargar ordenes')
  return res.json
}

/** obtenemos una orden por su id */
export async function getWorkOrder(id) {
  const res = await fetch(`${API_BASE}/workorders?${id}`)
  if (!res.ok) throw new Error('Orden no encontrada')
  return res.json
}

/** Creamos una nueva orden (POST) */
export async function creatreWorkOrder(data) {
  const res = await fetch(`${API_BASE}/workorders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('No se pudo crear la orden')
  return res.json()
}

/**
 * Actualiza una orden existente (PUT).
 * Nota: si prefieres ediciones parciales, cambia a PATCH.
 */
export async function updateWorkOder(id, data) {
  const res = await fetch(`${API_BASE}/workorders`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('No se pudo actualizar la orden')
  return res.json()
}

/** Elimina una orden por ID. (Aun no exponemos boton en UI) */

export async function deleteWorkOrder(id) {
  const res = await fetch(`${API_BASE}/workorders${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('No se pudo eliminar la orden')
  return true
}

// ---------------- Customers ---------------- //

export async function listCustomers({ q = '', _page=1, _limit=20 }) {
  const query = qs({ q, _page, _limit})
  return http(`/customers?${query}`)
}

export async function createCustomer(data){
  return http(`/customers`, { method: 'POST', headers:{'Content-type':'application/json'}, body:JSON.stringify(data) })
}

export async function updateCustomer(id, data){
  return http(`/customers/${id}`, { method: 'PATCH', headers:{'Content-type':'application/json'}, body:JSON.stringify(data) })
}

export async function deleteCustomer(id){
  return http(`/customers/${id}`, { method: 'DELETE' })
}

// ---------- Vehicles ----------

export async function listVehicles({ q = '', customerId='', _page=1, _limit=20 }) {
  const query = qs({ q,customerId, _page, _limit})
  return http(`/vehicles?${query}`)
}
export async function createVehicle(data){
  return http('/vehicles',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
}

export async function updateVehicle(id, data){
  return http(`/vehicles/${id}`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
}
export async function deleteVehicle(id){
  return http(`/vehicles/${id}`,{ method:'DELETE' });
}

// ---------- Technicians ----------
export async function listTechnicians({ q='', _page=1, _limit=20 }={}) {
  const query = qs({ q, _page, _limit });
  return http(`/technicians?${query}`);
}
export async function createTechnician(data){
  return http('/technicians',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
}
export async function updateTechnician(id, data){
  return http(`/technicians/${id}`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
}
export async function deleteTechnician(id){
  return http(`/technicians/${id}`,{ method:'DELETE' });
}

