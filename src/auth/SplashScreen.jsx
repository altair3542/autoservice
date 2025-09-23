import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function SplashScreen() {
  return <View style={s.c}><ActivityIndicator size="large" /></View>;
}
const s = StyleSheet.create({ c:{ flex:1, alignItems:'center', justifyContent:'center' } });
