# AutoService — README

Gestor de **servicios técnicos automotrices** hecho con **Expo + React Native** (JavaScript).  
MVP listo para correr en **Expo Go**, con **login clásico** (usuario/contraseña), **tabs** por dominio y **rutas protegidas**.

---

## ✨ Qué hace hoy (Sesión 1)

- **Login** contra API pública (DummyJSON) y **token** guardado en el dispositivo.
- **Splash** que restaura sesión al abrir la app.
- **Tabs**: Órdenes, Vehículos, Clientes, Técnicos y Perfil (stubs listos).
- **Rutas protegidas** (si no hay token → Login).

> Próximas sesiones: CRUD real de Órdenes/Clientes/Vehículos/Técnicos, filtros/búsqueda y pulido de UX.

---

## 🧱 Stack

- **Expo** (React Native, JS)
- **React Navigation** (Stack + Bottom Tabs)
- **expo-secure-store** para almacenar el token
- **fetch** nativo para llamadas HTTP
- Estilos con **StyleSheet** (sin Tailwind)

---

## 🗂️ Estructura de carpetas

```
autoservice/
├─ App.js
├─ app.json
├─ index.js               # (si existe, importa ./App)
└─ src/
   ├─ api.js              # auth (login/me) con DummyJSON
   ├─ auth/
   │  ├─ AuthContext.js   # contexto de sesión (token, user, signIn, signOut)
   │  ├─ LoginScreen.js
   │  └─ SplashScreen.js
   └─ screens/
      ├─ WorkOrdersScreen.js
      ├─ VehiclesScreen.js
      ├─ CustomersScreen.js
      ├─ TechniciansScreen.js
      └─ ProfileScreen.js
```

> Todo está en **.js** para máxima compatibilidad con Metro (Windows/Android).

---

## ✅ Requisitos

- Node LTS + npm
- Expo CLI (`npx expo ...`)
- Emulador Android (o dispositivo físico con **Expo Go**)

---

## ⚙️ Instalación

Dentro del proyecto:

```bash
# Navegación
npm i @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# Token seguro (funciona en Expo Go)
npx expo install expo-secure-store
```

---

## ▶️ Ejecutar

```bash
npx expo start -c
```

- Abre en **Expo Go** (Android emulador o físico).
- **Credenciales de prueba** (DummyJSON):
  - Usuario: `emilys`
  - Contraseña: `emilyspass`

Si el login es correcto, entrarás a las **Tabs** y el token quedará guardado. Al reabrir la app, el **Splash** restaurará la sesión.

---

## 🔐 Autenticación (cómo funciona)

- `POST https://dummyjson.com/auth/login` → devuelve `accessToken` y datos del usuario.
- Guardamos `accessToken` en **SecureStore**.
- `GET https://dummyjson.com/auth/me` con `Authorization: Bearer <token>` para restaurar sesión.
- Botón “Cerrar sesión” borra el token y vuelve a Login.

> Por simplicidad, hoy solo usamos DummyJSON para **auth**.  
> En el CRUD real usaremos un **mock local** (json-server) para **WorkOrders/Customers/Vehicles/Technicians**.

---

## 🧪 API mock (para el CRUD en siguientes sesiones)

Usaremos **json-server** en tu PC:

```bash
npm i -D json-server
```

Crea `db.json` en la raíz del proyecto:

```json
{
  "customers": [
    { "id": 1, "name": "Juan Pérez", "phone": "3001234567", "email": "juan@example.com" }
  ],
  "vehicles": [
    { "id": 1, "customerId": 1, "plate": "ABC123", "brand": "Toyota", "model": "Corolla", "year": 2018 }
  ],
  "technicians": [
    { "id": 1, "name": "Laura García", "phone": "3015550000" }
  ],
  "workorders": [
    {
      "id": 1,
      "vehicleId": 1,
      "customerId": 1,
      "technicianId": 1,
      "status": "nueva",
      "priority": "media",
      "title": "Cambio de aceite",
      "description": "Cliente reporta ruido al encender",
      "promisedDate": "2025-09-30T17:00:00.000Z",
      "createdAt": "2025-09-22T12:00:00.000Z",
      "updatedAt": "2025-09-22T12:00:00.000Z"
    }
  ]
}
```

