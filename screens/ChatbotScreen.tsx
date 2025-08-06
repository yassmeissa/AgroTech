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
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const HEADER_HEIGHT = 150;

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([
    { from: 'bot', text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnim = useRef(new Animated.Value(0)).current;
  const [headerHeight, setHeaderHeight] = useState(Platform.OS === 'ios' ? 90 : 60);

  // Mesurer la hauteur réelle de l'en-tête
 

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

      const res = await fetch('http://192.168.1.19:3000/chat', {
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

      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

<LinearGradient
  colors={['#03482bff', '#009933']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={[styles.headerContainer, { height: HEADER_HEIGHT }]} // HEADER_HEIGHT défini dans ton fichier JS
>
  <SafeAreaView style={styles.safeArea}>
<View style={styles.headerContent}>
  <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
    <Icon name="arrow-back" size={26} color="#fff" />
  </TouchableOpacity>

  <View style={styles.titleWrapper}>
    <Text style={styles.greeting}>Assistant virtuel</Text>
  </View>
</View>
  </SafeAreaView>
</LinearGradient>
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

  backButton: {
    position: 'absolute',
    top: 25,
    left: 20,
    zIndex: 20,
    backgroundColor: '#009933aa',
    padding: 8,
    borderRadius: 20,
  },

 headerContainer: {
    height: HEADER_HEIGHT,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
headerContent: {
  position: 'relative',
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',         // Centrage vertical
  justifyContent: 'center',     // Centrage horizontal
},
titleWrapper: {
  flex: 1,
  alignItems: 'center',
},

greeting: {
  fontSize: 22,
  color: '#fff',
  fontWeight: 'bold',
  textAlign: 'center',
},
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
    avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'white',
      marginRight: 20, // ✅ Ajouté

  },

  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
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
    backgroundColor: '#065a37ff',
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
    backgroundColor: '#009933aa',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#009933aa',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  sendButtonDisabled: {
    backgroundColor: '#3dd36faa',
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
    borderBottomColor: '#0065a37ff',
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