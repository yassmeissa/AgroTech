import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';

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
  const typingAnim = useRef(new Animated.Value(0)).current;
  const headerRef = useRef<View>(null);
  const [headerHeight, setHeaderHeight] = useState(Platform.OS === 'ios' ? 90 : 60);

  // Mesurer la hauteur réelle de l'en-tête
  const onHeaderLayout = () => {
    if (headerRef.current) {
      headerRef.current.measure((x, y, width, height) => {
        setHeaderHeight(height + (Platform.OS === 'ios' ? 30 : StatusBar.currentHeight || 0));
      });
    }
  };

  // Animation pour les points de saisie
  useEffect(() => {
    if (isLoading) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver: true
          }),
          Animated.timing(typingAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver: true
          })
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isLoading, typingAnim]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    try {
      const userMessage = { from: 'user', text: input };
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      const res = await fetch('https://b70f-2a01-e0a-87f-1670-dd5f-be55-aaf3-251.ngrok-free.app/chat', {
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
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const typingDotStyle = (index: number) => ({
    opacity: typingAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3 + index * 0.2, 1, 0.3 + index * 0.2]
    }),
    transform: [
      {
        translateY: typingAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -5 * (index + 1)]
        })
      }
    ]
  });

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={headerHeight}
      >
        <View 
          ref={headerRef}
          onLayout={onHeaderLayout}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Image 
              source={{ uri: 'https://img.icons8.com/color/48/000000/robot-3.png' }}
              style={styles.headerIcon}
            />
            <Text style={styles.headerText}>Assistant Virtuel</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, index) => (
            <Animated.View
              key={`${index}-${msg.text.substring(0, 5)}`}
              style={[
                styles.messageBubble,
                msg.from === 'user' ? styles.userBubble : styles.botBubble,
                {
                  opacity: 1,
                  transform: [{ translateY: 0 }]
                }
              ]}
            >
              {msg.from === 'bot' && (
                <Image
                  source={{ uri: 'https://img.icons8.com/color/48/000000/robot-2.png' }}
                  style={styles.botIcon}
                />
              )}
              <Text style={msg.from === 'user' ? styles.userText : styles.botText}>
                {msg.text}
              </Text>
              {msg.from === 'user' && (
                <View style={styles.userMessageTail} />
              )}
              {msg.from === 'bot' && (
                <View style={styles.botMessageTail} />
              )}
            </Animated.View>
          ))}

          {isLoading && (
            <View style={[styles.messageBubble, styles.botBubble]}>
              <Image
                source={{ uri: 'https://img.icons8.com/color/48/000000/robot-2.png' }}
                style={styles.botIcon}
              />
              <View style={styles.typingContainer}>
                {[0, 1, 2].map((i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.typingDot,
                      typingDotStyle(i),
                      { backgroundColor: '#5e5e5e' }
                    ]}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Écrivez votre message..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            multiline
            editable={!isLoading}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
            activeOpacity={0.7}
          >
          <Image
            source={require('../assets/icons/send.png')} // ajuste le chemin si besoin
            style={[
              styles.sendIcon,
              (!input.trim() || isLoading) && { opacity: 0.5 }
            ]}
            resizeMode="contain"
          />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6e48aa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#6e48aa',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  chatContent: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 18,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    position: 'relative',
  },
  botBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
    marginLeft: 10,
  },
  userBubble: {
    backgroundColor: '#6e48aa',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
    marginRight: 10,
  },
  botText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
  },
  botIcon: {
    width: 28,
    height: 28,
    marginRight: 10,
    borderRadius: 14,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    paddingHorizontal: 10,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 120,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#6e48aa',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6e48aa',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  sendButtonDisabled: {
    backgroundColor: '#b3a1d8',
  },
  userMessageTail: {
    position: 'absolute',
    right: -10,
    bottom: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#6e48aa',
    transform: [{ rotate: '-20deg' }],
  },
    sendIcon: {
    width: 25,
    height: 25,
    tintColor: 'white', // change ou retire selon les couleurs de ton image
  },
  botMessageTail: {
    position: 'absolute',
    left: -10,
    bottom: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffffff',
    transform: [{ rotate: '20deg' }],
  }
});  