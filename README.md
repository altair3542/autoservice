
# AutoService — README

> **Estado actual (noviembre 2025)**  
> App Expo/React Native con login **DummyJSON** y backend mock **json‑server** para datos locales
> (`customers`, `vehicles`, `technicians`, `workorders`). Se corrigieron errores en UI y API
> para crear/editar/borrar **Clientes**, **Vehículos** y **Órdenes**.

---

## 1) Requisitos

- Node.js 18+ (recomendado 20+)
- npm o pnpm
- **Expo** (CLI): `npx expo --version`
- **Android Emulator** o **dispositivo físico** con Expo Go
- **json-server** (vía `npx`, no necesita instalación global)

---

## 2) Instalación

```bash
# 1) Instalar dependencias
npm install

# 2) (Opcional) limpiar caché si cambiaste archivos
npx expo start -c
```

---

## 3) Configuración del backend (mock)

El proyecto usa **json-server** como mock para `customers`, `vehicles`, `technicians`, `workorders`.
Crea (o revisa) el archivo `db.json` en la **raíz** del repo con el siguiente contenido mínimo:

```json
{
  "users": [],
  "customers": [],
  "vehicles": [],
  "technicians": [],
  "workorders": []
}
```

### Levantar el mock
```bash
npx json-server --watch db.json --port 3001
```

- **Android Emulator**: la app accede al mock con `http://10.0.2.2:3001`
- **iOS simulator / desktop**: `http://localhost:3001`
- **Dispositivo físico (LAN)**: usa `http://<IP-de-tu-PC>:3001`

> La URL base se define en tiempo de ejecución con la variable
> `EXPO_PUBLIC_API_URL`. Si **no** la defines, en Android se usa
> `http://10.0.2.2:3001` por defecto.

---

## 4) Variables de entorno

Para **dispositivo físico** o si tu mock no corre en el host por defecto, define:

### macOS / Linux
```bash
EXPO_PUBLIC_API_URL="http://192.168.1.50:3001" npx expo start -c
```

### Windows PowerShell
```powershell
$env:EXPO_PUBLIC_API_URL = "http://192.168.1.50:3001"; npx expo start -c
```

> Cambia `192.168.1.50` por la IP **real** de tu PC en la red local.

---

## 5) Autenticación (DummyJSON)

El login **no** usa el mock local. Está **restaurado exactamente** como el proyecto original:
`POST https://dummyjson.com/auth/login` con **username** y **password**.

- Archivo: `src/api.js`
- Firma: `login({ username, password })` _o_ `login(username, password)`
- Respuesta: JSON de DummyJSON (`accessToken`, `id`, `username`, `email`, ...)

> Usa credenciales válidas de DummyJSON (ver documentación oficial).

---

## 6) Estructura relevante

```
src/
  api.js                  # Login DummyJSON + helper request + CRUD customers/vehicles/technicians
  api/
    workorders.js         # CRUD de órdenes (export *named* y *default*)
  components/
    SelectModal.jsx       # Selector reutilizable (FlatList / View corregidos)
  screens/
    CustomersScreen.jsx   # Crear/editar/borrar clientes
    VehiclesScreen.jsx    # Crear/editar/borrar vehículos
    WorkOrdersScreen.jsx  # Crear/editar/borrar órdenes
```

---

## 7) Arranque rápido

1. **Mock** (json-server):
   ```bash
   npx json-server --watch db.json --port 3001
   ```
2. **App** (Expo):
   ```bash
   npx expo start -c
   ```
