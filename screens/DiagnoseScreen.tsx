import axios from 'axios';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, StyleSheet, Text, View } from 'react-native';
import { launchCamera, launchImageLibrary, MediaType } from 'react-native-image-picker';

const DiagnoseScreen = () => {
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const chooseImage = (option: string) => {
    const options = { 
      mediaType: 'photo' as MediaType,  // Utilisation du type 'MediaType' pour mediaType
      quality: 1,  // Utilisation d'une valeur numérique pour la qualité (0 = basse, 1 = haute)
      includeBase64: true 
    };
    
    if (option === 'camera') {
      launchCamera(options, (response) => handleResponse(response));
    } else if (option === 'gallery') {
      launchImageLibrary(options, (response) => handleResponse(response));
    }
  };

  const handleResponse = (response: any) => {
    if (response.didCancel) {
      console.log('User cancelled action');
    } else if (response.errorCode) {
      console.log('Error: ', response.errorCode);
    } else if (response.assets && response.assets[0]) {
      setImage(response.assets[0]);
    } else {
      console.log('No image selected');
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: image.uri,
      type: 'image/jpeg',
      name: 'plant.jpg',
    } as any);

    try {
      const response = await axios.post('http://192.168.X.X:5001/api/identify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (error: any) {
      console.error('Upload error:', error.message);
      Alert.alert('Erreur', 'Erreur lors de l’analyse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnostic des Plantes</Text>
      <Text style={styles.subtitle}>Choisir une option :</Text>

      <Button title="Prendre une photo" onPress={() => chooseImage('camera')} />
      <Button title="Choisir une photo" onPress={() => chooseImage('gallery')} />

      {image && <Image source={{ uri: image.uri }} style={styles.image} />}
      <Button title="Analyser l'image" onPress={uploadImage} disabled={loading} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {result && (
        <View style={styles.result}>
          <Text style={styles.subtitle}>Résultats du diagnostic</Text>
          <Text>Nom de la plante : {result.identification?.suggestions?.[0]?.plant_name || 'Non identifié'}</Text>
          <Text>État de santé : {result.healthAssessment?.is_healthy_probability > 0.5 ? 'Saine' : 'Malade'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f4f4f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  subtitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  image: {
    width: 250,
    height: 250,
    marginVertical: 10,
    borderRadius: 10,
  },
  result: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
});

export default DiagnoseScreen;