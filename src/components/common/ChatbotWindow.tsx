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
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';
import { getOpenRouterService } from '../../services/openRouterService';


interface VideoCard {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  videos?: VideoCard[];
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
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Only sync messages from props when the chat window is opened (visible becomes true)
  useEffect(() => {
    if (visible) {
      setLocalMessages(messages);
    }
    // Do not add messages to dependency array to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (visible && localMessages.length > 0) {
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [visible, localMessages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    // Use a callback to ensure latest state
    setLocalMessages(prev => {
      const updated = [...prev, newMessage];
      // Call AI after state update
      (async () => {
        setIsLoading(true);
        if (onSendMessage) onSendMessage(newMessage.text);
        try {
          // Always use the latest messages for chat history
          const chatHistory = [...updated].map(m => ({
            role: m.isUser ? ('user' as 'user') : ('assistant' as 'assistant'),
            content: m.text
          }));
          let aiResult: { answer: string; videos?: any[] } = { answer: '' };
          try {
            const openRouter = getOpenRouterService();
            aiResult = await openRouter.sendMessage(chatHistory);
          } catch (serviceErr) {
            // If service isn't initialized, return a friendly message to the UI.
            console.warn('[Chatbot] OpenRouter unavailable:', (serviceErr as Error).message);
            aiResult = { answer: 'AI service is not configured. Please contact the app administrator.' };
          }
          // sanitize answer to avoid duplicated content inside the same bubble
          /*
          const sanitizeAnswer = (raw: string): string => {
            if (!raw) return raw;
            let text = raw.trim();
            // remove exact consecutive duplicate paragraphs
            const paras = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
            const dedupParas: string[] = [];
            for (let i = 0; i < paras.length; i++) {
              if (i === 0 || paras[i] !== paras[i - 1]) dedupParas.push(paras[i]);
            }
            text = dedupParas.join('\n\n');
            // if entire text is an exact repetition of its halves, keep one half
            if (text.length > 80) {
              const half = Math.floor(text.length / 2);
              const first = text.slice(0, half).trim();
              const second = text.slice(half).trim();
              if (first === second) {
                text = first;
              }
            }
            // remove consecutive duplicate sentences
            const sentences = text.split(/([.!?]\s+)/);
            const out: string[] = [];
            for (let i = 0; i < sentences.length; i++) {
              const s = sentences[i];
              if (!s.trim()) continue;
              if (out.length === 0 || s.trim() !== out[out.length - 1].trim()) out.push(s);
            }
            if (out.length > 0) {
              text = out.join('');
            }
            return text;
          };
          */
          const cleaned = aiResult.answer;
          console.debug('[Chatbot] raw answer length', (aiResult.answer || '').length, 'cleaned length', (cleaned || '').length);
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: cleaned,
            isUser: false,
            timestamp: new Date(),
            videos: 'videos' in aiResult ? (aiResult as any).videos : undefined,
          };
          setLocalMessages(current => {
            const last = current[current.length - 1];
            if (last && !last.isUser && last.text?.trim() === aiResponse.text?.trim()) {
              // duplicate assistant response — skip appending
              return current;
            }
            return [...current, aiResponse];
          });
        } catch (err) {
          const errorMsg: Message = {
            id: (Date.now() + 2).toString(),
            text: 'Sorry, I am having trouble responding right now.',
            isUser: false,
            timestamp: new Date(),
          };
          setLocalMessages(current => {
            const last = current[current.length - 1];
            if (last && !last.isUser && last.text?.trim() === errorMsg.text?.trim()) {
              return current;
            }
            return [...current, errorMsg];
          });
        } finally {
          setIsLoading(false);
        }
      })();
      return updated;
    });
    setInputText('');
  };

  const formatTime = (date: Date): string => {
  // accept Date | string | number and coerce to Date to avoid runtime errors
  const d = date instanceof Date ? date : new Date(date as any);
  return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Simple markdown-like renderer: supports headers (#, ##, ###), bold (**text**), italics (*text*),
  // unordered lists (- or *), and numbered lists (1.). Returns an array of React nodes.
  const parseInline = (text: string): React.ReactNode[] => {
    // split by bold/italic tokens while keeping them
    const tokenRegex = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
    const parts = text.split(tokenRegex).filter(Boolean);
    return parts.map((part, idx) => {
      // Bold: **text** or __text__
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        const inner = part.slice(2, -2);
        return <Text key={idx} style={{ fontWeight: '700' }}>{inner}</Text>;
      }
      // Italic: *text* or _text_
      if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
        const inner = part.slice(1, -1);
        return <Text key={idx} style={{ fontStyle: 'italic' }}>{inner}</Text>;
      }
      return <Text key={idx}>{part}</Text>;
    });
  };

  const renderFormattedText = (text: string) : React.ReactNode => {
    const lines = text.split(/\r?\n/);
    const nodes: React.ReactNode[] = [];
    let listIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        nodes.push(<Text key={`br-${i}`} style={{ height: 8 }} />);
        continue;
      }

      // Headers
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = headerMatch[2];
        const size = level === 1 ? FONT_SIZES.xl : level === 2 ? FONT_SIZES.lg : FONT_SIZES.md;
        nodes.push(
          <Text key={`h-${i}`} style={{ fontSize: size, fontWeight: '700', marginVertical: 6, color: COLORS.text }}>
            {parseInline(content)}
          </Text>
        );
        continue;
      }

