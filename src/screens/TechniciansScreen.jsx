import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { listTechnicians, createTechnician, updateTechnician, deleteTechnician } from '../api';

export default function TechniciansScreen(){
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({ id:null, name:'', phone:'' });

  async function load(){
    setRefreshing(true);
    try{ setItems(await listTechnicians({ q })); }
    catch(e){ Alert.alert('Error', e.message); }
    finally{ setRefreshing(false); }
  }
  useEffect(()=>{ load(); },[q]);

  function edit(it){ setForm({ id:it.id, name:it.name, phone:it.phone||'' }); }
  function reset(){ setForm({ id:null, name:'', phone:'' }); }

  async function save(){
    try{
      if(!form.name?.trim()) return Alert.alert('Valida', 'Nombre es obligatorio');
      if(form.id){ await updateTechnician(form.id, { name:form.name, phone:form.phone }); }
      else{ await createTechnician({ name:form.name, phone:form.phone }); }
      reset(); load();
    }catch(e){ Alert.alert('Error', e.message); }
  }

  async function remove(id){
    Alert.alert('Confirmar','¿Eliminar técnico?',[
      {text:'Cancelar'},
      {text:'Eliminar', style:'destructive', onPress: async()=>{ try{ await deleteTechnician(id); load(); }catch(e){ Alert.alert('Error', e.message); } }}
    ]);
  }

  return (
    <View style={s.box}>
      <Text style={s.h1}>Técnicos</Text>
      <TextInput style={s.input} placeholder="Buscar..." value={q} onChangeText={setQ} />

      <View style={s.form}>
        <Text style={s.h2}>{form.id?'Editar técnico':'Nuevo técnico'}</Text>
        <TextInput style={s.input} placeholder="Nombre*" value={form.name} onChangeText={(v)=>setForm({...form,name:v})}/>
        <TextInput style={s.input} placeholder="Teléfono" keyboardType="phone-pad" value={form.phone} onChangeText={(v)=>setForm({...form,phone:v})}/>
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
              <Text style={s.meta}>{item.phone}</Text>
            </View>
            <Pressable style={[s.chip,{backgroundColor:'#fde68a'}]} onPress={()=>edit(item)}><Text>Editar</Text></Pressable>
            <Pressable style={[s.chip,{backgroundColor:'#fecaca'}]} onPress={()=>remove(item.id)}><Text>Eliminar</Text></Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>Sin técnicos</Text>}
      />
    </View>
  );
}
const s = StyleSheet.create({
  box:{ flex:1, padding:16 }, h1:{ fontSize:22, fontWeight:'800', marginBottom:8 }, h2:{ fontSize:16, fontWeight:'700', marginBottom:8 },
  input:{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, padding:10, marginBottom:8 },
  form:{ marginVertical:8, padding:8, borderWidth:1, borderColor:'#e5e7eb', borderRadius:10 },
  row:{ flexDirection:'row', gap:8 }, btn:{ flex:1, padding:12, borderRadius:10, alignItems:'center' }, btnT:{ color:'#fff', fontWeight:'700' },
  rowItem:{ flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#e5e7eb', gap:8 },
  title:{ fontSize:16, fontWeight:'700' }, meta:{ color:'#6b7280' }, chip:{ paddingHorizontal:10, paddingVertical:8, borderRadius:10 },
  empty:{ color:'#6b7280', textAlign:'center', marginTop:20 }
});

