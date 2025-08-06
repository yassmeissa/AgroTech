import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const SunArc = ({ sunrise, sunset }) => {
  console.log("✅ SunArc rendu avec props :", sunrise, sunset);
  const arcWidth = 280;
  const arcHeight = 80;
  const now = new Date();

  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let h = hours;
    if (period?.toLowerCase() === 'pm' && hours !== 12) h += 12;
    if (period?.toLowerCase() === 'am' && hours === 12) h = 0;
    return h + minutes / 60;
  };

  const formatToFrench = (timeStr) => {
    const total = parseTime(timeStr);
    const h = Math.floor(total);
    const m = Math.round((total - h) * 60);
    return `${h.toString().padStart(2, '0')}h${m.toString().padStart(2, '0')}`;
  };

  const sunriseTime = parseTime(sunrise);
  const sunsetTime = parseTime(sunset);
  const currentTime = now.getHours() + now.getMinutes() / 60;

  const ratio = Math.min(Math.max((currentTime - sunriseTime) / (sunsetTime - sunriseTime), 0), 1);

  // Calcul de la position sur la courbe quadratique
  const calculateQuadraticPoint = (t, p0, p1, p2) => {
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    return { x, y };
  };

  // Points de contrôle pour la courbe quadratique
  const startPoint = { x: 20, y: arcHeight };
  const controlPoint = { x: arcWidth / 2 + 20, y: 0 };
  const endPoint = { x: arcWidth + 20, y: arcHeight };

  // Position du soleil
  const sunPosition = calculateQuadraticPoint(ratio, startPoint, controlPoint, endPoint);

  return (
    <View style={{ alignItems: 'center', marginTop: -10 }}>
      <Svg width={arcWidth + 40} height={arcHeight + 30}>
        <Path
          d={`M${startPoint.x} ${startPoint.y} Q${controlPoint.x} ${controlPoint.y} ${endPoint.x} ${endPoint.y}`}
          stroke="#ccc"
          strokeWidth="1.5"
          strokeDasharray="12,6"
          fill="none"
        />
        <Circle cx={sunPosition.x} cy={sunPosition.y} r="10" fill="#f1c40f" />
      </Svg>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: arcWidth + 40,
          marginTop: -10,
        }}
      >
        <Text style={{ fontFamily: 'Poppins' }}>🌅 {formatToFrench(sunrise)}</Text>
        <Text style={{ fontFamily: 'Poppins' }}>🌇 {formatToFrench(sunset)}</Text>
      </View>
    </View>
  );
};

export default SunArc;