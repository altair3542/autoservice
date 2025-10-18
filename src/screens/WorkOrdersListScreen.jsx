// src/screens/WorkOrdersListScreen.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable,
  StyleSheet, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  listWorkOrders, updateWorkOrder, deleteWorkOrder, createWorkOrder
} from '../api.js';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const STATUS_OPTIONS = [
  { key: '', label: 'Todos' },
  { key: 'nueva', label: 'Nuevas' },
  { key: 'diagnostico', label: 'Diagnóstico' },
  { key: 'en_proceso', label: 'En proceso' },
  { key: 'finalizada', label: 'Finalizadas' },
  { key: 'entregada', label: 'Entregadas' },
];

const NEXT = { nueva:'diagnostico', diagnostico:'en_proceso', en_proceso:'finalizada', finalizada:'entregada', entregada:'entregada' };

export default function WorkOrdersListScreen() {
  const navigation = useNavigation();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchOrders({ resetPage = false } = {}) {
    setLoading(true);
    setError('');
    try {
      const data = await listWorkOrders({
        q: search,
        status,
        _page: resetPage ? 1 : page,
        _limit: 20,
      });
      setOrders(data);
      if (resetPage) setPage(1);
    } catch (e) {
      setError(e?.message || 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders({ resetPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  // Resumen por estado
  const resumen = useMemo(() => {
    return orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
  }, [orders]);

  // Acciones
  const handleAdvance = async (item) => {
    const next = NEXT[item.status] || item.status;
    if (next === item.status) return;
    try {
      await updateWorkOrder(item.id, { status: next, updatedAt: new Date().toISOString() });
      fetchOrders();
    } catch (e) {
      Alert.alert('Error', e?.message || 'No se pudo actualizar la orden');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirmar', '¿Eliminar esta orden?', [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWorkOrder(id);
            fetchOrders();
          } catch (e) {
            Alert.alert('Error', e?.message || 'No se pudo eliminar la orden');
          }
        },
      },
    ]);
  };

  const handleCreateQuick = async () => {
    // Crea una orden mínima de prueba (puedes quitar esto si usarás solo el formulario)
    const now = new Date().toISOString();
    const payload = {
      vehicleId: 1,
      customerId: 1,
      technicianId: 1,
      status: 'nueva',
      priority: 'media',
      title: `Orden rápida ${Date.now()}`,
      description: 'Creada desde el botón rápido',
      promisedDate: now,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await createWorkOrder(payload);
      fetchOrders();
    } catch (e) {
      Alert.alert('Error', e?.message || 'No se pudo crear la orden');
    }
  };

  // Render de cada fila
  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate('WorkOrderDetail', { id: item.id })}
      style={s.rowItem}
    >
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{item.title}</Text>
        <Text style={s.meta}>Estado: {item.status} · Prioridad: {item.priority}</Text>
      </View>
      <View style={s.rowBtns}>
        <Pressable style={[s.chip, { backgroundColor: '#fde68a' }]} onPress={() => handleAdvance(item)}>
          <Text>Avanzar</Text>
        </Pressable>
        <Pressable style={[s.chip, { backgroundColor: '#fecaca' }]} onPress={() => handleDelete(item.id)}>
          <Text>Eliminar</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  // UI principal
  return (
    <View style={s.box}>
      <Text style={s.h1}>Órdenes de Servicio</Text>

      {/* Búsqueda */}
      <TextInput
        style={s.input}
        placeholder="Buscar por placa, cliente o título"
        value={search}
        onChangeText={setSearch}
      />

      {/* Filtro por estado */}
      <View style={s.filters}>
        {STATUS_OPTIONS.map(opt => (
          <Pressable
            key={opt.key || 'all'}
            style={[
              s.filterChip,
              status === opt.key && { backgroundColor: '#0ea5e9' }
            ]}
            onPress={() => setStatus(opt.key)}
          >
            <Text style={[s.filterText, status === opt.key && { color: '#fff' }]}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Resumen */}
      <View style={s.summary}>
        <Chip label={`Nuevas: ${resumen.nueva || 0}`} />
        <Chip label={`Diag.: ${resumen.diagnostico || 0}`} />
        <Chip label={`En proc.: ${resumen.en_proceso || 0}`} />
        <Chip label={`Finalizadas: ${resumen.finalizada || 0}`} />
        <Chip label={`Entregadas: ${resumen.entregada || 0}`} />
      </View>

      {/* Lista / estados de UI */}
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchOrders()} />
      ) : orders.length === 0 ? (
        <EmptyState title="Sin órdenes" subtitle="Crea la primera desde el botón de abajo." />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          onRefresh={() => fetchOrders()}
          refreshing={loading}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* Botonera inferior */}
      <View style={s.footer}>
        <Pressable style={[s.btn, { backgroundColor: '#0ea5e9' }]} onPress={() => navigation.navigate('WorkOrderForm')}>
          <Text style={s.btnT}>Nueva Orden</Text>
        </Pressable>
        <Pressable style={[s.btn, { backgroundColor: '#10b981' }]} onPress={handleCreateQuick}>
          <Text style={s.btnT}>Crear Rápida</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Chip simple reutilizable
function Chip({ label }) {
  return (
    <View style={s.chipSummary}>
      <Text>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: { flex: 1, padding: 16 },
  h1: { fontSize: 22, fontWeight: '800', marginBottom: 8 },

  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
    padding: 10, marginBottom: 8
  },

  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  filterChip: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10
  },
  filterText: { color: '#111827', fontWeight: '600' },

  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chipSummary: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10
  },

  rowItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', gap: 8
  },
  title: { fontSize: 16, fontWeight: '700' },
  meta: { color: '#6b7280', marginTop: 4 },

  rowBtns: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },

  footer: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    flexDirection: 'row', gap: 10
  },
  btn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: '700' },
});
