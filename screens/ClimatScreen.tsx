import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart, Grid } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Circle, G, Line, Text as SvgText } from 'react-native-svg';

const ClimatScreen = () => {
  const [forecastDays, setForecastDays] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [current, setCurrent] = useState(null);
  const [location, setLocation] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();
  const chartRef = useRef(null);

  const apiKey = '73e3d10d8cfb49aeb2071342250104';
  const { lat, lon, locationName } = route.params || {};

  useEffect(() => {
    const q =
      lat && lon
        ? `${lat},${lon}`
        : locationName
          ? locationName
          : 'dakar';

    axios
      .get(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
          q
        )}&days=3&lang=fr&aqi=no&alerts=no`
      )
      .then((res) => {
        setCurrent(res.data.current);
        setLocation(res.data.location);
        setForecastDays(res.data.forecast.forecastday);

        // Construire 24h glissantes à partir de maintenant (aujourd’hui + demain si besoin)
        const now = new Date();
        const currentHour = now.getHours();
        const todayHours = res.data.forecast.forecastday[0].hour.slice(currentHour);
        const remaining = 24 - todayHours.length;
        const tomorrowHours =
          remaining > 0 ? res.data.forecast.forecastday[1].hour.slice(0, remaining) : [];
        setHourlyData([...todayHours, ...tomorrowHours]);
      })
      .catch((err) => console.error('Erreur récupération météo:', err));
  }, [lat, lon, locationName]);

  if (!forecastDays || !current || hourlyData.length === 0) {
    return <Text style={styles.loading}>Chargement...</Text>;
  }

  const tempsData = hourlyData.map((h) => h.temp_c);
  const timeLabels = hourlyData.map((h) => new Date(h.time).getHours() + 'h');

  const Decorator = ({ x, y, data }) =>
    data.map((value, index) => (
      <Circle
        key={index}
        cx={x(index)}
        cy={y(value)}
        r={8}
        stroke={'#FF5722'}
        fill={'white'}
        onPress={() => {
          setSelectedPoint({
            hour: timeLabels[index],
            temp: value,
            condition: hourlyData[index].condition.text,
            icon: hourlyData[index].condition.icon,
          });
        }}
      />
    ));

  const Tooltip = ({ x, y }) => {
    if (!selectedPoint) return null;
    const index = timeLabels.indexOf(selectedPoint.hour);
    if (index === -1) return null;

    return (
      <G>
        <Line
          x1={x(index)}
          y1={0}
          x2={x(index)}
          y2={y(selectedPoint.temp)}
          stroke={'#555'}
          strokeWidth={1}
          strokeDasharray={[4, 4]}
        />
        <Circle
          cx={x(index)}
          cy={y(selectedPoint.temp)}
          r={6}
          stroke={'#FF5722'}
          strokeWidth={2}
          fill={'white'}
        />
        <SvgText
          x={x(index)}
          y={y(selectedPoint.temp) - 15}
          fontSize={12}
          fontWeight="bold"
          fill={'#FF5722'}
          textAnchor={'middle'}
        >
          {selectedPoint.temp}°C
        </SvgText>
      </G>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Lieu affiché pour cohérence */}
      {location?.name ? (
        <Text style={{ textAlign: 'center', marginTop: 10, fontFamily: 'Poppins' }}>
          {location.name}
        </Text>
      ) : null}

      {/* Carte aujourd'hui – utilise current + min/max du jour */}
      <View style={styles.todayCard}>
        <Text style={styles.title}>Aujourd'hui</Text>
        <Image
          source={{ uri: `https:${current.condition.icon}` }}
          style={styles.icon}
        />
        <Text style={styles.condition}>{current.condition.text}</Text>
        <Text style={styles.temp}>
          {forecastDays[0].day.mintemp_c}°C - {forecastDays[0].day.maxtemp_c}°C
        </Text>
        <Text style={styles.info}>Température actuelle: {current.temp_c}°C</Text>
        <Text style={styles.info}>Humidité: {current.humidity}%</Text>
        <Text style={styles.info}>Vent: {current.wind_kph} km/h</Text>
        <Text style={styles.info}>Pression: {current.pressure_mb} hPa</Text>
      </View>

      {/* Prochains jours */}
      <View style={styles.nextDaysContainer}>
        {forecastDays.slice(1).map((day, index) => (
          <View key={index} style={styles.smallCard}>
            <Text style={styles.smallDate}>
              {new Intl.DateTimeFormat('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).format(new Date(day.date))}
            </Text>
            <Image
              source={{ uri: `https:${day.day.condition.icon}` }}
              style={styles.smallIcon}
            />
            <Text style={styles.smallCondition}>{day.day.condition.text}</Text>
            <Text style={styles.smallTemp}>
              {day.day.mintemp_c}° / {day.day.maxtemp_c}°
            </Text>
          </View>
        ))}
      </View>

      {/* Graphique 24h glissantes */}
      <View style={styles.chartWrapper}>
        <Text style={styles.chartTitle}>Évolution sur 24 heures</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <LineChart
              style={{ height: 200, width: hourlyData.length * 40 }}
              data={tempsData}
              svg={{ stroke: '#FF5722', strokeWidth: 2 }}
              contentInset={{ top: 20, bottom: 20 }}
              curve={shape.curveNatural}
              ref={chartRef}
            >
              <Grid />
              <Decorator />
              <Tooltip />
            </LineChart>

            <View style={styles.chartLabelsRow}>
              {timeLabels.map((label, i) => (
                <View key={i} style={styles.labelContainer}>
                  <Text style={styles.chartLabel}>
                    {i % 3 === 0 ? label : ''}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {selectedPoint && (
          <View style={styles.selectedPointContainer}>
            <View style={styles.selectedPointCard}>
              <Text style={styles.selectedPointHour}>{selectedPoint.hour}</Text>
              <View style={styles.selectedPointDetails}>
                <Image
                  source={{ uri: `https:${selectedPoint.icon}` }}
                  style={styles.selectedPointIcon}
                />
                <Text style={styles.selectedPointTemp}>{selectedPoint.temp}°C</Text>
              </View>
              <Text style={styles.selectedPointCondition}>{selectedPoint.condition}</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5f5f5', paddingTop: 0 },
  loading: { textAlign: 'center', marginTop: 100, fontSize: 18 },
  backButton: {
    position: 'absolute', top: 50, left: 20, zIndex: 20,
    backgroundColor: '#009933aa', padding: 8, borderRadius: 20,
  },
  todayCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 20, alignItems: 'center',
    marginHorizontal: 20, marginTop: -20, marginBottom: 40, elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5,
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, fontFamily: 'Poppins' },
  icon: { width: 80, height: 80 },
  condition: { fontSize: 18, marginTop: 10, fontFamily: 'Poppins' },
  temp: { fontSize: 20, fontWeight: '600', marginVertical: 8, fontFamily: 'Poppins' },
  info: { fontSize: 14, color: '#555', fontFamily: 'Poppins' },
  nextDaysContainer: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    rowGap: 10, columnGap: 10, paddingHorizontal: 20, marginBottom: 20,
  },
  smallCard: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', elevation: 4 },
  smallDate: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, fontFamily: 'Poppins' },
  smallIcon: { width: 40, height: 40 },
  smallCondition: { fontSize: 12, textAlign: 'center', fontFamily: 'Poppins' },
  smallTemp: { fontSize: 13, marginTop: 5, fontWeight: '500', fontFamily: 'Poppins' },
  chartWrapper: { marginTop: 30, paddingHorizontal: 20, alignItems: 'center', marginBottom: 30 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, fontFamily: 'Poppins' },
  chartLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10, marginTop: 8 },
  chartLabel: { fontSize: 12, color: '#444', fontFamily: 'Poppins', textAlign: 'center', includeFontPadding: false, lineHeight: 16 },
  labelContainer: { alignItems: 'center', justifyContent: 'center', width: 30 },
  selectedPointContainer: { marginTop: 20, width: '100%', alignItems: 'center' },
  selectedPointCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 15, width: '80%', alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  selectedPointHour: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, fontFamily: 'Poppins' },
  selectedPointDetails: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  selectedPointIcon: { width: 30, height: 30, marginRight: 10 },
  selectedPointTemp: { fontSize: 24, fontWeight: '600', fontFamily: 'Poppins', color: '#FF5722' },
  selectedPointCondition: { fontSize: 14, color: '#555', fontFamily: 'Poppins', marginTop: 5 },
});

export default ClimatScreen;