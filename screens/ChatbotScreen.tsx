import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([
    { from: 'bot', text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const userMessage = { from: 'user', text: input };
      
      // Commenté temporairement la mise à jour de l'état et l'animation
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages(prev => [...prev, userMessage]);
      
      setInput('');
      setIsLoading(true);

      const res = await fetch('https://1b7a-46-193-1-122.ngrok-free.app/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (!data || typeof data.reply !== 'string') {
        throw new Error('Réponse du serveur invalide');
      }

      const botMessage = { from: 'bot', text: data.reply };
      
      // Commenté temporairement la mise à jour des messages
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = {
        from: 'bot',
        text: "Désolé, une erreur s'est produite. Veuillez réessayer."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Erreur scrollToEnd :', error);
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>🤖 Assistant Virtuel</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Commenté temporairement pour tester sans afficher les messages */}
     {messages.map((msg, index) => (
  <View
    key={index} // ✅ Utilise ça au lieu de `${index}-${Date.now()}`
    style={[
      styles.messageBubble,
      msg.from === 'user' ? styles.userBubble : styles.botBubble
    ]}
  >
    {msg.from === 'bot' && (
      <Image
        source={{ uri: 'https://img.icons8.com/emoji/48/robot-emoji.png' }}
        style={styles.botIcon}
      />
    )}
    <Text style={msg.from === 'user' ? styles.userText : styles.botText}>
      {msg.text}
    </Text>
  </View>
))}

        {isLoading && (
          <View style={[styles.messageBubble, styles.botBubble]}>
            <Image
              source={{ uri: 'https://img.icons8.com/emoji/48/robot-emoji.png' }}
              style={styles.botIcon}
            />
            <View style={styles.typingIndicator}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrivez votre message..."
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8eaf6',
  },
  header: {
    backgroundColor: '#3f51b5',
    padding: 18,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  chatContent: {
    paddingVertical: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  botBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#3f51b5',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  botIcon: {
    width: 26,
    height: 26,
    marginRight: 8,
    borderRadius: 13,
  },
  typingIndicator: {
    flexDirection: 'row',
    padding: 10,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#3f51b5',
    padding: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9fa8da',
  }
});