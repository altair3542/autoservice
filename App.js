// Navegación global: decide entre Login o Tabs; el Tab de Órdenes
// contiene el stack anterior (lista + formulario).

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, AuthContext } from './src/auth/AuthContext';
import SplashScreen from './src/auth/SplashScreen.jsx';
import LoginScreen from './src/auth/LoginScreen.jsx';

import WorkOrdersScreen from './src/screens/WorkOrdersScreen.jsx';
import VehiclesScreen from './src/screens/VehiclesScreen.jsx';
import CustomersScreen from './src/screens/CustomersScreen.jsx';
import TechniciansScreen from './src/screens/TechniciansScreen.jsx';
import ProfileScreen from './src/screens/ProfileScreen.jsx';

import { useContext } from 'react';

const Stack = createNativeStackNavigator();
const Tabs  = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="Órdenes" component={WorkOrdersScreen} />
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
