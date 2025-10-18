// src/screens/WorkOrdersScreen.jsx
// Stack interno exclusivo del Tab "Órdenes".
// Permite navegar Lista -> Detalle -> Formulario sin salir del tab.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkOrdersListScreen from './WorkOrdersListScreen.jsx';
import WorkOrderFormScreen from './WorkOrderFormScreen.jsx';
import WorkOrderDetailScreen from './WorkOrderDetailScreen.jsx';

const Stack = createNativeStackNavigator();

export default function WorkOrdersScreen() {
  return (
    <Stack.Navigator>
      {/* Pantalla por defecto: lista de órdenes */}
      <Stack.Screen
        name="WorkOrdersList"
        component={WorkOrdersListScreen}
        options={{ title: 'Órdenes de Servicio' }}
      />
      {/* Detalle de una orden */}
      <Stack.Screen
        name="WorkOrderDetail"
        component={WorkOrderDetailScreen}
        options={{ title: 'Detalle de Orden' }}
      />
      {/* Formulario de crear/editar */}
      <Stack.Screen
        name="WorkOrderForm"
        component={WorkOrderFormScreen}
        options={{ title: 'Orden' }}
      />
    </Stack.Navigator>
  );
}