3. Inicia la app en **Android**/**iOS** o escanea con **Expo Go**.

> Verifica el mock desde el emulador Android: abre su navegador y visita
> `http://10.0.2.2:3001/customers`. Debe responder JSON.

---

## 8) Convenciones de datos

- `vehicles.plate` se guarda **en mayúsculas**.
- `vehicles.year` es numérico (`null` si vacío).
- `workorders.status`: `pending | in_progress | done | cancelled`
- `workorders.priority`: `low | medium | high`
- Todas las colecciones usan `createdAt` / `updatedAt` (ISO).

---

## 9) API de la app (resumen)

### `src/api.js`
- **Auth (DummyJSON)**
  - `login({ username, password })` → DummyJSON `/auth/login`
  - `logout()` → noop
  - `me(id)` → DummyJSON `/users/:id` (opcional)
- **Helper local**
  - `request(path, opts)` → hace fetch al `API_BASE` (mock)
- **Customers**: `listCustomers`, `getCustomer`, `createCustomer`, `updateCustomer`, `deleteCustomer`
- **Vehicles**: `listVehicles`, `getVehicle`, `createVehicle`, `updateVehicle`, `deleteVehicle`
- **Technicians**: `listTechnicians`, `getTechnician`, `createTechnician`, `updateTechnician`, `deleteTechnician`

### `src/api/workorders.js`
- Named: `listWorkOrders`, `getWorkOrder`, `createWorkOrder`, `updateWorkOrder`, `deleteWorkOrder`
- **Default export** con todas las anteriores (para compatibilidad):
  ```js
  import apiWorkorders from '../api/workorders';
  await apiWorkorders.createWorkOrder(payload);
  ```

---

## 10) Cambios recientes (changelog)

- **SelectModal.jsx**
  - Corregido `FlatList` (no `Flatlist`) y `<View>` (no `<view>`).
  - Key extractor robusto y estilos/compat iOS/Android.

- **API (workorders.js)**
  - URLs correctas (`/workorders/:id`), filtro `q`, `default export` agregado.
  - Helper `request` local para evitar **require cycles**.

- **API (api.js)**
  - Restaurado **login DummyJSON** tal cual el proyecto original.
  - CRUD de `customers`, `vehicles`, `technicians` con normalizaciones (placa mayúsculas, año numérico).
  - Export **default** `api` para compat (`api.login(...)`).

- **Screens**
  - `VehiclesScreen.jsx`: validación de placa/año, creación/edición/refresh estable.
  - `WorkOrdersScreen.jsx`: select de cliente/vehículo/estado/prioridad y CRUD.
  - `CustomersScreen.jsx`: crear/editar/borrar con búsqueda reactiva.

---

## 11) Problemas comunes & soluciones

### “Network request failed” al crear
- Asegúrate de que **json-server** está arriba.
- Revisa `EXPO_PUBLIC_API_URL` según el entorno (Android/iOS/LAN).
- Prueba la URL desde el emulador: `http://10.0.2.2:3001/customers`.

### `_api.login is not a function`
- Usa el **default export** de `src/api.js`:
  ```js
  import api from '../api';
  await api.login({ username, password });
  ```

### `_apiWorkordersJs.createWorkOrder is not a function`
- Importa **default** o **named** desde `../api/workorders`:
  ```js
  // Opción A (default)
  import apiWorkorders from '../api/workorders';
  await apiWorkorders.createWorkOrder(payload);

  // Opción B (named)
  import { createWorkOrder } from '../api/workorders';
  await createWorkOrder(payload);
  ```

### Warning: “Require cycle: src/api/workorders.js -> …”
- `workorders.js` no debe importar desde `../api`. Ya se usa un helper **local**.
- Limpia caché de Metro:
  ```bash
  # mac/linux
  rm -rf node_modules/.cache
  npx expo start -c

  # windows
  Remove-Item -Recurse -Force node_modules\.cache
  npx expo start -c
  ```

### Emulador Android no ve mi IP LAN
- Usa `10.0.2.2` (alias de `localhost` del **host** desde el emulador).
- En dispositivo físico: apunta a `http://<IP-de-tu-PC>:3001` (misma red).

---

## 12) Flujo de prueba sugerido

1. **Login DummyJSON** con `username/password` válidos.
2. **Clientes**: crear uno nuevo.
3. **Vehículos**: crear vehículo y asociarlo al cliente (placa MAYÚSCULAS).
4. **Órdenes**: crear orden usando el cliente/vehículo previos.
5. Editar y borrar para validar el ciclo completo.
6. Hacer _pull to refresh_ y búsquedas con el cuadro “Buscar…”.

---

## 13) Roadmap corta

- Validaciones adicionales (email único, placa única).
- Manejo de token DummyJSON en headers (si se decide usarlo).
- Paginación con indicadores de fin de lista.
- Persistencia local (MMKV/AsyncStorage) para sesión.

---

## 14) Licencia
Proyecto con fines educativos/demostrativos.
