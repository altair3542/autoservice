import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';

export default function SelectModal({
  visible = false,
  title = 'Selecciona un elemento',
  items = [],
  getLabel = (x) => String(x?.name ?? x?.plate ?? x?.id ?? ''),
  onClose,
  onSelect,
}) {
  const [q, setQ] = useState('');
  const [data, setData] = useState(items);

  useEffect(() => {
    setData(items);
  }, [items]);

  useEffect(() => {
    const v = (q || '').toLowerCase();
    setData(items.filter((it) => getLabel(it).toLowerCase().includes(v)));
  }, [q, items, getLabel]);

  const handleSelect = (item) => {
    try {
      onSelect?.(item);
    } finally {
      onClose?.();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : 'fullScreen'}
    >
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.title}>{title}</Text>

          <TextInput
            style={s.input}
            placeholder="Buscar..."
            value={q}
            onChangeText={setQ}
            placeholderTextColor="#9ca3af"
          />

          <FlatList
            data={data}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(it, idx) =>
              String(it?.id ?? it?.value ?? `${getLabel(it)}-${idx}`)
            }
            renderItem={({ item }) => (
              <Pressable style={s.row} onPress={() => handleSelect(item)}>
                <Text style={s.rowText}>{getLabel(item)}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={s.empty}>Sin resultados</Text>
            }
            style={{ maxHeight: 320 }}
          />

          <Pressable style={[s.btn, s.btnDark]} onPress={onClose}>
            <Text style={s.btnText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    maxWidth: 560,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    color: '#111827',
  },
  row: {
    paddingVertical: 10,
  },
  rowText: {
    fontSize: 16,
    color: '#111827',
  },
  empty: {
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 16,
  },
  btn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDark: {
    backgroundColor: '#111827',
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
