import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { listVehicles, createVehicle, updateVehicle, deleteVehicle, listCustomers } from '../api';
import SelectModal from '../components/SelectModal';

export default function VehiclesScreen(){
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({ id:null, customerId:null, plate:'', brand:'', model:'', year:'' });
  const [showCustomer, setShowCustomer] = useState(false);
  const [customers, setCustomers] = useState([]);

  async function load(){
    setRefreshing(true);
    try{ setItems(await listVehicles({ q })); }
    catch(e){ Alert.alert('Error', e.message); }
    finally{ setRefreshing(false); }
  }
  useEffect(()=>{ load(); },[q]);

  async function openCustomerPicker(){
    try{ setCustomers(await listCustomers({ q:'' })); setShowCustomer(true); }
    catch(e){ Alert.alert('Error', e.message); }
  }

  function edit(it){ setForm({ id:it.id, customerId:it.customerId, plate:String(it.plate||''), brand:it.brand||'', model:it.model||'', year:String(it.year||'') }); }
  function reset(){ setForm({ id:null, customerId:null, plate:'', brand:'', model:'', year:'' }); }

  async function save(){
    try{
      if(!form.plate?.trim()) return Alert.alert('Valida','La placa es obligatoria');
      const payload = { customerId: form.customerId, plate: form.plate.trim().toUpperCase(), brand: form.brand, model: form.model, year: Number(form.year)||null };
      if(form.id){ await updateVehicle(form.id, payload); } else { await createVehicle(payload); }
      reset(); load();
    }catch(e){ Alert.alert('Error', e.message); }
  }

  async function remove(id){
    Alert.alert('Confirmar','¿Eliminar vehículo?',[
      {text:'Cancelar'},
      {text:'Eliminar', style:'destructive', onPress: async()=>{ try{ await deleteVehicle(id); load(); }catch(e){ Alert.alert('Error', e.message); } }}
    ]);
  }

  const customerLabel = (id)=> customers.find(c=>c.id===id)?.name || `ID ${id}`;

  return (
    <View style={s.box}>
      <Text style={s.h1}>Vehículos</Text>
      <TextInput style={s.input} placeholder="Buscar por placa, marca, modelo..." value={q} onChangeText={setQ} />

      <View style={s.form}>
        <Text style={s.h2}>{form.id?'Editar vehículo':'Nuevo vehículo'}</Text>

        <Pressable style={[s.input,{justifyContent:'center'}]} onPress={openCustomerPicker}>
          <Text style={{color: form.customerId?'#111827':'#9ca3af'}}>
            {form.customerId ? `Cliente: ${customerLabel(form.customerId)}` : 'Seleccionar cliente'}
          </Text>
        </Pressable>

        <TextInput style={s.input} placeholder="Placa*" autoCapitalize="characters" value={form.plate} onChangeText={(v)=>setForm({...form,plate:v})}/>
        <TextInput style={s.input} placeholder="Marca" value={form.brand} onChangeText={(v)=>setForm({...form,brand:v})}/>
        <TextInput style={s.input} placeholder="Modelo" value={form.model} onChangeText={(v)=>setForm({...form,model:v})}/>
        <TextInput style={s.input} placeholder="Año" keyboardType="numeric" value={form.year} onChangeText={(v)=>setForm({...form,year:v})}/>

        <View style={s.row}>
          <Pressable style={[s.btn,{backgroundColor:'#0ea5e9'}]} onPress={save}><Text style={s.btnT}>{form.id?'Guardar':'Crear'}</Text></Pressable>
          {form.id ? <Pressable style={[s.btn,{backgroundColor:'#9ca3af'}]} onPress={reset}><Text style={s.btnT}>Cancelar</Text></Pressable> : null}
        </View>
      </View>

      <FlatList
        refreshing={refreshing}
        onRefresh={load}
        data={items}
        keyExtractor={it=>String(it.id)}
        renderItem={({item})=>(
          <View style={s.rowItem}>
            <View style={{flex:1}}>
              <Text style={s.title}>{item.plate} — {item.brand} {item.model} ({item.year||'s/a'})</Text>
              <Text style={s.meta}>Cliente ID: {item.customerId}</Text>
            </View>
            <Pressable style={[s.chip,{backgroundColor:'#fde68a'}]} onPress={()=>edit(item)}><Text>Editar</Text></Pressable>
            <Pressable style={[s.chip,{backgroundColor:'#fecaca'}]} onPress={()=>remove(item.id)}><Text>Eliminar</Text></Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>Sin vehículos</Text>}
      />

      <SelectModal
        visible={showCustomer}
        title="Seleccionar cliente"
        items={customers}
        getLabel={(c)=>`${c.name} · ${c.phone||''}`}
        onClose={()=>setShowCustomer(false)}
        onSelect={(c)=>{ setForm({...form, customerId:c.id}); setShowCustomer(false); }}
      />
    </View>
  );
}
const s = StyleSheet.create({
  box:{ flex:1, padding:16 },
  h1:{ fontSize:22, fontWeight:'800', marginBottom:8 },
  h2:{ fontSize:16, fontWeight:'700', marginBottom:8 },
  input:{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, padding:10, marginBottom:8 },
  form:{ marginVertical:8, padding:8, borderWidth:1, borderColor:'#e5e7eb', borderRadius:10 },
  row:{ flexDirection:'row', gap:8 },
  btn:{ flex:1, padding:12, borderRadius:10, alignItems:'center' },
  btnT:{ color:'#fff', fontWeight:'700' },
  rowItem:{ flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#e5e7eb', gap:8 },
  title:{ fontSize:16, fontWeight:'700' }, meta:{ color:'#6b7280' },
  chip:{ paddingHorizontal:10, paddingVertical:8, borderRadius:10 },
  empty:{ color:'#6b7280', textAlign:'center', marginTop:20 }
});
