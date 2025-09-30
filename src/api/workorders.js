// Capa de acceso a datos (API) para Órdenes de Servicio.
// Se usa json-server local como backend mock. Puedes sobreescribir la URL
// con EXPO_PUBLIC_API_URL en tiempo de ejecución si no usas 10.0.2.2.

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://10.0.2.2:3001'

  /**
 * Lista de órdenes con paginación, búsqueda y filtro por estado.
 * json-server entiende _page y _limit; "q" hace búsqueda global.
 */

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