Lanza el mock:

```bash
npx json-server --watch db.json --port 3001
```

### URL para el dispositivo/emulador

- **Android emulador (AVD)**: `http://10.0.2.2:3001`
- **Dispositivo físico o emulador con LAN**: `http://<TU_IP_LAN>:3001`  
  (Tu IP la ves con `ipconfig` en Windows).

> **Importante:** RN no usa CORS, pero si usas **HTTPS auto-firmado** fallará. Para el mock, usa **HTTP** plano.

En la próxima sesión, agregaremos funciones en `src/api.js` (o `src/api/workorders.js`, etc.) apuntando a esa base, p. ej.:

```js
const API_BASE = 'http://10.0.2.2:3001'; // o tu IP LAN

export async function listWorkOrders({ q, status, limit = 20, page = 1 }) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  params.set('_page', page);
  params.set('_limit', limit);

  const res = await fetch(`${API_BASE}/workorders?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar órdenes');
  return res.json();
}
```

---

## 🧭 Flujos principales

- **Login → Tabs** (si hay token, salta Login).
- **Órdenes** (tab por defecto): lista, creación, cambio de estado (próximo).
- **Vehículos/Clientes/Técnicos**: CRUDs simples (próximo).
- **Perfil**: ver usuario (del `me`) y cerrar sesión.

---

## 🧩 Modelo de datos (MVP)

```txt
Customer:   { id, name, phone, email? }
Vehicle:    { id, customerId, plate, brand, model, year, vin? }
Technician: { id, name, phone? }
WorkOrder:  {
  id, vehicleId, customerId, technicianId?,
  status: 'nueva'|'diagnostico'|'en_proceso'|'en_espera'|'finalizada'|'entregada',
  priority: 'baja'|'media'|'alta',
  title, description, promisedDate?, createdAt, updatedAt
}
```

---

## 🧹 Convenciones

- **Components** y **pantallas** pequeñas y legibles.
- Estilos en **StyleSheet** (nada de Tailwind).
- **Estados** de UI claros: cargando / vacío / error.
- **Sin** logs de datos sensibles; el token va en SecureStore.

---

## 🧯 Troubleshooting

- **“Unable to resolve … from …”**  
  Revisa que el archivo y **ruta** existan tal cual; borra caché:
  ```bash
  npx expo start -c
  ```

- **Se queda cargando**  
  Suele ser un fetch que falló. Abre consola de Metro (Ctrl/Cmd + m/d en emu) y revisa el error.  
  Verifica internet del emulador y que los endpoints respondan.

- **El mock no responde desde el emulador**  
  Usa `http://10.0.2.2:3001` (AVD) o tu **IP LAN** si usas dispositivo físico.  
  Asegúrate de que el firewall permita el puerto 3001.

- **No persiste la sesión**  
  Asegúrate de no limpiar SecureStore entre arranques y de que `GET /auth/me` devuelve 200.

---

## 🗺️ Roadmap (próximas sesiones)

1. **CRUD Órdenes**: lista paginada, crear/editar/eliminar, filtros por estado y búsqueda por placa/cliente.  
2. **CRUD Clientes/Vehículos/Técnicos**: selección en formularios de órdenes.  
3. Pulido UX: estados vacíos bonitos, confirmaciones, contadores por estado.

---

## 🧑‍💻 Scripts útiles

```bash
# App
npx expo start -c

# Mock JSON-server
npx json-server --watch db.json --port 3001
```

---

## 📄 Licencia

Uso educativo. Puedes adaptar el código libremente para tus proyectos.
