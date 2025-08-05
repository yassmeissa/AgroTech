import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import { StatusBar } from 'react-native';
const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();

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
    return true;
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
<View style={styles.mainContainer}>
<StatusBar backgroundColor="#FF9800" barStyle="light-content" />
<Header />
      <ImageBackground 
        source={require('../assets/background.png')} 
        style={styles.background}
        blurRadius={2}
      >
        <Animated.View 
          style={[
            styles.contentContainer, 
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.cardContainer}>
       
            <LinearGradient 
              colors={['#4CAF50', '#8BC34A']} 
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="photo-camera" size={40} color="white" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Diagnostic des cultures</Text>
              <Text style={styles.cardText}>
                Analysez la santé de vos plantes en prenant une photo
              </Text>
              <TouchableOpacity 
                style={styles.cardButton} 
                onPress={() => setIsModalVisible(true)}
                disabled={isLoading}
              >
                <Text style={styles.cardButtonText}>Commencer</Text>
              </TouchableOpacity>
            </LinearGradient>

            <LinearGradient 
              colors={['#2196F3', '#03A9F4']} 
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="wb-sunny" size={40} color="white" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Prévisions climatiques</Text>
              <Text style={styles.cardText}>
                Consultez les prévisions météo pour votre région
              </Text>
              <TouchableOpacity 
                style={styles.cardButton} 
                onPress={() => navigation.navigate('Climat')}
              >
                <Text style={styles.cardButtonText}>Voir</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <Modal
            isVisible={isModalVisible}
            onBackdropPress={() => setIsModalVisible(false)}
            backdropOpacity={0.7}
            animationIn="zoomIn"
            animationOut="zoomOut"
            animationInTiming={300}
            animationOutTiming={300}
            backdropTransitionInTiming={300}
            backdropTransitionOutTiming={300}
            style={styles.modal}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Méthode de diagnostic</Text>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Préparation de l'appareil photo...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cameraButton]}
                    onPress={openCamera}
                  >
                    <Icon name="photo-camera" size={24} color="white" />
                    <Text style={styles.modalButtonText}>Prendre une photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.modalButton, styles.galleryButton]}
                    onPress={openGallery}
                  >
                    <Icon name="photo-library" size={24} color="white" />
                    <Text style={styles.modalButtonText}>Choisir une photo</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Modal>
        </Animated.View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingTop: 0, // Pas de décalage nécessaire
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 10, // Petit espace après le header
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'space-around',
    marginTop: 20,
  },
  card: {
    borderRadius: 20,
    padding: 25,
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardIcon: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  cardButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cardButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#2c3e50',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  cameraButton: {
    backgroundColor: '#4CAF50',
  },
  galleryButton: {
    backgroundColor: '#2196F3',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default HomeScreen;