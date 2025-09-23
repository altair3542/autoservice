import { useContext, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { AuthContext } from './AuthContext';

export default function LoginScreen() {
  const { signIn } = useContext(AuthContext);
  const [username, setUsername] = useState('emilys');     // credenciales demo
  const [password, setPassword] = useState('emilyspass'); // credenciales demo
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await signIn(username.trim(), password.trim());
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.c}>
      <Text style={s.h1}>Ingresar a AutoService</Text>
      <TextInput
        style={s.input}
        placeholder="Usuario (ej: emilys)"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={s.input}
        placeholder="Contraseña (ej: emilyspass)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={[s.btn, loading && { opacity: 0.6 }]} onPress={onSubmit} disabled={loading}>
        <Text style={s.btnT}>{loading ? 'Ingresando…' : 'Entrar'}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  c:{ flex:1, justifyContent:'center', padding:20 },
  h1:{ fontSize:22, fontWeight:'800', marginBottom:16 },
  input:{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, padding:12, marginBottom:12 },
  btn:{ backgroundColor:'#0ea5e9', padding:12, borderRadius:10, alignItems:'center' },
  btnT:{ color:'#fff', fontWeight:'700' },
});
