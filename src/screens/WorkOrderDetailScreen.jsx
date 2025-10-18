import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { getWorkOrder, updateWorkOrder, deleteWorkOrder } from '../api';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';

console.log(getWorkOrder); 

const NEXT = {
  nueva:'diagnostico',
  diagnostico: 'en_proceso',
  en_proceso: 'finalizada',
  finalizada: 'entregada',
  entregada:'entregada'
}

export default function WorkOrderDetailScreen({ route, navigation }){
  const { id } = route.params
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  async function load(){
    setLoading(true); setError('');
    try{ setData(await getWorkOrder(id)); }
    catch(e){ setError(e.message||'Error'); }
    finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); },[id]);

  async function changeStatus(){
    const next = NEXT[data.status] || data.status
    if(next===data.status) return
    try{
      await updateWorkOrder(data.id,{ status: next, updatedAt: new Date().toISOString() })
      await load()
    } catch(e){ Alert.alert('Error, e.message')}
  }

  function confirmDelete(){
    Alert.alert('Eliminar', 'Realmente desea eliminar esta orden?', [
      {text:'cancelar'},
      {text:Eliminar,style:'destructive', onPress: onDelete}
    ])
  }
  async function onDelete(){
    try{ await deleteWorkOrder(data.id); navigation.goBack(); }
    catch(e){ Alert.alert('Error', e.message); }
  }

  if(loading) return <Loader />
  if(error) return <ErrorState message={error} onRetry={load} />
  if(!data) return null

  return (
    <ScrollView contentContainerStyle={s.box}>
      <Text style={s.h1}>{data.title}</Text>
      <Text style={s.meta}>
        Estado: <Text style={s.bold}>{data.status}</Text> · Prioridad: {data.priority}
      </Text>
      <Text style={s.meta}>
        Cliente ID: {data.customerId} · Vehículo ID: {data.vehicleId} · Técnico ID: {data.technicianId||'—'}
      </Text>
      <Text style={s.p}>{data.description||'Sin descripción'}</Text>

      <View style={s.row}>
        <Pressable style={[s.btn,{backgroundColor:'#0ea5e9'}]} onPress={changeStatus}>
          <Text style={s.bt}>Siguiente estado</Text>
        </Pressable>
        <Pressable style={[s.btn,{backgroundColor:'#fde68a'}]} onPress={()=>navigation.navigate('EditarOrden',{ id:data.id })}>
          <Text style={s.btd}>Editar</Text>
        </Pressable>
        <Pressable style={[s.btn,{backgroundColor:'#fecaca'}]} onPress={confirmDelete}>
          <Text style={s.btd}>Eliminar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

}

const s=StyleSheet.create({
  box:{ padding:16 },
  h1:{ fontSize:22, fontWeight:'800', marginBottom:6 },
  meta:{ color:'#6b7280', marginBottom:8 },
  p:{ marginVertical:12, lineHeight:20 },
  bold:{ fontWeight:'800', color:'#111827' },
  row:{ flexDirection:'row', gap:8, marginTop:8, flexWrap:'wrap' },
  btn:{ padding:12, borderRadius:10 },
  bt:{ color:'#fff', fontWeight:'700' },
  btd:{ color:'#111827', fontWeight:'700' },
});
