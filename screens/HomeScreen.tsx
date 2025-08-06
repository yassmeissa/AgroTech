import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { Svg, Line } from 'react-native-svg';
import SunArc from '../components/SunArc';
import  { Path, Circle } from 'react-native-svg';
import { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';
const { height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const apiKey = '73e3d10d8cfb49aeb2071342250104';

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];


  // 📍 Animation d'apparition
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
      }),
    ]).start();
  }, []);

  // 📍 Position utilisateur
  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      error => {
        console.log("Erreur GPS :", error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  // 📍 Météo par géolocalisation
  useEffect(() => {
    if (latitude && longitude) {
      axios
        .get(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=1`)
        .then(res => {
          setWeatherData(res.data);
        })
        .catch(err => {
          console.error('Erreur météo :', err);
        });
    }
  }, [latitude, longitude]);

  // 📷 Permission caméra
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
            message: "AgroTech a besoin d'accéder à votre caméra",
            buttonPositive: 'Autoriser',
            buttonNegative: 'Refuser',
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

  const handleCameraError = (error) => {
    let errorMessage = 'Erreur inconnue';
    let showSettingsButton = false;

    switch (error.code) {
      case 'camera_unavailable':
        errorMessage = 'Aucune caméra disponible';
        showSettingsButton = true;
        break;
      case 'permission':
        errorMessage = 'Permission caméra refusée';
        showSettingsButton = true;
        break;
      default:
        errorMessage = error.message || "Impossible d'accéder à la caméra";
    }

    Alert.alert('Erreur Caméra', errorMessage, [
      { text: 'OK', style: 'cancel' },
      ...(showSettingsButton ? [{ text: 'Paramètres', onPress: () => Linking.openSettings() }] : []),
    ]);
  };

  const openCamera = async () => {
    setIsLoading(true);

    try {
      if (Platform.OS === 'android' && hasCameraPermission === false) {
        const permissionGranted = await requestCameraPermission();
        if (!permissionGranted) return;
      }

      const result = await launchCamera({ mediaType: 'photo', quality: 1 });

      if (result.didCancel) {
        console.log('Utilisateur a annulé');
      } else if (result.errorCode) {
        handleCameraError(result);
      } else if (result.assets?.[0]) {
        navigation.navigate('Diagnose', {
          option: 'camera',
          image: result.assets[0],
        });
      }
    } catch (error) {
      handleCameraError(error);
    } finally {
      setIsLoading(false);
      setIsModalVisible(false);
    }
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });
      if (result.assets?.[0]) {
        navigation.navigate('Diagnose', {
          option: 'gallery',
          image: result.assets[0],
        });
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'accéder à la galerie");
    } finally {
      setIsModalVisible(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#FF9800" barStyle="light-content" />
      <Header />



{weatherData && (
  <View style={styles.weatherCardContainer}>
    <View style={styles.weatherCard}>
<View style={styles.locationRow}>
<EvilIcons name="location" size={26} color="#e74c3c" style={styles.locationIcon} />
  <Text style={styles.location}>{weatherData.location.name}</Text>
</View>  

<View style={styles.weatherMainRow}>
  {/* Température actuelle */}
  <View style={styles.tempRow}>
    <Text style={styles.tempValue}>+{weatherData.current.temp_c}</Text>
    <Text style={styles.tempUnit}>°C</Text>
  </View>

  {/* H / L */}
  <View style={styles.hlColumnCenter}>
    <View style={styles.hlRow}>
      <Text style={styles.hlText}>Max: {weatherData.forecast.forecastday[0].day.maxtemp_c}</Text>
      <Text style={styles.hlUnit}>°C</Text>
    </View>
    <View style={styles.hlRow}>
      <Text style={styles.hlText}>Min: {weatherData.forecast.forecastday[0].day.mintemp_c}</Text>
      <Text style={styles.hlUnit}>°C</Text>
    </View>
  </View>

  {/* Icône météo */}
  <Image source={{ uri: `https:${weatherData.current.condition.icon}` }} style={styles.weatherIconSmall} />
</View>
<View style={styles.dashedLineContainer}>
  <Svg height="2" width="100%">
<Line
  x1="0"
  y1="0"
  x2="100%"
  y2="0"
  stroke="#ccc"
  strokeWidth="2"
  strokeDasharray="12, 6" // ✅ Tirets plus longs et plus espacés
/>
  </Svg>
</View>
      <View style={styles.metricsRow}>
        <View><Text style={styles.label}>Humidité</Text><Text>{weatherData.current.humidity}%</Text></View>
        <View><Text style={styles.label}>Pluies</Text><Text>{weatherData.forecast.forecastday[0].day.totalprecip_mm} mm</Text></View>
        <View><Text style={styles.label}>Pression</Text><Text>{weatherData.current.pressure_mb} hPa</Text></View>
        <View><Text style={styles.label}>Vent</Text><Text>{weatherData.current.wind_kph} km/h</Text></View>
      </View>
<SunArc
  sunrise={weatherData.forecast.forecastday[0].astro.sunrise}
  sunset={weatherData.forecast.forecastday[0].astro.sunset}
/>
    </View>
  </View>
)}


      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.cardContainer}>
          <LinearGradient colors={['#4CAF50', '#8BC34A']} style={styles.card}>
            <Icon name="photo-camera" size={40} color="white" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Diagnostic des cultures</Text>
            <Text style={styles.cardText}>Analysez la santé de vos plantes en prenant une photo</Text>
            <TouchableOpacity style={styles.cardButton} onPress={() => setIsModalVisible(true)} disabled={isLoading}>
              <Text style={styles.cardButtonText}>Commencer</Text>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient colors={['#2196F3', '#03A9F4']} style={styles.card}>
            <Icon name="wb-sunny" size={40} color="white" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Prévisions climatiques</Text>
            <Text style={styles.cardText}>Consultez les prévisions météo pour votre région</Text>
            <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('Climat')}>
              <Text style={styles.cardButtonText}>Voir</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Animated.View>

      <Modal isVisible={isModalVisible} onBackdropPress={() => setIsModalVisible(false)} style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Méthode de diagnostic</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Préparation de l'appareil photo...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity style={[styles.modalButton, styles.cameraButton]} onPress={openCamera}>
                <Icon name="photo-camera" size={24} color="white" />
                <Text style={styles.modalButtonText}>Prendre une photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.galleryButton]} onPress={openGallery}>
                <Icon name="photo-library" size={24} color="white" />
                <Text style={styles.modalButtonText}>Choisir une photo</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  weatherCardContainer: {
  position: 'absolute',
  top: 180, // ou HEADER_HEIGHT - (hauteur à chevaucher)
  alignSelf: 'center',
  width: '90%',
  zIndex: 10,
  elevation: 10,
},
weatherCard: {
  backgroundColor: '#fff',
  borderRadius: 20,
  paddingVertical: 10,      // Padding vertical inchangé
  paddingHorizontal: 20,    // ✅ Padding horizontal ajouté
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 8,
},
  mainContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  contentContainer: { flex: 1, padding: 20 },
  cardContainer: { flex: 1, justifyContent: 'space-around', marginTop: 20 },
  card: {
    borderRadius: 20,
    padding: 25,
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },

  cardIcon: { marginBottom: 15 },
  cardTitle: {fontFamily: 'Poppins', fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 10, textAlign: 'center' },
  cardText: { fontFamily: 'Poppins',fontSize: 14, color: 'white', textAlign: 'center', marginBottom: 20, opacity: 0.9 },
  cardButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cardButtonText: {fontFamily: 'Poppins', color: 'white', fontWeight: 'bold', fontSize: 16 },
  modal: { justifyContent: 'center', alignItems: 'center', margin: 0 },
  modalContent: { backgroundColor: 'white', padding: 25, borderRadius: 20, width: '85%', alignItems: 'center' },
  modalTitle: { fontFamily: 'Poppins',fontSize: 22, fontWeight: 'bold', marginBottom: 25, color: '#2c3e50' },
  modalButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 15, borderRadius: 12, marginBottom: 15 },
  cameraButton: { backgroundColor: '#4CAF50' },
  galleryButton: { backgroundColor: '#2196F3' },
  modalButtonText: {fontFamily: 'Poppins', color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  loadingContainer: { alignItems: 'center', padding: 20 },
  loadingText: {fontFamily: 'Poppins', marginTop: 10, fontSize: 16, color: '#4CAF50', fontWeight: '600' },
  title: { fontFamily: 'Poppins',fontSize: 28, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', marginVertical: 20 },

  weatherTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  location: { fontFamily: 'Poppins',fontSize: 18, fontWeight: 'bold' },
  weatherIcon: { width: 50, height: 50 },
  minMax: { fontFamily: 'Poppins',fontSize: 14, color: '#666' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 1 },
  label: { fontFamily: 'Poppins',fontWeight: 'bold', color: '#555' },

  locationRow: {
  flexDirection: 'row',
  alignItems: 'center',
},



weatherHeaderRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
},

leftWeatherColumn: {
  justifyContent: 'flex-start',
},

rightWeatherColumn: {
  alignItems: 'flex-end',
},



locationIcon: {
  marginRight: 15,
},

tempBlock: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginTop: 10,
},

hlColumnRight: {
  marginLeft: 8,
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
},


temp: {
  fontSize: 32,
  fontWeight: 'bold',
  color: '#000',
  lineHeight: 50,
  flexDirection: 'row',
},








weatherMainRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 10,
  marginBottom: 10,
},

tempRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
},

tempValue: {
  fontSize: 32,
  fontWeight: 'bold',
  color: '#000',
  fontFamily: 'Poppins'
},

tempUnit: {
  fontSize: 18,
  color: '#444',
  marginTop: 6,
  marginLeft: 2,
  fontFamily: 'Poppins'
},

hlColumnCenter: {
  justifyContent: 'center',
  alignItems: 'center',
},

hlRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
},

hlText: {
  fontSize: 14,
  color: '#666',
  fontWeight: '500',
  fontFamily: 'Poppins'
},

hlUnit: {
  fontSize: 10,
  color: '#666',
  marginTop: 2,
  marginLeft: 1,
  fontFamily: 'Poppins'
},

weatherIconSmall: {
  width: 60,
  height: 70,
},


dashedLineContainer: {
  width: '80%',
  marginVertical: 10,
  alignItems: 'center',
  alignSelf: 'center', // ✅ Centrage horizontal
},
});


export default HomeScreen;