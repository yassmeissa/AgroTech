import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import FloatingChatBotButton from './components/FloatingChatBotButton';
import ClimatScreen from './screens/ClimatScreen';
import DiagnoseScreen from './screens/DiagnoseScreen';
import FaceIDScreen from './screens/FaceIDScreen';
import HomeScreen from './screens/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: false // Cache les en-têtes par défaut pour tous les écrans
          }}
        >
          {/* <Stack.Screen 
            name="FaceIDScreen" 
            component={FaceIDScreen} 
          /> */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Diagnose" component={DiagnoseScreen} />
          <Stack.Screen name="Climat" component={ClimatScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Bouton flottant rendu conditionnellement (uniquement sur les écrans autorisés) */}
      <FloatingChatBotButton 
        visibleOnScreens={['Home', 'Diagnose', 'Climat']} 
      />
    </View>
  );
}