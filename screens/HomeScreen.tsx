import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';

const HomeScreen = ({ navigation }: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fonction pour ouvrir/fermer le modal
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur AgroTech 🌱</Text>
      <Text style={styles.description}>
        Application pour diagnostiquer et prendre soin de vos cultures.
      </Text>

      <Button
        title="Commencer le diagnostic"
        onPress={toggleModal}
      />

      {/* Modal avec les options de photo */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal} // Fermer le modal si l'utilisateur clique en dehors
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choisir une option</Text>
          <Button
            title="Prendre une photo"
            onPress={() => {
              navigation.navigate('Diagnose', { option: 'camera' }); // Naviguer vers l'écran de diagnostic et choisir l'option "camera"
              toggleModal(); // Fermer le modal
            }}
          />
          <Button
            title="Choisir une photo"
            onPress={() => {
              navigation.navigate('Diagnose', { option: 'gallery' }); // Naviguer vers l'écran de diagnostic et choisir l'option "gallery"
              toggleModal(); // Fermer le modal
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f4f9',
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
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default HomeScreen;