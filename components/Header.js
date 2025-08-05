import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const Header = () => {
  return (
    <LinearGradient
      colors={['#FF9800', '#FF5722']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerContainer}
    >
      <Text style={styles.title}>AgroTech</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 160,
    width: width,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Header;