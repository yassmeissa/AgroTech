import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
    Bubble,
    GiftedChat,
    IMessage,
    InputToolbar,
} from 'react-native-gifted-chat';
const ChatBotScreen = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  // 🧠 Message d’accueil
  useEffect(() => {
    const welcomeMessage: IMessage = {
      _id: 'welcome',
      text: 'Bonjour 👋 Je suis AgroBot. Pose-moi une question sur tes cultures, la météo ou l’irrigation !',
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'AgroBot 🤖',
      },
    };
    setMessages([welcomeMessage]);
  }, []);
  const [isBotBusy, setIsBotBusy] = useState(false);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (isBotBusy) return;
  
    setIsBotBusy(true);
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  
    const userMessage = newMessages[0].text;
  
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `
  Tu es AgroBot, un assistant agricole expert 🌾. 
  Tu aides les utilisateurs à :
  - diagnostiquer des maladies sur les plantes
  - analyser la météo pour des décisions agricoles
  - gérer l'irrigation avec des conseils techniques
  
  Sois clair, pratique, et adapté à des agriculteurs.
              `,
            },
            { role: 'user', content: userMessage },
          ],
        },
        {
          headers: {
            Authorization: `Bearer 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`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const botReply = res?.data?.choices?.[0]?.message?.content || "Je n’ai pas pu répondre.";
  
      const botMessage: IMessage = {
        _id: Math.random().toString(36).substring(7),
        text: botReply,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'AgroBot 🤖',
        },
      };
  
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [botMessage])
      );
    } catch (error: any) {
      console.error('[ChatBot Error]', error);
  
      let message = "Une erreur s'est produite.";
      if (error.response?.status === 429) {
        message = "⏳ Trop de requêtes envoyées ! Attends quelques secondes...";
      }
  
      const botMessage: IMessage = {
        _id: Math.random().toString(36).substring(7),
        text: message,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'AgroBot 🤖',
        },
      };
  
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [botMessage])
      );
    } finally {
      setTimeout(() => {
        setIsBotBusy(false);
      }, 4000); // cooldown de 4s
    }
  }, []);

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs)}
        user={{ _id: 1 }}
        placeholder="Pose ta question ici..."
        showUserAvatar={false}
        showAvatarForEveryMessage={false}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
      />
    </View>
  );
};

// 💬 Style des bulles
const renderBubble = (props: any) => {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: '#f0f0f0',
        },
        right: {
          backgroundColor: '#2196f3',
        },
      }}
      textStyle={{
        left: {
          color: '#333',
        },
        right: {
          color: '#fff',
        },
      }}
    />
  );
};

// ⌨️ Style de la barre de saisie
const renderInputToolbar = (props: any) => (
  <InputToolbar
    {...props}
    containerStyle={{
      borderTopWidth: 1,
      borderTopColor: '#ccc',
      backgroundColor: '#fff',
    }}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: Platform.OS === 'android' ? 0 : 10,
  },
});

export default ChatBotScreen;