import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { listCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api';

export default function CustomersScreen(){
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({ id:null, name:'', phone:'', email:'' });

  async function load(){
    setRefreshing(true);
    try{ setItems(await listCustomers({ q })); }
    catch(e){ Alert.alert('Error', e.message); }
    finally{ setRefreshing(false); }
  }
  useEffect(()=>{ load(); },[q]);

  function edit(it){ setForm({ id:it.id, name:it.name, phone:it.phone||'', email:it.email||'' }); }
  function reset(){ setForm({ id:null, name:'', phone:'', email:'' }); }

  async function save(){
    try{
      if(!form.name?.trim()) return Alert.alert('Valida', 'Nombre es obligatorio');
      if(form.id){ await updateCustomer(form.id, { name:form.name, phone:form.phone, email:form.email }); }
      else{ await createCustomer({ name:form.name, phone:form.phone, email:form.email }); }
      reset(); load();
    }catch(e){ Alert.alert('Error', e.message); }
  }

  async function remove(id){
    Alert.alert('Confirmar','¿Eliminar cliente?',[
      {text:'Cancelar'},
      {text:'Eliminar', style:'destructive', onPress: async()=>{ try{ await deleteCustomer(id); load(); }catch(e){ Alert.alert('Error', e.message); } }}
    ]);
  }

  return (
    <View style={s.box}>
      <Text style={s.h1}>Clientes</Text>
      <TextInput style={s.input} placeholder="Buscar..." value={q} onChangeText={setQ} />

      <View style={s.form}>
        <Text style={s.h2}>{form.id?'Editar cliente':'Nuevo cliente'}</Text>
        <TextInput style={s.input} placeholder="Nombre*" value={form.name} onChangeText={(v)=>setForm({...form,name:v})}/>
        <TextInput style={s.input} placeholder="Teléfono" keyboardType="phone-pad" value={form.phone} onChangeText={(v)=>setForm({...form,phone:v})}/>
        <TextInput style={s.input} placeholder="Email" keyboardType="email-address" value={form.email} onChangeText={(v)=>setForm({...form,email:v})}/>
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
              <Text style={s.title}>{item.name}</Text>
              <Text style={s.meta}>{item.phone}  {item.email}</Text>
            </View>
            <Pressable style={[s.chip,{backgroundColor:'#fde68a'}]} onPress={()=>edit(item)}><Text>Editar</Text></Pressable>
            <Pressable style={[s.chip,{backgroundColor:'#fecaca'}]} onPress={()=>remove(item.id)}><Text>Eliminar</Text></Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>Sin clientes</Text>}
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
  title:{ fontSize:16, fontWeight:'700' },
  meta:{ color:'#6b7280' },
  chip:{ paddingHorizontal:10, paddingVertical:8, borderRadius:10 },
  empty:{ color:'#6b7280', textAlign:'center', marginTop:20 }
});
