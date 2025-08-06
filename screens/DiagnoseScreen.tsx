import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, ScrollView, StyleSheet, Text, View,  TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
  import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces pour les types de données
interface SimilarImage {
  id: string;
  url: string;
  similarity: number;
  url_small?: string;
  license_name?: string;
  license_url?: string;
  citation?: string;
}

interface Suggestion {
  id: string;
  name: string;
  probability: number;
  similar_images: SimilarImage[];
  details?: {
    language: string;
    entity_id: string;
  };
}

interface Classification {
  suggestions: Suggestion[];
}

interface IsPlant {
  probability: number;
  binary: boolean;
  threshold: number;
}

interface DiseaseSuggestion {
  id: string;
  name: string;
  probability: number;
  similar_images: SimilarImage[];
  details?: {
    language: string;
    entity_id: string;
  };
}

interface DiseaseQuestion {
  text: string;
  translation: string;
  options: {
    yes: {
      suggestion_index: number;
      entity_id: string;
      name: string;
      translation: string;
    };
    no: {
      suggestion_index: number;
      entity_id: string;
      name: string;
      translation: string;
    };
  };
}

interface DiseaseResult {
  suggestions: DiseaseSuggestion[];
  question: DiseaseQuestion;
}

interface HealthResult {
  is_healthy: {
    binary: boolean;
    threshold: number;
    probability: number;
  };
  disease: DiseaseResult;
}

interface Result {
  result: {
    is_plant: IsPlant;
    classification?: Classification;
    health?: HealthResult;
  };
  status: string;
  [key: string]: any;
}

const DiagnoseScreen = ({ route, navigation }) => {
    const { option, image } = route.params;
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHealth, setShowHealth] = useState(false);

  const handleQuestionResponse = (response: boolean) => {
    if (!result?.result.health?.disease.question) return;

    const option = response 
      ? result.result.health.disease.question.options.yes
      : result.result.health.disease.question.options.no;

    Alert.alert(
      'Réponse enregistrée',
      `Vous avez sélectionné: ${option.name}`,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') }
      ]
    );
  };


