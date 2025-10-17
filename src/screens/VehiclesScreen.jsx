// src/screens/VehiclesScreen.jsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import {
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  listCustomers,
} from '../api'; // <- Asegúrate que ../api exporte estas funciones (ya lo dejamos listo en el paso 3)

import SelectModal from '../components/SelectModal';

const initialForm = {
  id: null,
  customerId: null,
  plate: '',
  brand: '',
  model: '',
  year: '',
};

export default function VehiclesScreen() {
  // --------- estado general ----------
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // listado
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');

  // formulario
  const [form, setForm] = useState(initialForm);

  // modal de clientes
  const [showCustomers, setShowCustomers] = useState(false);
  const [customers, setCustomers] = useState([]);
  const selectedCustomerLabel = useMemo(() => {
    const found = customers.find((c) => String(c.id) === String(form.customerId));
    return found?.name || 'Seleccione cliente';
  }, [customers, form.customerId]);

  const load = useCallback(async (opts = {}) => {
    setLoading(true);
    try {
      const data = await listVehicles({
        q: opts.q ?? q,
        page: 1,
        limit: 200,
        sortBy: 'updatedAt',
        order: 'desc',
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('Error', String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [q]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const reset = () => setForm(initialForm);

  const edit = (it) => {
    setForm({
      id: it?.id ?? null,
      customerId: it?.customerId ?? null,
      plate: it?.plate ?? '',
      brand: it?.brand ?? '',
      model: it?.model ?? '',
      year: String(it?.year ?? ''),
    });
  };

  const validate = () => {
    const plate = (form.plate || '').trim().toUpperCase();

    if (!plate) {
      Alert.alert('Valida', 'La placa es obligatoria');
      return false;
    }
    // Regla mínima: 5-7 chars alfanuméricos (soporta ABC123, ABC12D, etc.)
    if (!/^[A-Z0-9-]{5,7}$/.test(plate)) {
      Alert.alert('Valida', 'La placa no tiene un formato válido');
      return false;
    }

    if (form.year) {
      const y = Number(form.year);
      const now = new Date().getFullYear() + 1; // permite próximo modelo
      if (Number.isNaN(y) || y < 1950 || y > now) {
        Alert.alert('Valida', `El año debe estar entre 1950 y ${now}`);
        return false;
      }
    }

    return true;
  };

  const save = async () => {
    if (!validate()) return;

    try {
      const payload = {
        customerId: form.customerId ?? null,
        plate: form.plate.trim().toUpperCase(),
        brand: (form.brand || '').trim(),
        model: (form.model || '').trim(),
        year: form.year ? Number(form.year) : null,
      };

      if (form.id) {
        await updateVehicle(form.id, payload);
      } else {
        await createVehicle(payload);
      }

      reset();
      await load();
    } catch (e) {
      Alert.alert('Error', String(e?.message || e));
    }
  };

  const confirmDelete = (it) => {
    Alert.alert(
      'Eliminar vehículo',
      `¿Eliminar ${it?.plate || 'este vehículo'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle(it.id);
              if (form.id === it.id) reset();
              await load();
            } catch (e) {
              Alert.alert('Error', String(e?.message || e));
            }
          },
        },
      ],
    );
  };

  const openCustomers = async () => {
    try {
      // Cargamos clientes al abrir el modal para tener la lista fresca
      const data = await listCustomers({ q: '', page: 1, limit: 500, sortBy: 'name', order: 'asc' });
      setCustomers(Array.isArray(data) ? data : []);
      setShowCustomers(true);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los clientes');
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  // ------------- Render -------------
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.container}>
        {/* Header / Búsqueda */}
        <View style={s.header}>
          <Text style={s.h1}>Vehículos</Text>
          <TextInput
            style={s.search}
            placeholder="Buscar por placa, marca o cliente…"
            placeholderTextColor="#9ca3af"
            value={q}
            onChangeText={(v) => {
              setQ(v);
              // Búsqueda reactiva
              const handler = setTimeout(() => load({ q: v }), 200);
              return () => clearTimeout(handler);
            }}
          />
        </View>

        {/* Formulario */}
        <View style={s.card}>
          <Text style={s.subtitle}>{form.id ? 'Editar vehículo' : 'Nuevo vehículo'}</Text>

          <Pressable style={s.inputBtn} onPress={openCustomers}>
            <Text style={[s.inputBtnText, !form.customerId && { color: '#9ca3af' }]}>
              {selectedCustomerLabel}
            </Text>
          </Pressable>

          <TextInput
            style={s.input}
            placeholder="Placa"
            placeholderTextColor="#9ca3af"
            autoCapitalize="characters"
            value={form.plate}
            onChangeText={(v) => setForm((f) => ({ ...f, plate: v.toUpperCase() }))}
            maxLength={8}
          />

          <View style={s.row2}>
            <TextInput
              style={[s.input, s.inputHalf]}
              placeholder="Marca"
              placeholderTextColor="#9ca3af"
              value={form.brand}
              onChangeText={(v) => setForm((f) => ({ ...f, brand: v }))}
            />
            <TextInput
              style={[s.input, s.inputHalf]}
              placeholder="Modelo"
              placeholderTextColor="#9ca3af"
              value={form.model}
              onChangeText={(v) => setForm((f) => ({ ...f, model: v }))}
            />
          </View>

          <TextInput
            style={s.input}
            placeholder="Año (opcional)"
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            value={form.year}
            onChangeText={(v) => setForm((f) => ({ ...f, year: v.replace(/[^0-9]/g, '') }))}
            maxLength={4}
          />

          <View style={s.row}>
            <Pressable style={[s.btn, s.btnPrimary]} onPress={save}>
              <Text style={s.btnPrimaryText}>{form.id ? 'Guardar cambios' : 'Crear vehículo'}</Text>
            </Pressable>

            {form.id ? (
              <Pressable style={[s.btn, s.btnGhost]} onPress={reset}>
                <Text style={s.btnGhostText}>Cancelar</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Listado */}
        <View style={[s.card, { flex: 1 }]}>
          <Text style={s.subtitle}>Listado</Text>

          {loading ? (
            <View style={s.loading}>
              <ActivityIndicator />
              <Text style={s.loadingText}>Cargando…</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(it) => String(it.id)}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={({ item }) => (
                <View style={s.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemPlate}>{item.plate}</Text>
                    <Text style={s.itemLine}>
                      {item.brand || '—'} {item.model || ''}
                      {item.year ? ` · ${item.year}` : ''}
                    </Text>
                    {item.customerId != null ? (
                      <Text style={s.itemMeta}>Cliente ID: {item.customerId}</Text>
                    ) : null}
                  </View>

                  <View style={s.actions}>
                    <Pressable style={[s.smallBtn, s.smallBtnDark]} onPress={() => edit(item)}>
                      <Text style={s.smallBtnText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={[s.smallBtn, s.smallBtnDanger]}
                      onPress={() => confirmDelete(item)}
                    >
                      <Text style={s.smallBtnText}>Borrar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={s.empty}>No hay vehículos</Text>
              }
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          )}
        </View>
      </View>

      {/* Modal de selección de cliente */}
      <SelectModal
        visible={showCustomers}
        title="Selecciona un cliente"
        items={customers}
        getLabel={(c) => `${c.name}${c.document ? ` · ${c.document}` : ''}`}
        onSelect={(c) => setForm((f) => ({ ...f, customerId: c.id }))}
        onClose={() => setShowCustomers(false)}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
    backgroundColor: '#f9fafb',
  },
  header: {
    gap: 8,
  },
  h1: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  search: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  inputBtn: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  inputBtnText: {
    color: '#111827',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
  },
  row2: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inputHalf: {
    flex: 1,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#111827',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  btnGhostText: {
    color: '#111827',
    fontWeight: '700',
  },
  loading: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#6b7280',
  },
  item: {
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  itemPlate: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  itemLine: {
    color: '#374151',
    marginTop: 2,
  },
  itemMeta: {
    color: '#6b7280',
    marginTop: 2,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  smallBtnDark: {
    backgroundColor: '#111827',
  },
  smallBtnDanger: {
    backgroundColor: '#b91c1c',
  },
  smallBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 16,
  },
});
