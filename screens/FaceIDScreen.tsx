import React, { useEffect, useRef, useState } from 'react';
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
import { TouchableOpacity } from 'react-native';

type BiometryType = 'TouchID' | 'FaceID' | 'Biometrics';

const FaceIDScreen = ({ navigation }) => {
  const [biometryType, setBiometryType] = useState<BiometryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [authInProgress, setAuthInProgress] = useState(false);
  const hasTriggeredFallback = useRef(false);
  const rnBiometrics = new ReactNativeBiometrics();

  useEffect(() => {
    checkBiometricsAvailability();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (showFallback && !hasTriggeredFallback.current) {
      hasTriggeredFallback.current = true;
      handleDevicePasscodeAuth();
    }
  }, [showFallback]);

  const checkBiometricsAvailability = async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      if (available) {
        setBiometryType(biometryType ?? null);

        // 👇 Enregistrement préalable requis pour iOS
        if (Platform.OS === 'ios') {
          await Keychain.setGenericPassword('user', 'authenticated', {
            accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
            accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
            authenticationPrompt: {
              title: 'Code appareil requis',
              subtitle: 'Déverrouillez AgroTech',
              description: 'Entrez votre code pour continuer',
            },
          });
        }

        setTimeout(() => handleBiometricAuth(), 500);
      } else {
        setShowFallback(true);
      }
    } catch (error) {
      console.error('Biometry detection error:', error);
      setShowFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (authInProgress) return;
    setAuthInProgress(true);

    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authentification requise',
        cancelButtonText: 'Utiliser le code',
      });

      if (success) {
        navigation.replace('Home');
      } else {
        setShowFallback(true);
      }
    } catch (error) {
      console.error('Biometry error:', error);
      setShowFallback(true);
    } finally {
      setAuthInProgress(false);
    }
  };

  const handleDevicePasscodeAuth = async () => {
    if (authInProgress) return;
    setAuthInProgress(true);

    try {
      if (Platform.OS === 'ios') {
        const options = {
          accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
          accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
          authenticationPrompt: {
            title: 'Code appareil requis',
            subtitle: 'Déverrouillez AgroTech',
            description: 'Entrez votre code pour continuer',
          },
        };

        const credentials = await Keychain.getGenericPassword(options);

        if (credentials) {
          navigation.replace('Home');
        } else {
          throw new Error('Authentication failed');
        }
      } else {
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: 'Entrez votre code, schéma ou utilisez la biométrie',
          cancelButtonText: 'Annuler',
          deviceCredentialAllowed: true,
        } as any); // Type assertion pour bypass TS

        if (success) {
          navigation.replace('Home');
        } else {
          throw new Error('Authentication cancelled');
        }
      }
    } catch (error) {
      console.error('Device passcode error:', error);
      Alert.alert(
        'Authentification requise',
        'Vous devez vous authentifier pour accéder à l\'application',
        [
          {
            text: 'Réessayer',
            onPress: () => {
              hasTriggeredFallback.current = false;
              setShowFallback(false);
              handleBiometricAuth();
            },
          },
          { text: 'Quitter', onPress: () => BackHandler.exitApp() },
        ]
      );
    } finally {
      setAuthInProgress(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={styles.primaryColor.color} />
        <Text style={styles.loadingText}>Vérification de sécurité...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/face.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />

      {!showFallback ? (
        <>
          <Text style={styles.title}>
            {biometryType === 'FaceID' ? 'Face ID' : biometryType === 'TouchID' ? 'Touch ID' : 'Biométrie'}
          </Text>
          <Text style={styles.subtitle}>
            Utilisez {biometryType === 'FaceID' ? 'votre visage' : biometryType === 'TouchID' ? 'votre empreinte' : 'la biométrie'} pour vous connecter
          </Text>

          {!authInProgress && (
            <TouchableOpacity
              style={styles.button}
              onPress={handleBiometricAuth}
              disabled={authInProgress}
            >
              <Text style={styles.buttonText}>Authentifier</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <Text style={styles.title}>Code appareil</Text>
          <Text style={styles.subtitle}>
            Entrez le code de votre {Platform.OS === 'ios' ? 'iPhone' : 'téléphone'}
          </Text>

          {authInProgress && (
            <ActivityIndicator size="small" color={styles.primaryColor.color} style={styles.loader} />
          )}
        </>
      )}

      {authInProgress && (
        <ActivityIndicator size="large" color={styles.primaryColor.color} style={styles.fullScreenLoader} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  primaryColor: {
    color: '#2e7d32',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 20,
    color: '#2e7d32',
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
  fullScreenLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});

export default FaceIDScreen;