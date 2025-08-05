import React from 'react';
import { StyleSheet, Text, View, Dimensions, StatusBar, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Header = () => {
  return (
    <>
      <StatusBar 
        barStyle="light-content"
        translucent // important pour que le dégradé passe sous la status bar
        backgroundColor="transparent" // sur Android, on laisse le fond transparent
      />
      <LinearGradient
        colors={['#FF9800', '#FF5722']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.title}>AgroTech</Text>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    width: width,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  safeArea: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    height: 160 + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
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