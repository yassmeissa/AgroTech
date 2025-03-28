import React, { useState } from 'react';
import { ActivityIndicator, Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

// Définir le type de la réponse de l'API basé sur la documentation
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

interface Result {
  result: {
    is_plant: IsPlant;
    classification: Classification;
  };
  status: string;
  [key: string]: any; // Pour les autres champs non utilisés
}

interface ApiError {
  error: string;
}

const DiagnoseScreen = ({ route }) => {
  const { option, image } = route.params;
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeImageOnServer = async (imageUri: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('images', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'plant.jpg',
    });
    formData.append('similar_images', 'true'); // Demander explicitement les images similaires

    try {
      const response = await fetch('https://plant.id/api/v3/identification', {
        method: 'POST',
        headers: {
          'Api-Key': 'etydvmb6ZQDTHPZMsYrqE3q1SC85Atip4lqNwDs5kav6gPMnCo',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        if (data.result?.classification?.suggestions?.length > 0) {
          setResult(data);
        } else {
          setError('Aucune suggestion trouvée pour cette plante.');
        }
      } else {
        setError(data.error || 'Erreur lors de l\'analyse de l\'image.');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnostic</Text>
      <Text style={styles.description}>Option choisie : {option}</Text>

      {image?.uri ? (
        <Image source={{ uri: image.uri }} style={styles.image} />
      ) : (
        <Text style={styles.noImageText}>Aucune image sélectionnée</Text>
      )}

      <Button
        title="Analyser l'image"
        onPress={() => analyzeImageOnServer(image.uri)}
        disabled={loading}
      />

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : result ? (
        <ScrollView style={styles.scrollView}>
          <Text style={styles.resultTitle}>Résultats :</Text>
          
          {/* Information sur la détection de plante */}
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              Détection de plante : {result.result.is_plant.binary ? 'Oui' : 'Non'}
            </Text>
            <Text style={styles.resultText}>
              Probabilité : {(result.result.is_plant.probability * 100).toFixed(2)}%
            </Text>
          </View>

          {/* Suggestions de classification */}
          {result.result.classification.suggestions.map((suggestion, index) => (
            <View key={`${suggestion.id}-${index}`} style={styles.resultItem}>
              <Text style={styles.suggestionName}>
                {suggestion.name} ({(suggestion.probability * 100).toFixed(2)}%)
              </Text>

              {/* Images similaires */}
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
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
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
  suggestionName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
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
});

export default DiagnoseScreen;