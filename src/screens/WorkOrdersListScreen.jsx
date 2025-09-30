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
    }
  }
}
