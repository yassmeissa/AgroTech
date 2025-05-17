import React from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import ChatbotScreen from '../screens/ChatbotScreen'; // Vérifie bien ce chemin

interface ChatbotModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Bouton de fermeture avec image */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Image
            source={require('../assets/icons/close.png')} // Chemin relatif vers ton image
            style={styles.closeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Composant du chatbot */}
        <ChatbotScreen />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 45,
    right: 20,
    zIndex: 999,
    backgroundColor: '#6e48aa',
    borderRadius: 20,
    padding: 6,
    elevation: 5,
  },
  closeIcon: {
    width: 25,
    height: 25,
    tintColor: '#fff', // Supprime-le si ton image a déjà la bonne couleur
  },
});

export default ChatbotModal;