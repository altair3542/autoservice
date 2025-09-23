import { useContext } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { AuthContext } from '../auth/AuthContext'

export default function ProfileScreen() {
  const { user, signOut } = useContext(AuthContext)
  return (
    <View style={s.box}>
      <Text style={s.h1}>Perfil</Text>
      <Text style={s.p}>Usuario: {user?.username || '-'}</Text>
      <Pressable style={s.btn} onPress={signOut}><Text style={s.btnT}>Cerrar Sesion</Text></Pressable>
    </View>
  )
}

const s = StyleSheet.create({
  box:{ flex:1 , padding:16 },
  h1: { fontSize: 22, fontWeight:'800', marginBottom:8 },
  p: { color:'#374151', marginBottom: 12 },
  btn: { backgroundColor:'#ef4444', padding: 12, borderRadius: 10, alignItems:'center' },
  btnT: { color:'#fff', fontWeight:'700'}
})
