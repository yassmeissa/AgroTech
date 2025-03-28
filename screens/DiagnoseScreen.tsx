import React, { useState } from 'react';
import { ActivityIndicator, Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

// Définir le type de la réponse de l'API
interface SimilarImage {
  url: string;
}

interface Suggestion {
  name: string;
  probability: number;
  similar_images: SimilarImage[];
}

interface Classification {
  suggestions: Suggestion[] | undefined; // La propriété suggestions peut être undefined
}

interface Result {
  result?: {
    classification?: Classification;
    error?: string;
  };
  error?: string;
}

const DiagnoseScreen = ({ route }) => {
  const { option, image } = route.params; // Récupère les paramètres passés
  const [result, setResult] = useState<Result | null>(null); // Ajouter un type à result
  const [loading, setLoading] = useState(false);

  // Fonction pour envoyer l'image directement à l'API Plant.id
  const analyzeImageOnServer = async (imageUri) => {
    setLoading(true);

    // Créer une instance de FormData
    const formData = new FormData();
    formData.append('images', {
      uri: imageUri,
      type: 'image/jpeg', // Assurez-vous que le type est correct
      name: 'plant.jpg',
    });

    try {
      console.log('Envoi de la requête à l\'API...');

      const response = await fetch('https://plant.id/api/v3/identification', {
        method: 'POST',
        headers: {
          'Api-Key': 'etydvmb6ZQDTHPZMsYrqE3q1SC85Atip4lqNwDs5kav6gPMnCo', // Remplacez par votre clé API
        },
        body: formData,
      });

      const data = await response.json();

      console.log('Réponse de l\'API:', data); // Ajout d'un log pour examiner la réponse de l'API

      if (response.ok) {
        // Vérifiez que les suggestions sont présentes avant de les utiliser
        if (data.result?.classification?.suggestions && data.result.classification.suggestions.length > 0) {
          setResult(data);
        } else {
          setResult({ error: 'Aucune suggestion trouvée pour cette plante.' });
        }
      } else {
        setResult({ error: 'Erreur lors de l\'analyse de l\'image.' });
      }
    } catch (error) {
      console.error('Erreur de connexion au serveur:', error);
      setResult({ error: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page de Diagnostic</Text>
      <Text style={styles.description}>Option choisie : {option}</Text>

      {image && image.uri ? (
        <Image source={{ uri: image.uri }} style={styles.image} />
      ) : (
        <Text style={styles.noImageText}>Aucune image sélectionnée</Text>
      )}

      <Button
        title="Analyser l'image"
        onPress={() => analyzeImageOnServer(image.uri)}  // Appeler l'API lorsque l'utilisateur clique sur le bouton
        disabled={loading}  // Désactiver le bouton si l'analyse est en cours
      />

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {result && result.error ? (
        <Text style={styles.errorText}>{result.error}</Text>
      ) : result && result.result?.classification?.suggestions?.length ? (
        <ScrollView style={styles.scrollView}>
          <Text style={styles.resultTitle}>Résultats :</Text>
          {result.result.classification.suggestions.map((suggestion, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultText}>
                Plante Identifiée : {suggestion.name || 'Non identifiée'}
              </Text>
              <Text style={styles.resultText}>
                Probabilité : {(suggestion.probability * 100).toFixed(2)}%
              </Text>
              {suggestion.similar_images?.[0]?.url ? (
                <Image
                  source={{ uri: suggestion.similar_images[0].url }}
                  style={styles.similarImage}
                />
              ) : (
                <Text style={styles.resultText}>Aucune image similaire trouvée.</Text>
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.resultText}>Aucune suggestion d'identification trouvée.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    borderRadius: 10,
    marginTop: 20,
  },
  noImageText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 5,
  },
  resultItem: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  similarImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  scrollView: {
    width: '100%',
  },
});

export default DiagnoseScreen;