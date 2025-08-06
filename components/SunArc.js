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

  // DEBUG 👇
  console.log('🕗 Heure actuelle :', currentTime.toFixed(2));
  console.log('🌅 Heure lever du soleil :', sunriseTime.toFixed(2), `(${sunrise})`);
  console.log('🌇 Heure coucher du soleil :', sunsetTime.toFixed(2), `(${sunset})`);

  const ratio = Math.min(Math.max((currentTime - sunriseTime) / (sunsetTime - sunriseTime), 0), 1);
  console.log('🔄 Ratio (progression du jour) :', ratio.toFixed(2));

  const sunX = 20 + ratio * arcWidth;
  const sunY = arcHeight - Math.sin(ratio * Math.PI) * arcHeight;
  console.log('☀️ Position du soleil :', `X: ${sunX.toFixed(1)}, Y: ${sunY.toFixed(1)}`);

  return (
    <View style={{ alignItems: 'center', marginTop: -10 }}>
      <Svg width={arcWidth + 40} height={arcHeight + 30}>
        <Path
          d={`M20 ${arcHeight} Q${arcWidth / 2 + 20} 0 ${arcWidth + 20} ${arcHeight}`}
          stroke="#ccc"
          strokeWidth="1.5"
          strokeDasharray="12,6"
          fill="none"
        />
        <Circle cx={sunX} cy={sunY} r="10" fill="#f1c40f" />
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