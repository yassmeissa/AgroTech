import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';

const FaceIDScreen = ({ navigation }) => {
  type BiometryType = 'TouchID' | 'FaceID' | 'Biometrics';
  const [biometryType, setBiometryType] = useState<BiometryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricAttempts, setBiometricAttempts] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const hasTriggeredFallback = useRef(false); // ⛔ éviter doubles appels
  const rnBiometrics = new ReactNativeBiometrics();

  useEffect(() => {
    checkBiometricsAvailability();
  }, []);

  useEffect(() => {
    if (showFallback && !hasTriggeredFallback.current) {
      hasTriggeredFallback.current = true;
      handleDevicePasscodeAuth(); // 🔥 Lancement auto du code
    }
  }, [showFallback]);

  const checkBiometricsAvailability = async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      if (available) {
        setBiometryType(biometryType ?? null);
        setTimeout(() => handleBiometricAuth(), 500);
      } else {
        setShowFallback(true);
      }
    } catch (error) {
      console.error('Erreur détection biométrie :', error);
      setShowFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authentification AgroTech requise',
        cancelButtonText: 'Utiliser le code appareil',
      });

      if (success) {
        setBiometricAttempts(0);
        navigation.replace('Home');
      } else {
        handleBiometricFailure();
      }
    } catch (error) {
      console.error('Erreur biométrie :', error);
      handleBiometricFailure();
    }
  };

  const handleBiometricFailure = () => {
    const newAttempts = biometricAttempts + 1;
    setBiometricAttempts(newAttempts);

    if (newAttempts >= 2) {
      setShowFallback(true); // ⛔ Pas de bouton
    } else {
      Alert.alert(
        'Échec de la reconnaissance',
        `Tentative ${newAttempts}/2 échouée.`,
        [
          { text: 'Réessayer', onPress: () => handleBiometricAuth() },
          { text: 'Utiliser le code', onPress: () => setShowFallback(true) },
        ]
      );
    }
  };

  const handleDevicePasscodeAuth = async () => {
    try {
      if (Platform.OS === 'ios') {
        const options = {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
          accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
          authenticationPrompt: {
            title: 'Code requis',
            subtitle: 'Déverrouillez l’accès',
            description: 'Pour accéder à AgroTech',
          },
        };

        const credentials = await Keychain.getGenericPassword(options);

        if (credentials) {
          navigation.replace('Home');
        } else {
          throw new Error('Aucune réponse');
        }
      } else {
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: 'Entrez votre code ou schéma',
          cancelButtonText: 'Annuler',
          deviceCredentialAllowed: true,
        } as any);

        if (success) {
          navigation.replace('Home');
        } else {
          throw new Error('Annulé');
        }
      }
    } catch (error) {
      console.error('Erreur code appareil :', error);
      Alert.alert(
        'Authentification requise',
        'Échec. Réessayez ou quittez l’app.',
        [
          { text: 'Réessayer', onPress: handleDevicePasscodeAuth },
          { text: 'Quitter', onPress: () => BackHandler.exitApp() },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Chargement sécurité...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/background.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      {!showFallback && (
        <>
          <Text style={styles.title}>
            {biometryType === 'FaceID'
              ? 'Authentification Face ID'
              : biometryType === 'TouchID'
              ? 'Authentification Touch ID'
              : 'Authentification Biométrique'}
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleBiometricAuth}>
            <Text style={styles.buttonText}>S’authentifier</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 20,
    color: '#2e7d32',
    fontSize: 16,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FaceIDScreen;