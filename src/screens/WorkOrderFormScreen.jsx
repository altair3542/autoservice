// Formulario reutilizable para crear o editar órdenes.
// Si viene "id" por route params => modo edición (precarga con getWorkOrder).
// Si no hay "id" => modo creación. Valida campos mínimos y llama a la API.

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useRoute, useNavigation } from '@react-navigation/native';

import { getWorkOrder, createWorkOrder, updateWorkOrder } from '../api/workorders.js';

// Valores permitidos para estado y prioridad (uniformidad con la lista)
const STATUS_VALUES = ['nueva', 'diagnostico', 'en_proceso', 'en_espera', 'finalizada', 'entregada'];

const PRIORITY_VALUES = ['baja', 'media', 'alta'];

export default function WorkOrderFormScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const id = route.params?.id;
  const isNew = !id;

  // Estado UI
  const [loading, setLoading] = useState(false); // cargando datos (modo edición)
  const [saving, setSaving] = useState(false);   // guardando cambios

  // Estado del formulario (controlado)
    const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'nueva',
    priority: 'media',
    vehicleId: '',
    customerId: '',
    technicianId: '',
    promisedDate: '', // "YYYY-MM-DD"
  });

   // Carga de datos si estamos editando; setea el título del header
    useEffect(() => {
    if (isNew) {
      navigation.setOptions({ title: 'Nueva orden' });
      return;
    }
    navigation.setOptions({ title: `Editar orden #${id}` });
    setLoading(true);
    (async () => {
      try {
        const data = await getWorkOrder(id);
        setForm({
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'nueva',
          priority: data.priority || 'media',
          vehicleId: data.vehicleId != null ? String(data.vehicleId) : '',
          customerId: data.customerId != null ? String(data.customerId) : '',
          technicianId: data.technicianId != null ? String(data.technicianId) : '',
          promisedDate: data.promisedDate ? data.promisedDate.slice(0, 10) : '',
        });
      } catch (e) {
        Alert.alert('Error', e.message || 'No se pudo cargar la orden');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);


  // Helper para setear campos del form
   const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // Convierte string numérico a int o null (para json-server)
  const toIntOrNull = v => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
    // Si prefieres evitar nulls, podrías omitir campos indefinidos.
  };

  // Validación y guardado
  const onSave = async () => {
    if (!form.title.trim()) {
      Alert.alert('Validación', 'El título es obligatorio');
      return;
    }
    if (!form.status) {
      Alert.alert('Validación', 'El estado es obligatorio');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        vehicleId: toIntOrNull(form.vehicleId),
        customerId: toIntOrNull(form.customerId),
        technicianId: toIntOrNull(form.technicianId),
        promisedDate: form.promisedDate ? new Date(form.promisedDate).toISOString() : null,
      };
      const now = new Date().toISOString();

      if (isNew) {
        await createWorkOrder({ ...payload, createdAt: now, updatedAt: now });
      } else {
        await updateWorkOrder(id, { ...payload, updatedAt: now });
      }
      navigation.goBack(); // Regresa a la lista tras guardar
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo guardar la orden');
    } finally {
      setSaving(false);
    }
  };

    if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Título */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Título*</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={v => updateField('title', v)}
          placeholder="Título de la orden"
        />
      </View>

      {/* Descripción */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={form.description}
          onChangeText={v => updateField('description', v)}
          placeholder="Descripción breve"
          multiline
        />
      </View>

      {/* Estado */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Estado*</Text>
        <View style={styles.chipRow}>
          {STATUS_VALUES.map(val => (
            <Pressable
              key={val}
              style={[styles.chip, form.status === val && styles.chipActive]}
              onPress={() => updateField('status', val)}
            >
              <Text style={[styles.chipText, form.status === val && styles.chipTextActive]}>
                {val}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Prioridad */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Prioridad*</Text>
        <View style={styles.chipRow}>
          {PRIORITY_VALUES.map(val => (
            <Pressable
              key={val}
              style={[styles.chip, form.priority === val && styles.chipActive]}
              onPress={() => updateField('priority', val)}
            >
              <Text style={[styles.chipText, form.priority === val && styles.chipTextActive]}>
                {val}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Relaciones simples por ID (sesión 3 las convertiremos a selects) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Vehículo ID</Text>
        <TextInput
          style={styles.input}
          value={form.vehicleId}
          onChangeText={v => updateField('vehicleId', v)}
          placeholder="ID del vehículo"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Cliente ID</Text>
        <TextInput
          style={styles.input}
          value={form.customerId}
          onChangeText={v => updateField('customerId', v)}
          placeholder="ID del cliente"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Técnico ID</Text>
        <TextInput
          style={styles.input}
          value={form.technicianId}
          onChangeText={v => updateField('technicianId', v)}
          placeholder="ID del técnico"
          keyboardType="numeric"
        />
      </View>

      {/* Fecha prometida (ISO a partir de YYYY-MM-DD) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Fecha prometida</Text>
        <TextInput
          style={styles.input}
          value={form.promisedDate}
          onChangeText={v => updateField('promisedDate', v)}
          placeholder="YYYY-MM-DD"
        />
      </View>

      {/* Guardar */}
      <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Guardando…' : 'Guardar'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16 },
  fieldGroup: { marginBottom: 12 },
  label: { marginBottom: 4, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16,
    borderWidth: 1, borderColor: '#d1d5db', marginRight: 6, marginBottom: 6,
  },
  chipActive: { backgroundColor: '#0369a1', borderColor: '#0369a1' },
  chipText: { fontSize: 12, color: '#374151' },
  chipTextActive: { color: '#fff' },
  saveBtn: {
    backgroundColor: '#0ea5e9', paddingVertical: 12, borderRadius: 8,
    alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});


