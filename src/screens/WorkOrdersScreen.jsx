// Stack interno exclusivo del Tab "Órdenes".
// Permite navegar Lista -> Formulario sin salir del tab.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkOrdersListScreen from './WorkOrdersListScreen.jsx';
import WorkOrderFormScreen from './WorkOrderFormScreen.jsx';

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
      {/* Formulario de crear/editar (se abre por navegación) */}
      <Stack.Screen
        name="WorkOrderForm"
        component={WorkOrderFormScreen}
        options={{ title: 'Orden' }}
      />
    </Stack.Navigator>
  );
}
