/**
 * @format
 */
import { AppRegistry } from 'react-native';
import 'react-native-reanimated'; // ⚠️ doit être AVANT TOUT autre import
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
