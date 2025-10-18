import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function ErrorState({ message='Algo salio mal', onRetry }){
  return(
    <View style={s.c}>
      <Text style={s.h}>Error</Text>
      <Text style={s.p}>{message}</Text>
      {onRetry ? (
        <Pressable style={s.btn}>
          <Text style={s.bt}>Reintentar</Text>
        </Pressable>
      ): null}
    </View>
  )
}

const s=StyleSheet.create({
  c:{flex:1,alignItems:'center',justifyContent:'center',padding:24},
  h:{fontSize:18,fontWeight:'800'},
  p:{marginVertical:8,color:'#ef4444',textAlign:'center'},
  btn:{backgroundColor:'#0ea5e9',padding:10,borderRadius:10,marginTop:8},
  bt:{color:'#fff',fontWeight:'700'}
});
