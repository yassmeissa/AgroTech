import React from 'react';
import { StyleSheet, Text, View, Dimensions, StatusBar, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const WAVE_HEIGHT = 40;
const HEADER_HEIGHT = 100;
const Header = () => {
  return (
    <>
      <StatusBar 
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      
      <View>
        {/* HEADER GRADIENT */}
        <LinearGradient
          colors={['#FF9800', '#FF5722']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientFill, { height: HEADER_HEIGHT }]}
        >
          <SafeAreaView style={styles.safeArea}>
            <Text style={styles.title}>AgroTech</Text>
          </SafeAreaView>
        </LinearGradient>

        {/* COURBE AVEC DÉGRADÉ */}
        <Svg
          width={width}
          height={WAVE_HEIGHT}
          viewBox={`0 0 ${width} ${WAVE_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <Defs>
            <SvgGradient id="waveGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FF9800" />
              <Stop offset="100%" stopColor="#FF5722" />
            </SvgGradient>
          </Defs>

          <Path
            d={`
              M0,0 
              L0,${WAVE_HEIGHT - 20} 
              Q${width * 0.25},${WAVE_HEIGHT + 10} ${width * 0.5},${WAVE_HEIGHT - 20}
              Q${width * 0.75},${WAVE_HEIGHT - 40} ${width},${WAVE_HEIGHT - 10}
              L${width},0
              Z
            `}
            fill="url(#waveGradient)"
          />
        </Svg>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  gradientFill: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Header;