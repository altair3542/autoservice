// Lista paginada de órdenes con búsqueda y filtro por estado.
// Usa FlatList (infinite scroll) + pull-to-refresh.
// Al tocar un ítem, navega al formulario en modo edición.

import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { listWorkOrders } from '../api/workorders'

// Chips de filtro por estado (vacío = sin filtro).
const statusOptions = [
  { label: 'Todas', value: '' },
  { label: 'Nueva', value: 'nueva' },
  { label: 'Diagnóstico', value: 'diagnostico' },
  { label: 'En proceso', value: 'en_proceso' },
  { label: 'En espera', value: 'en_espera' },
  { label: 'Finalizada', value: 'finalizada' },
  { label: 'Entregada', value: 'entregada' },
];

export default function WorkOrdersListScreen() {
  const navigation = useNavigation();

  // Estados locales de la lista y UI
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')


  // Carga una página (append = true concatena, false reemplaza).
  const loadOrders = async (pageToLoad = 1, append = false) => {
    if (loading) return
    setLoading(true)
    try {
      const data = await listWorkOrders({
        question: query.trim() || undefined,
        status: status || undefined,
        page: pageToLoad,
        limit: 20,
      })
      setOrders(prev => (append ? [...prev, ...data] : data))
      setHasMore(data.length >=20)
      setPage(pageToLoad)
    } catch (e) {
      console.warn(e)
    } finally {
      setLoading(false)
    }
  }

  // Efecto: recargar al cambiar búsqueda/filtro.
  useEffect(() => {
    loadOrders(1, false)
  }, [query, status]);

  // infinite scroll (cargar siguiente pagina)
  const loadMore = () => {
    if (!hasMore || loading) return;
    loadOrders(page + 1, true)
  }

  // Pull to refresh (recarga pagina 1)
  const onRefresh = async () => {
    setRefreshing(true)
    await loadOrders(1, false)
    setRefreshing(false)
  }

  // Render de cada ítem (tocar = editar)
  const renderItem = ({ item }) => (
    <Pressable
      style={styles.item}
      onPress={() => navigation.navigate('WorkOrderForm', { id: item.id })}
    >
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemMeta}>Estado: {item.status}</Text>
      <Text style={styles.itemMeta}>
        Vehículo: {item.vehicleId ?? '-'} | Cliente: {item.customerId ?? '-'}
      </Text>
    </Pressable>
  )

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Buscar por título/descripción"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
      </View>
      <View style={styles.statusRow}>
        {statusOptions.map(opt => (
          <Pressable
            key={opt.value}
            style={[styles.statusBtn, status === opt.value && styles.statusBtnActive]}
            onPress={() => setStatus(opt.value)}
          >
            <Text
              style={[styles.statusBtnText, status === opt.value && styles.statusBtnTextActive]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* CTA para crear nueva orden */}
      <Pressable
        style={styles.newBtn}
        onPress={() => navigation.navigate('WorkOrderForm')}
      >
        <Text style={styles.newBtnText}>Nueva orden</Text>
      </Pressable>
      {/* Loader inicial si aún no hay datos */}
      {loading && orders.length === 0 ? <ActivityIndicator style={{ marginTop: 16 }} /> : null}

            {/* Lista paginada con infinito y refresh */}
      <FlatList
        data={orders}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          !loading && orders.length === 0 ? (
            <Text style={styles.empty}>No hay órdenes</Text>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchRow: { marginBottom: 8 },
  search: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, flex: 1,
  },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  statusBtn: {
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20,
    borderWidth: 1, borderColor: '#d1d5db', marginRight: 6, marginBottom: 6,
  },
  statusBtnActive: { backgroundColor: '#0369a1', borderColor: '#0369a1' },
  statusBtnText: { fontSize: 12, color: '#374151' },
  statusBtnTextActive: { color: '#fff' },
  newBtn: {
    backgroundColor: '#0ea5e9', paddingVertical: 10, borderRadius: 8,
    alignItems: 'center', marginBottom: 8,
  },
  newBtnText: { color: '#fff', fontWeight: '700' },
  item: {
    backgroundColor: '#f9fafb', padding: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8,
  },
  itemTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  itemMeta: { fontSize: 12, color: '#374151' },
  empty: { textAlign: 'center', marginTop: 20, color: '#6b7280' },
});
