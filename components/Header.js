import React from 'react';
import { StyleSheet, Text, View, Dimensions, StatusBar, Platform, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 220;

const Header = () => {
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const today = capitalize(new Date().toLocaleDateString('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}));
  return (
    <>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <LinearGradient
        colors={['#03482bff', '#009933']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.greeting}>Bonjour, <Text style={styles.bold}>Bienvenue</Text></Text>
              <Text style={styles.date}>{today}</Text>
            </View>
            <Image
              source={require('../assets/avatar.jpg')} // Mets une image ronde ici
              style={styles.avatar}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: HEADER_HEIGHT,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    margin:20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    color: '#fff',
  },
  bold: {
    fontWeight: 'bold',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'white',
      marginRight: 20, // ✅ Ajouté

  },
    greeting: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  bold: {
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  date: {
    fontSize: 16,
    color: '#fce4ec',
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
});

export default Header;