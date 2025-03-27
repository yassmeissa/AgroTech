import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import DiagnoseScreen from './screens/DiagnoseScreen'; // Assurez-vous d'importer DiagnoseScreen
import HomeScreen from './screens/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Diagnose" component={DiagnoseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}