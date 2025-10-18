import { View, Text, StyleSheet } from 'react-native'
export default function EmptyState({ title='Sin datos', subtitle='Intenta cambiar filtros o crear un nuevo registro.' }){
  return (
    <View style={s.c}>
      <Text style={s.h}>{title}</Text>
      <Text style={s.p}>{subtitle}</Text>
    </View>
  )
}

const s=StyleSheet.create({
  c:{flex:1,alignItems:'center',justifyContent:'center',padding:24},
  h:{fontSize:18,fontWeight:'800'},
  p:{marginTop:6,color:'#6b7280',textAlign:'center'}
});

