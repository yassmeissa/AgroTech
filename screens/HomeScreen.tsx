import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { launchCamera, launchImageLibrary, type CameraOptions, type ImageLibraryOptions } from 'react-native-image-picker';
import Modal from 'react-native-modal';

const HomeScreen = ({ navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Vérification initiale des permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const permission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
          setHasCameraPermission(permission);
        } catch (error) {
          console.error('Permission check error:', error);
          setHasCameraPermission(false);
        }
      } else {
        // iOS gère les permissions différemment (demandées au moment de l'utilisation)
        setHasCameraPermission(null);
      }
    };

    checkPermissions();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permission caméra requise',
            message: 'AgroTech a besoin d\'accéder à votre caméra',
            buttonPositive: 'Autoriser',
            buttonNegative: 'Refuser'
          }
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasCameraPermission(isGranted);
        return isGranted;
      } catch (err) {
        console.error('Permission request error:', err);
        return false;
      }
    }
    return true; // Pour iOS, on suppose que la permission sera demandée par le système
  };

  const handleCameraError = (error: { code?: string; message?: string }) => {
    let errorMessage = 'Erreur inconnue';
    let showSettingsButton = false;

    switch (error.code) {
      case 'camera_unavailable':
        errorMessage = 'Aucune caméra disponible ou accessible sur cet appareil';
        showSettingsButton = true;
        break;
      case 'permission':
        errorMessage = 'Permission caméra refusée';
        showSettingsButton = true;
        break;
      default:
        errorMessage = error.message || 'Impossible d\'accéder à la caméra';
    }

    Alert.alert(
      'Erreur Caméra',
      errorMessage,
      [
        { text: 'OK', style: 'cancel' },
        ...(showSettingsButton ? [{ text: 'Paramètres', onPress: () => Linking.openSettings() }] : [])
      ]
    );
  };

  const openCamera = async () => {
    setIsLoading(true);
    
    try {
      // Vérification des permissions pour Android
      if (Platform.OS === 'android' && hasCameraPermission === false) {
        const permissionGranted = await requestCameraPermission();
        if (!permissionGranted) return;
      }

      const options: CameraOptions = {
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
        saveToPhotos: false,
        cameraType: 'back'
      };

      const result = await launchCamera(options);
      
      if (result.didCancel) {
        console.log('Utilisateur a annulé');
      } else if (result.errorCode) {
        handleCameraError({
          code: result.errorCode,
          message: result.errorMessage
        });
      } else if (result.assets?.[0]) {
        navigation.navigate('Diagnose', {
          option: 'camera',
          image: result.assets[0]
        });
      }
    } catch (error) {
      handleCameraError(error as { code?: string; message?: string });
    } finally {
      setIsLoading(false);
      setIsModalVisible(false);
    }
  };

  const openGallery = async () => {
    try {
      const options: ImageLibraryOptions = {
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1
      };

      const result = await launchImageLibrary(options);
      
      if (result.assets?.[0]) {
        navigation.navigate('Diagnose', {
          option: 'gallery',
          image: result.assets[0]
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder à la galerie');
    } finally {
      setIsModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur AgroTech 🌱</Text>
      <Text style={styles.description}>
        Diagnostic et soin pour vos cultures
      </Text>

      {/* Section Diagnostic */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnostic des cultures</Text>
        <Button
          title="Commencer le diagnostic"
          onPress={() => setIsModalVisible(true)}
          disabled={isLoading}
        />
      </View>

      {/* Section Climat */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prévisions climatiques</Text>
        <Button
          title="Voir les prévisions"
          onPress={() => navigation.navigate('Climat')}
        />
      </View>

      {/* Modal pour choisir l'option de diagnostic */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choisir une option</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#2c3e50" />
          ) : (
            <>
              <View style={styles.buttonContainer}>
                <Button
                  title="Prendre une photo"
                  onPress={openCamera}
                  disabled={isLoading}
                />
              </View>
              <View style={styles.buttonContainer}>
                <Button
                  title="Choisir une photo"
                  onPress={openGallery}
                  disabled={isLoading}
                />
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 40,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    width: '80%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#2c3e50',
  },
  buttonContainer: {
    marginVertical: 10,
    width: '100%',
  },
});

export default HomeScreen;