const saveDiagnosisToHistory = async (diagnosis: Result) => {
  try {
    const existing = await AsyncStorage.getItem('diagnosisHistory');
    const history = existing ? JSON.parse(existing) : [];

    const timestamp = new Date().toISOString();

    const newEntry = {
      id: timestamp,
      date: new Date(timestamp).toLocaleString(),
      result: diagnosis.result,
      imageUri: image?.uri,
    };

    const updatedHistory = [newEntry, ...history];

    await AsyncStorage.setItem('diagnosisHistory', JSON.stringify(updatedHistory));
    console.log('Diagnostic enregistré avec succès.');
  } catch (err) {
    console.error('Erreur lors de l’enregistrement de l’historique :', err);
  }
};
  const analyzeImageOnServer = async (imageUri: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
  
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
  
      const base64Image = base64data.split(',')[1];
  
      const requestBody = {
        images: [base64Image],
        similar_images: true
      };
  
      const apiResponse = await fetch('https://plant.id/api/v3/identification', {
        method: 'POST',
        headers: {
          'Api-Key': 'i3zNsDJLuLLP5GeuzLv7OSG5XFAmeqIChNR98eW5v6oLIJDBpr',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      const data = await apiResponse.json();
  
      if (apiResponse.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Erreur lors de l\'analyse de l\'image.');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur de connexion au serveur.');
    }
  };

const analyzeHealthOnServer = async (imageUri: string) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const base64data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    const base64Image = base64data.split(',')[1];

    const requestBody = {
      images: [base64Image],
      health: 'auto', // 'auto' est plus sûr que 'only' si tu n'es pas sûr
      similar_images: true
    };

    const apiResponse = await fetch('https://plant.id/api/v3/health_assessment', {
      method: 'POST',
      headers: {
        'Api-Key': 'i3zNsDJLuLLP5GeuzLv7OSG5XFAmeqIChNR98eW5v6oLIJDBpr',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await apiResponse.text();

    try {
      const data = JSON.parse(responseText);

      if (apiResponse.ok) {
        setResult(prev => ({
          ...prev,
          result: {
            ...prev?.result,
            health: data.result
          }
        }));
      } else {
        setError(data.error || 'Erreur lors de l\'évaluation de la santé.');
        console.error('Erreur santé :', data);
      }
    } catch (parseError) {
      // Le corps n'était pas un JSON
      console.error('Erreur de parsing JSON santé :', parseError);
      console.log('Réponse brute reçue :', responseText);
      setError('Réponse invalide de l\'API santé : ' + responseText);
    }

  } catch (err) {
    console.error('Erreur de connexion santé :', err);
    setError('Erreur de connexion au serveur.');
  }
};

useEffect(() => {
  const analyzeImage = async () => {
    if (image?.uri) {
      try {
        setLoading(true);

        await analyzeImageOnServer(image.uri);
        await analyzeHealthOnServer(image.uri);

      } catch (err) {
        setError('Erreur lors de l\'analyse');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Aucune image disponible pour analyse');
      setLoading(false);
    }
  };

  analyzeImage();
}, [image?.uri]);

// Enregistrement dans l’historique une fois les résultats disponibles
useEffect(() => {
  if (result) {
    saveDiagnosisToHistory(result);
  }
}, [result]);
  return (
    <View style={styles.container}>
            <Header />


      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Diagnostic</Text>
      <Text style={styles.description}>Option choisie : {option}</Text>

      {image?.uri ? (
        <Image source={{ uri: image.uri }} style={styles.image} />
      ) : (
        <Text style={styles.noImageText}>Aucune image sélectionnée</Text>
      )}

   

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009933" />
          <Text style={styles.loadingText}>Analyse en cours...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : result ? (
<ScrollView 
  style={styles.scrollView}
  contentContainerStyle={styles.scrollViewContent}
>    
   {!loading && !error && result && (
        <View style={styles.toggleButtonContainer}>
          <Button
            title={showHealth ? "Voir l'identification" : "Voir les maladies"}
            onPress={() => setShowHealth(!showHealth)}
            color="#4CAF50"
          />
        </View>
      )}

{showHealth ? (
  <>
    {/* SECTION : État de santé */}
    <View style={styles.healthSection}>
      <Text style={styles.sectionTitle}>État de santé de la plante</Text>
      <Text style={styles.resultText}>
        Santé : {result.result.health?.is_healthy.binary ? 'Saine' : 'Malade'}
      </Text>
      <Text style={styles.resultText}>
        Probabilité : {(result.result.health?.is_healthy.probability * 100).toFixed(2)}%
      </Text>
    </View>

    {/* SECTION : Maladies */}
    {result.result.health?.disease.suggestions?.map((disease) => (
      <View
        key={disease.id}
        style={[
          styles.diseaseItem,
          {
            borderLeftWidth: 5,
            borderLeftColor:
              disease.probability > 0.8
                ? '#c0392b'
                : disease.probability > 0.5
                ? '#e67e22'
                : '#f39c12',
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Icon name="medkit-outline" size={22} color="#c0392b" style={{ marginRight: 10 }} />
          <Text style={styles.diseaseText}>
            {disease.name} ({(disease.probability * 100).toFixed(2)}%)
          </Text>
        </View>

        {disease.similar_images?.length > 0 && (
          <>
            <Text style={styles.similarImagesTitle}>Images similaires :</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 130 }}>
              {disease.similar_images.map((img) => (
                <View key={img.id} style={styles.similarImageContainer}>
                  <Image
                    source={{ uri: img.url_small || img.url }}
                    style={styles.similarImage}
                  />
                  <Text style={styles.similarityText}>
                    {(img.similarity * 100).toFixed(0)}% similaire
                  </Text>
                  {img.citation && (
                    <Text style={styles.citationText} numberOfLines={1}>
                      📚 {img.citation}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    ))}

    {/* SECTION : Question API */}
    {result.result.health?.disease.question && (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {result.result.health.disease.question.text}
        </Text>
        <View style={styles.questionButtons}>
          <Button
            title="Oui"
            onPress={() => handleQuestionResponse(true)}
            color="#4CAF50"
          />
          <Button
            title="Non"
            onPress={() => handleQuestionResponse(false)}
            color="#f44336"
          />
        </View>
      </View>
    )}

    {/* Message si aucune maladie détectée */}
    {result.result.health?.disease.suggestions?.length === 0 && (
      <View style={styles.healthSection}>
        <Text style={styles.resultText}>Aucune maladie détectée</Text>
      </View>
    )}
  </>
) : (
            <>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultText}>
                  Détection de plante : {result.result.is_plant.binary ? 'Oui' : 'Non'}
                </Text>
                <Text style={styles.resultText}>
                  Probabilité : {(result.result.is_plant.probability * 100).toFixed(2)}%
                </Text>
              </View>

{result.result.classification?.suggestions?.map((suggestion) => (
  <View
    key={suggestion.id}
    style={[
      styles.resultItem,
      {
        borderLeftWidth: 5,
        borderLeftColor:
          suggestion.probability > 0.8
            ? '#2ecc71'
            : suggestion.probability > 0.5
            ? '#f1c40f'
            : '#e74c3c',
      },
    ]}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <Icon name="leaf-outline" size={22} color="#2c3e50" style={{ marginRight: 10 }} />
      <Text style={styles.suggestionName}>
        {suggestion.name}
      </Text>
    </View>

    <Text style={styles.resultText}>
      Probabilité : {(suggestion.probability * 100).toFixed(2)}%
    </Text>

    {suggestion.similar_images?.length > 0 && (
      <>
        <Text style={styles.similarImagesTitle}>Images similaires :</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {suggestion.similar_images.map((img) => (
            <View key={img.id} style={styles.similarImageContainer}>
              <Image
                source={{ uri: img.url_small || img.url }}
                style={styles.similarImage}
              />
              <Text style={styles.similarityText}>
                {(img.similarity * 100).toFixed(0)}% similaire
              </Text>
              {img.citation && (
                <Text style={styles.citationText} numberOfLines={1}>
                  📚 {img.citation}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </>
    )}
  </View>
))}
            </>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Poppins'
  },
    backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 20,
    backgroundColor: '#009933aa',
    padding: 8,
    borderRadius: 20,

  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
    fontFamily: 'Poppins'
  },
 




image: {
  position: 'absolute',
  top: 180, // Réduisez cette valeur
  left: 20,
  right: 20,
  height: 200, // Réduisez légèrement
  borderRadius: 15,
  zIndex: 10,
},
  noImageText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins'
  },
scrollView: {
  flex: 1,
  width: '100%',
  marginTop: 20, // Ajustez cette valeur selon la position de votre image
},
scrollViewContent: {
  paddingBottom: 30,
  paddingHorizontal: 20,
  alignItems: 'center',
},
resultItem: {
  marginBottom: 15,
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
  width: '100%', // Prend toute la largeur disponible
  alignSelf: 'center', // Centre l'élément
  flexShrink: 1, // Permet au conteneur de réduire sa taille si nécessaire
},
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
    fontFamily: 'Poppins'
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'Poppins'
  },
  suggestionName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
    fontFamily: 'Poppins'

  },
  similarImagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    fontFamily: 'Poppins'
  },

 
  similarityText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  citationText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    fontFamily: 'Poppins'
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    padding: 10,
    fontFamily: 'Poppins'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins'
  },
  toggleButtonContainer: {
    marginBottom: 10,
    marginTop:100,
    borderRadius: 8,
    overflow: 'hidden',
  },
diseaseItem: {
  marginBottom: 20,
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
diseaseText: {
  fontSize: 17,
  fontWeight: '600',
  color: '#e74c3c',
  marginBottom: 8,
  fontFamily: 'Poppins',
},
  questionContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#2c3e50',
    fontFamily: 'Poppins'
  },
  questionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
similarImageContainer: {
  marginRight: 15,
  alignItems: 'center',
  width: 150,
  maxHeight: 200, // Limite la hauteur
},
similarImage: {
  width: 150,
  height: 150,
  borderRadius: 8,
  resizeMode: 'contain', // Assure que l'image conserve ses proportions
},

healthSection: {
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 15,
  marginBottom: 15,
  width: '100%',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 1,
},

});

export default DiagnoseScreen;