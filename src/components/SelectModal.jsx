import { useState, useEffect } from 'react'
import { Modal, View, Text, TextInput, Flatlist, Pressable, StyleSheet } from 'react-native'

export default function SelectModal({ visible, title='Seleccionar', items=[], getLabel=(x)=>String(x?.name||x?.plate||x?.id), onClose, onSelect }) {
  const [q, setQ] = useState('')
  const [data, setData] = useState(items)

  useEffect(() =>{ setData(items)}, [items] )
  useEffect(()=> {
    const v = (q||'').toLowerCase()
    setData(items.filter(it => getLabel(it).toLowerCase().includes(v)))
  },[q,items])

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={s.wrap}>
        <view style={s.card}>
          <Text style={s.title}>{title}</Text>
          <TextInput style={s.input} placeholder='Buscar...' value={q} onChangeText={setQ}/>
          <FlatList
            data={data}
            keyExtractor={(it)=>String(it.id)}
            renderItem={({item}) => (
              <Pressable style={s.row} onPress={()=>onSelect?.(item)}>
                <Text style={s.txt}>{getLabel(item)}</Text>
              </Pressable>
            )}
            ListEmptyComponent={<Text style={s.empty}>Sin Resultados</Text>}
            style={{maxHeight:300}}
          />
          <Presable style={[s.btn,{backgroundColor:'#e5e7eb'}]}> onPress={onClose}<Text>Cancelar</Text></Presable>
        </view>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', alignItems:'center', justifyContent:'center', padding:16 },
  card:{ backgroundColor:'#fff', borderRadius:12, padding:16, width:'100%' },
  title:{ fontSize:18, fontWeight:'800', marginBottom:8 },
  input:{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, padding:10, marginBottom:8 },
  row:{ paddingVertical:10 },
  txt:{ fontSize:16 },
  empty:{ color:'#6b7280', textAlign:'center', paddingVertical:16 },
  btn:{ marginTop:8, padding:12, borderRadius:10, alignItems:'center' }
});
