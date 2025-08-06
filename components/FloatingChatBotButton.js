import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ChatBotModal from './ChatBotModal';

const FloatingChatBotButton = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <ChatBotModal visible={visible} onClose={() => setVisible(false)} />

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.floatingButton} onPress={() => setVisible(true)}>
<AntDesign name="wechat" size={32} color="#fff" />        </TouchableOpacity>
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
    backgroundColor: '#009933aa',
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
});

export default FloatingChatBotButton;