import React, { useRef, useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FloatingChatBotButton from './components/FloatingChatBotButton';
import ClimatScreen from './screens/ClimatScreen';
import DiagnoseScreen from './screens/DiagnoseScreen';
import HomeScreen from './screens/HomeScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import FaceIDScreen from './screens/FaceIDScreen';
const Stack = createStackNavigator();

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(null);
  const navigationRef = useRef();

  const allowedScreens = ['Home', 'Diagnose', 'Climat'];

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          setCurrentRoute(navigationRef.current.getCurrentRoute().name);
        }}
        onStateChange={() => {
          const routeName = navigationRef.current.getCurrentRoute().name;
          setCurrentRoute(routeName);
        }}
      >
        <Stack.Navigator
          initialRouteName="FaceIDScreen"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="FaceIDScreen" component={FaceIDScreen} /> 
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Diagnose" component={DiagnoseScreen} />
          <Stack.Screen name="Climat" component={ClimatScreen} />
          <Stack.Screen name="Chatbot" component={ChatbotScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      {/* ✅ Afficher uniquement si l'écran courant est autorisé */}
      {allowedScreens.includes(currentRoute) && <FloatingChatBotButton />}
    </View>
  );
}