      // Unordered list
      const ulMatch = line.match(/^[-*]\s+(.*)$/);
      if (ulMatch) {
        const content = ulMatch[1];
        nodes.push(
          <View key={`ul-${i}`} style={{ flexDirection: 'row', alignItems: 'flex-start', marginVertical: 2 }}>
            <Text style={{ marginRight: 8, color: COLORS.textSecondary }}>•</Text>
            <Text style={{ flex: 1, color: COLORS.text }}>{parseInline(content)}</Text>
          </View>
        );
        continue;
      }

      // Numbered list
      const olMatch = line.match(/^\d+\.\s+(.*)$/);
      if (olMatch) {
        const content = olMatch[1];
        listIndex += 1;
        nodes.push(
          <View key={`ol-${i}`} style={{ flexDirection: 'row', alignItems: 'flex-start', marginVertical: 2 }}>
            <Text style={{ marginRight: 8, color: COLORS.textSecondary }}>{listIndex}.</Text>
            <Text style={{ flex: 1, color: COLORS.text }}>{parseInline(content)}</Text>
          </View>
        );
        continue;
      }
      // Paragraph
      nodes.push(
        <Text key={`p-${i}`} style={{ color: COLORS.text, fontSize: FONT_SIZES.md, marginVertical: 2 }}>
          {parseInline(line)}
        </Text>
      );
    }
    return <View>{nodes}</View>;
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
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  {/* Chat bubble icon for user and bot */}
                  {message.isUser ? (
                    <View style={{ marginRight: 6 }}>
                      <Ionicons name="person-circle" size={24} color={COLORS.primary} />
                    </View>
                  ) : (
                    <View style={{ marginRight: 6 }}>
                      <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.primaryDark} />
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      message.isUser ? styles.userBubble : styles.botBubble,
                    ]}
                  >
                    {message.isUser ? (
                      <Text
                        style={[
                          styles.messageText,
                          styles.userText,
                        ]}
                      >
                        {message.text}
                      </Text>
                    ) : (
                      <>
                        {/* Render formatted bot text (supports headers, bold, italics, lists) */}
                        <View style={{ marginBottom: 4 }}>
                          {renderFormattedText(message.text)}
                        </View>
                        {/* Render YouTube video cards if present */}
                        {message.videos && message.videos.length > 0 && (
                          <View style={{ marginTop: 8 }}>
                            {message.videos.map((video) => (
                              <View key={video.id} style={{ marginBottom: 10, backgroundColor: COLORS.surface, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border }}>
                                <View style={{ flexDirection: 'row' }}>
                                  <TouchableOpacity
                                    onPress={() => {
                                      const url = `https://www.youtube.com/watch?v=${video.id}`;
                                      Linking.openURL(url);
                                    }}
                                    activeOpacity={0.8}
                                  >
                                    <View style={{ width: 120, height: 70, backgroundColor: '#000' }}>
                                      <Image
                                        source={{ uri: video.thumbnail }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="cover"
                                      />
                                    </View>
                                  </TouchableOpacity>
                                  <View style={{ flex: 1, padding: 8, justifyContent: 'center' }}>
                                    <Text style={{ fontWeight: 'bold', color: COLORS.text }}>{video.title}</Text>
                                    <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>{video.channelTitle}</Text>
                                    <Text style={{ color: COLORS.textSecondary, fontSize: 10 }}>{video.publishedAt.substring(0, 10)} • {video.duration}</Text>
                                  </View>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </>
                    )}
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
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              style={[
                styles.sendButton,
                { opacity: inputText.trim() && !isLoading ? 1 : 0.5 }
              ]}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons
                name={isLoading ? "hourglass" : "send"}
                size={20}
                color={inputText.trim() && !isLoading ? COLORS.white : COLORS.textLight}
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