import { useRouter } from "expo-router";
import { Bot, HelpCircle, Lightbulb, Send, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AppText } from "../src/components/AppText";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Colors } from "../src/constants/colors";

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export default function AIBuddyScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm Codey, your AI coding buddy. I can help you with programming questions, explain concepts, debug code, or just chat about coding! What would you like to learn today?",
      sender: 'ai',
      timestamp: new Date(),
    },
    {
      id: '2',
      text: "Can you explain what variables are in JavaScript?",
      sender: 'user',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    },
    {
      id: '3',
      text: "Great question! In JavaScript, variables are containers for storing data values. They're like labeled boxes where you can put different types of information to use later. There are three ways to declare variables: var, let, and const.",
      sender: 'ai',
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const quickQuestions = [
    "What is a function?",
    "How do loops work?",
    "Explain HTML tags",
    "Debug my code",
    "Give me a challenge",
  ];

  const features = [
    { icon: "💡", title: "Explain Concepts", description: "Get simple explanations" },
    { icon: "🐛", title: "Debug Code", description: "Find and fix errors" },
    { icon: "💬", title: "Practice Chat", description: "Improve your skills" },
    { icon: "🎯", title: "Get Challenges", description: "Test your knowledge" },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's an interesting question! Let me break it down for you...",
        "Great question! Here's how that works in programming...",
        "I'd be happy to explain that concept. First, let's understand...",
        "That's a common question beginners have. Here's what you need to know...",
      ];

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isAI = message.sender === 'ai';

    return (
      <Animated.View 
        style={[
          styles.messageContainer,
          isAI ? styles.messageAI : styles.messageUser,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.messageHeader}>
          <View style={styles.messageAvatar}>
            {isAI ? (
              <View style={[styles.avatar, styles.avatarAI]}>
                <Bot size={20} color="white" />
              </View>
            ) : (
              <View style={[styles.avatar, styles.avatarUser]}>
                <AppText>👤</AppText>
              </View>
            )}
            <AppText style={styles.senderName}>
              {isAI ? "Codey AI" : "You"}
            </AppText>
          </View>
          <AppText style={styles.timestamp}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </AppText>
        </View>

        <View style={[
          styles.bubble,
          isAI ? styles.bubbleAI : styles.bubbleUser
        ]}>
          <AppText style={[
            styles.messageText,
            isAI ? styles.messageTextAI : styles.messageTextUser
          ]}>
            {message.text}
          </AppText>
        </View>

        {isAI && (
          <View style={styles.messageActions}>
            <TouchableOpacity style={styles.actionButton}>
              <ThumbsUp size={16} color={Colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <ThumbsDown size={16} color={Colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <AppText style={styles.actionText}>Copy</AppText>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScreenWrapper>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.aiAvatar}>
              <Bot size={24} color={Colors.primary} />
            </View>
            <View style={styles.headerText}>
              <AppText style={styles.title}>Codey AI Buddy 🤖</AppText>
              <AppText style={styles.subtitle}>Your personal coding assistant</AppText>
            </View>
            <TouchableOpacity style={styles.sparklesButton}>
              <Sparkles size={20} color={Colors.warning} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Features */}
          <View style={styles.featuresSection}>
            <AppText style={styles.featuresTitle}>What I can help with</AppText>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <AppText style={styles.featureIcon}>{feature.icon}</AppText>
                  <AppText style={styles.featureTitle}>{feature.title}</AppText>
                  <AppText style={styles.featureDesc}>{feature.description}</AppText>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Questions */}
          <View style={styles.quickQuestions}>
            <AppText style={styles.quickQuestionsTitle}>Quick Questions</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickQuestion}
                  onPress={() => handleQuickQuestion(question)}
                >
                  <HelpCircle size={16} color={Colors.primary} />
                  <AppText style={styles.quickQuestionText}>{question}</AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Messages */}
          <View style={styles.messages}>
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <View style={[styles.messageContainer, styles.messageAI]}>
                <View style={styles.messageHeader}>
                  <View style={styles.messageAvatar}>
                    <View style={[styles.avatar, styles.avatarAI]}>
                      <Bot size={20} color="white" />
                    </View>
                    <AppText style={styles.senderName}>Codey AI</AppText>
                  </View>
                </View>
                <View style={[styles.bubble, styles.bubbleAI]}>
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about coding..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            placeholderTextColor={Colors.textLight}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tips}>
          <Lightbulb size={16} color={Colors.warning} />
          <AppText style={styles.tipsText}>
            Tip: Be specific with your questions for better answers!
          </AppText>
        </View>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aiAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  sparklesButton: {
    padding: 10,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
    textAlign: "center",
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
  },
  quickQuestions: {
    marginBottom: 30,
  },
  quickQuestionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
  },
  quickQuestion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  quickQuestionText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text,
  },
  messages: {
    flex: 1,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 20,
  },
  messageAI: {
    alignSelf: "flex-start",
  },
  messageUser: {
    alignSelf: "flex-end",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  messageAvatar: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarAI: {
    backgroundColor: Colors.primary,
  },
  avatarUser: {
    backgroundColor: Colors.accent,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textLight,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 20,
    padding: 15,
  },
  bubbleAI: {
    backgroundColor: Colors.borderLight,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextAI: {
    color: Colors.text,
  },
  messageTextUser: {
    color: "white",
  },
  messageActions: {
    flexDirection: "row",
    marginTop: 8,
    marginLeft: 40,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  actionText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textLight,
    marginHorizontal: 2,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    color: Colors.text,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  tips: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: Colors.warning + "10",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tipsText: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.textLight,
  },
});