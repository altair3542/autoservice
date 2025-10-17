import { View, ActivityIndicator, StyleSheet, Text } from 'react-native'

export default function Loader({ label = 'Cargando...'}){
  return (
    <View style={s.c}>
      <ActivityIndicator size='large'/>
      <Text style={s.t}>{label}</Text>
    </View>
  )
}

const s=StyleSheet.create({
  c:{flex:1,alignItems:'center',justifyContent:'center',padding:16},
  t:{marginTop:8,color:'#6b7280'}
});


