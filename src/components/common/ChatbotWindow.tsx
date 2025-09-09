import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotWindowProps {
  visible: boolean;
  onClose: () => void;
  onSendMessage?: (message: string) => void;
  messages?: Message[];
  placeholder?: string;
  title?: string;
}

const { height: screenHeight } = Dimensions.get('window');

const ChatbotWindow: React.FC<ChatbotWindowProps> = ({
  visible,
  onClose,
  onSendMessage,
  messages = [],
  placeholder = "Ask me anything about sports training...",
  title = "AI Sports Assistant",
}) => {
  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (visible && localMessages.length > 0) {
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [visible, localMessages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      setLocalMessages(prev => [...prev, newMessage]);
      
      if (onSendMessage) {
        onSendMessage(inputText.trim());
      }

      setInputText('');

      // Simulate AI response (replace with actual AI integration)
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thank you for your question! I'm here to help you with sports training, technique analysis, and performance optimization. How can I assist you today?",
          isUser: false,
          timestamp: new Date(),
        };
        setLocalMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.window}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.botInfo}>
              <View style={styles.botAvatar}>
                <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.white} />
              </View>
              <View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>Online • AI Assistant</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {localMessages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIcon}>
                <Ionicons name="fitness" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.welcomeTitle}>Welcome to AI Sports Assistant!</Text>
              <Text style={styles.welcomeText}>
                I can help you with:
              </Text>
              <View style={styles.featuresList}>
                <Text style={styles.featureItem}>• Training techniques and form</Text>
                <Text style={styles.featureItem}>• Performance analysis</Text>
                <Text style={styles.featureItem}>• Injury prevention tips</Text>
                <Text style={styles.featureItem}>• Nutrition and recovery</Text>
                <Text style={styles.featureItem}>• Competition strategies</Text>
              </View>
            </View>
          ) : (
            localMessages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessage : styles.botMessage,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.isUser ? styles.userText : styles.botText,
                    ]}
                  >
                    {message.text}
                  </Text>
                  <Text
                    style={[
                      styles.timestamp,
                      message.isUser ? styles.userTimestamp : styles.botTimestamp,
                    ]}
                  >
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={placeholder}
              placeholderTextColor={COLORS.textLight}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              style={[
                styles.sendButton,
                { opacity: inputText.trim() ? 1 : 0.5 }
              ]}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? COLORS.white : COLORS.textLight}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  window: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 50,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  messagesContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  featuresList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  messageContainer: {
    marginBottom: SPACING.md,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  botBubble: {
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
    ...SHADOWS.sm,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  userText: {
    color: COLORS.white,
  },
  botText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  botTimestamp: {
    color: COLORS.textLight,
  },
  inputContainer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
});

export default ChatbotWindow;