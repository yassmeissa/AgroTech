import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChatBotModal from './ChatBotModal';

const FloatingChatBotButton = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <ChatBotModal visible={visible} onClose={() => setVisible(false)} />

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.floatingButton} onPress={() => setVisible(true)}>
          <Text style={styles.floatingText}>💬</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    zIndex: 999,
  },
  floatingButton: {
    backgroundColor: '#2196f3',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 2, height: 2 },
    elevation: 5,
  },
  floatingText: {
    fontSize: 28,
    color: '#fff',
  },
});

export default FloatingChatBotButton;