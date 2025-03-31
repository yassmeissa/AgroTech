import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

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

const DiagnoseScreen = ({ route }) => {
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
          'Api-Key': 'etydvmb6ZQDTHPZMsYrqE3q1SC85Atip4lqNwDs5kav6gPMnCo',
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
        health: 'only',
        similar_images: true
      };
  
      const apiResponse = await fetch('https://plant.id/api/v3/health_assessment', {
        method: 'POST',
        headers: {
          'Api-Key': 'etydvmb6ZQDTHPZMsYrqE3q1SC85Atip4lqNwDs5kav6gPMnCo',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      const data = await apiResponse.json();
  
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
      }
    } catch (err) {
      console.error('Erreur de connexion santé:', err);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnostic</Text>
      <Text style={styles.description}>Option choisie : {option}</Text>

      {image?.uri ? (
        <Image source={{ uri: image.uri }} style={styles.image} />
      ) : (
        <Text style={styles.noImageText}>Aucune image sélectionnée</Text>
      )}

      {!loading && !error && result && (
        <View style={styles.toggleButtonContainer}>
          <Button
            title={showHealth ? "Voir l'identification" : "Voir les maladies"}
            onPress={() => setShowHealth(!showHealth)}
            color="#4CAF50"
          />
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Analyse en cours...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : result ? (
        <ScrollView style={styles.scrollView}>
          {showHealth ? (
            <View style={styles.resultItem}>
              <Text style={styles.sectionTitle}>État de santé de la plante</Text>
              <Text style={styles.resultText}>
                Santé: {result.result.health?.is_healthy.binary ? 'Saine' : 'Malade'}
              </Text>
              <Text style={styles.resultText}>
                Probabilité: {(result.result.health?.is_healthy.probability * 100).toFixed(2)}%
              </Text>

              {result.result.health?.disease.suggestions?.length > 0 ? (
                <>
                  <Text style={styles.resultText}>Maladies potentielles:</Text>
                  {result.result.health.disease.suggestions.map((disease) => (
                    <View key={disease.id} style={styles.diseaseItem}>
                      <Text style={styles.diseaseText}>
                        • {disease.name} ({(disease.probability * 100).toFixed(2)}%)
                      </Text>
                      {disease.similar_images?.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {disease.similar_images.map((img) => (
                            <View key={img.id} style={styles.similarImageContainer}>
                              <Image
                                source={{ uri: img.url_small || img.url }}
                                style={styles.similarImage}
                              />
                              <Text style={styles.similarityText}>
                                Similarité: {(img.similarity * 100).toFixed(0)}%
                              </Text>
                            </View>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  ))}
                  
                  {result.result.health.disease.question && (
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
                </>
              ) : (
                <Text style={styles.resultText}>Aucune maladie détectée</Text>
              )}
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Résultats d'identification</Text>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultText}>
                  Détection de plante : {result.result.is_plant.binary ? 'Oui' : 'Non'}
                </Text>
                <Text style={styles.resultText}>
                  Probabilité : {(result.result.is_plant.probability * 100).toFixed(2)}%
                </Text>
              </View>

              {result.result.classification?.suggestions?.map((suggestion) => (
                <View key={suggestion.id} style={styles.resultItem}>
                  <Text style={styles.suggestionName}>
                    {suggestion.name} ({(suggestion.probability * 100).toFixed(2)}%)
                  </Text>

                  <Text style={styles.similarImagesTitle}>Images similaires :</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {suggestion.similar_images.map((img) => (
                      <View key={img.id} style={styles.similarImageContainer}>
                        <Image
                          source={{ uri: img.url }}
                          style={styles.similarImage}
                        />
                        <Text style={styles.similarityText}>
                          Similarité: {(img.similarity * 100).toFixed(0)}%
                        </Text>
                        {img.citation && (
                          <Text style={styles.citationText}>Source: {img.citation}</Text>
                        )}
                      </View>
                    ))}
                  </ScrollView>
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
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  noImageText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    width: '100%',
  },
  resultItem: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
  suggestionName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
  },
  similarImagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
  },
  similarImageContainer: {
    marginRight: 15,
    alignItems: 'center',
  },
  similarImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
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
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    padding: 10,
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
  },
  toggleButtonContainer: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  diseaseText: {
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 5,
    color: '#e74c3c',
  },
  diseaseItem: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  },
  questionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});

export default DiagnoseScreen;