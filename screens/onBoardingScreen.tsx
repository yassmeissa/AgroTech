import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, TouchableOpacity, Text } from 'react-native';

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const onboardingSlides = [
   {
  id: '1',
      image: require('../assets/onBoarding/onBoarding1.png'),
  title: 'Bienvenue sur AgroTech',
  description: 'Identifiez facilement vos plantes et détectez s’il y a des maladies'
},
    {
      id: '2',
      image: require('../assets/onBoarding/onBoarding2.jpg'),
      title: 'Méteo',
      description: 'Accédez aux prévisions locales pour planifier vos activités agricoles en toute sérénité.'
    },
    {
      id: '3',
      image: require('../assets/onBoarding/onBoarding3.jpg'),
      title: 'Chatbot',
      description: 'Posez vos questions et obtenez des réponses instantanées sur vos cultures'
    }
  ];

  const handleSkip = () => {
    // Marquer comme vu et naviguer vers l'écran principal
    navigation.replace('FaceIDScreen');
  };

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSkip();
    }
  };
console.log("OnboardingScreen rendu");
  return (
    <View style={styles.container}>
      <FlatList
        data={onboardingSlides}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width);
          setCurrentIndex(index);
        }}
      />
      
      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {onboardingSlides.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.indicator, 
                currentIndex === index && styles.activeIndicator
              ]} 
            />
          ))}
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === onboardingSlides.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
        </TouchableOpacity>
        
        {currentIndex < onboardingSlides.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  image: {
    width: '80%',
    height: 400,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2e7d32',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 30,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: '#2e7d32',
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  skipText: {
    color: '#2e7d32',
    fontSize: 16,
  },
});

export default OnboardingScreen;