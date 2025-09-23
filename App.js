import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, AuthContext } from './src/auth/AuthContext';
import SplashScreen from './src/auth/SplashScreen';
import LoginScreen from './src/auth/LoginScreen';
import WorkOrdersScreen from './src/screens/WorkOrdersScreen';
import VehiclesScreen from './src/screens/VehiclesScreen';
import CustomersScreen from './src/screens/CustomersScreen';
import TechniciansScreen from './src/screens/TechniciansScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { useContext } from 'react';

const Stack = createNativeStackNavigator();   // ✅ correcto
const Tabs  = createBottomTabNavigator();     // ✅ correcto

function AppTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="Ordenes" component={WorkOrdersScreen} options={{ title: 'Órdenes' }} />
      <Tabs.Screen name="Vehículos" component={VehiclesScreen} />
      <Tabs.Screen name="Clientes" component={CustomersScreen} />
      <Tabs.Screen name="Técnicos" component={TechniciansScreen} />
      <Tabs.Screen name="Perfil" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function RootGate() {
  const { isLoading, token } = useContext(AuthContext);
  if (isLoading) return <SplashScreen />;
  return (
    <Stack.Navigator>
      {token ? (
        <Stack.Screen name="App" component={AppTabs} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootGate />
      </NavigationContainer>
    </AuthProvider>
  );
}
