import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const ClimatScreen = ({ navigation }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const apiKey = '73e3d10d8cfb49aeb2071342250104'; // Remplace par ta clé API WeatherAPI

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      (error) => {
        Alert.alert('Erreur', 'Impossible de récupérer la position');
        setError(error.message);
        setIsLoading(false);
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      const fetchWeather = async () => {
        try {
          const response = await axios.get(
            `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=3`
          );
          setWeatherData(response.data);
        } catch (err) {
          setError('Erreur de récupération des données climatiques');
        } finally {
          setIsLoading(false);
        }
      };

      fetchWeather();
    }
  }, [latitude, longitude]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const forecastDays = weatherData.forecast.forecastday;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Prévisions Climatiques</Text>
      {weatherData ? (
        <>
          <Text style={styles.cityName}>{weatherData.location.name}</Text>

          <View style={styles.weatherInfo}>
            <Text style={styles.sectionTitle}>Aujourd'hui</Text>
            <Text style={styles.weatherText}>
              <Text style={styles.bold}>Température:</Text> {weatherData.current.temp_c} °C
            </Text>
            <Text style={styles.weatherText}>
              <Text style={styles.bold}>Condition:</Text> {weatherData.current.condition.text}
            </Text>
            <Text style={styles.weatherText}>
              <Text style={styles.bold}>Vent:</Text> {weatherData.current.wind_kph} km/h
            </Text>
            <Text style={styles.weatherText}>
              <Text style={styles.bold}>Humidité:</Text> {weatherData.current.humidity}%
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Prévisions</Text>
          {forecastDays.slice(1).map((day, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.bold}>{day.date}</Text>
              <Text style={styles.weatherText}>
                <Text style={styles.bold}>Max:</Text> {day.day.maxtemp_c} °C | 
                <Text style={styles.bold}> Min:</Text> {day.day.mintemp_c} °C
              </Text>
              <Text style={styles.weatherText}>
                <Text style={styles.bold}>Condition:</Text> {day.day.condition.text}
              </Text>
              <Text style={styles.weatherText}>
                <Text style={styles.bold}>Pluie:</Text> {day.day.daily_chance_of_rain}% de chance
              </Text>
            </View>
          ))}
        </>
      ) : (
        <Text style={styles.errorText}>Aucune donnée météo disponible.</Text>
      )}

      <Button title="Retour à l'accueil" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  weatherInfo: {
    marginBottom: 30,
    width: '100%',
  },
  forecastItem: {
    marginBottom: 20,
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  weatherText: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2980b9',
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default ClimatScreen;