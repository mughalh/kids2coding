import { useRouter } from "expo-router";
import { Bot, HelpCircle, Lightbulb, Send, Sparkles, ThumbsDown, ThumbsUp, Copy } from "lucide-react-native";
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
    Alert,
    Clipboard,
} from "react-native";
import { AppText } from "../src/components/AppText";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Colors } from "../src/constants/colors";
import { useAppContext } from "../src/contexts/AppContext";
import { useAuth } from "../src/hooks/useAuth";
import { getCourseById } from "../src/services/coursesService";
import { getGameById } from "../src/services/gamesService";
import { Home, Gamepad2, Puzzle, User } from "lucide-react-native";
import { useChatStorage } from '../src/hooks/useChatStorage';
import { Menu, Plus, Trash2, MessageSquare } from "lucide-react-native";
import { Modal, FlatList } from 'react-native';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

// Ollama API configuration

const OLLAMA_URL = 'http://localhost:11434';
//const OLLAMA_URL = 'http://192.168.100.54:11434';
const MODEL_NAME = 'gemma3:4b-it-qat';

export default function AIBuddyScreen() {
  const router = useRouter();
  const { currentScreen, currentCourseId, currentLessonId, currentGameId, currentPuzzleId } = useAppContext();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi ${user?.displayName || 'there'}! 👋 I'm Codey, your AI coding buddy for Kids 2 Coding! 

I know everything about our app - the courses, games, puzzles, and how to navigate around. I can help you with coding questions, explain concepts, or tell you more about any feature.

What would you like to learn about today? 🚀`,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOllamaConnected, setIsOllamaConnected] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
 // const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animated typing dots
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

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

  const { 
    chats, 
    currentChat, 
    createNewChat, 
    addMessageToChat, 
    loadChat,
    deleteChat 
} = useChatStorage();

  useEffect(() => {

    // Start typing dot animation
    startTypingAnimation();
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, streamingMessage]);

  // Check Ollama connection on mount
  useEffect(() => {
    checkOllamaConnection();
  }, []);

  const startTypingAnimation = () => {
    const createAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createAnimation(dot1Anim, 0),
      createAnimation(dot2Anim, 200),
      createAnimation(dot3Anim, 400),
    ]).start();
  };

  const checkOllamaConnection = async () => {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const modelAvailable = data.models?.some((m: any) => m.name === MODEL_NAME);
        if (!modelAvailable) {
          Alert.alert(
            "Model Not Found",
            `Model ${MODEL_NAME} is not available. Please run: ollama pull ${MODEL_NAME}`,
            [{ text: "OK" }]
          );
        }
        setIsOllamaConnected(true);
      } else {
        setIsOllamaConnected(false);
        Alert.alert(
          "Ollama Not Connected",
          "Please make sure Ollama is running on your PC (ollama serve)",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      setIsOllamaConnected(false);
      Alert.alert(
        "Connection Error",
        "Cannot connect to Ollama. Make sure it's running on localhost:11434",
        [{ text: "OK" }]
      );
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setString(text);
    Alert.alert("Copied!", "Message copied to clipboard");
  };

  const generateStreamingResponse = async (userMessage: string) => {
    try {
      if (!isOllamaConnected) {
        return "⚠️ Ollama is not connected. Please make sure it's running on your PC with: ollama serve";
      }

      // Fetch context data
      let courseInfo = null;
      let gameInfo = null;
      
      if (currentCourseId) {
        courseInfo = await getCourseById(currentCourseId);
      }
      
      if (currentGameId) {
        gameInfo = await getGameById(currentGameId);
      }

      // Get user's display name
      const userName = user?.displayName || user?.email?.split('@')[0] || 'Coder';

      // Build comprehensive app knowledge
      const appKnowledge = `
  APP NAME: Kids 2 Coding
  
  APP DESCRIPTION:
  Kids 2 Coding is a fun, interactive learning platform that teaches programming concepts to children through gamified courses, lessons, quizzes, and games.
  
  KEY FEATURES:
  1. 📚 Courses - 6 interactive coding courses including:
     - Python Adventures (beginner)
     - JavaScript for Gamers (intermediate)
     - Scratch Game Studio (beginner)
     - Web Design Fun (beginner)
     - Robotics Adventure (intermediate)
     - AI for Kids (intermediate)
  
  2. 🎮 Games - 8 fun coding games:
     - Code Runner - Run and test JavaScript code
     - Fix the Bug - Debug JavaScript programs
     - Syntax Puzzle - Fix syntax errors
     - Memory Match - Match coding concepts
     - Logic Maze - Navigate with coding logic
     - Algorithm Race - Solve algorithmic challenges
     - Sudoku - Classic number puzzles
     - Tic Tac Toe - Play against AI or friends
  
  3. 🧩 Puzzles - Interactive brain teasers:
     - Sudoku puzzles
     - Word Search games
     - Maze challenges
  
  4. 🏆 Progress Tracking:
     - Earn XP points for completing lessons and games
     - Level up (every 100 XP = 1 level)
     - Daily streaks for consecutive learning
     - Badges for achievements
     - Win/loss tracking for games
  
  5. 🎯 Challenges:
     - Daily challenges that reset every 24 hours
     - Weekly challenges with bigger rewards
     - Special challenges with unique badges
  
  6. 🏗️ Projects:
     - Student project showcase
     - Space Invaders game demo
     - Weather app demo
     - Portfolio website demo
  
  7. 🤖 AI Buddy (YOU!):
     - Powered by Ollama running locally on the user's PC
     - Can answer coding questions
     - Helps debug code
     - Explains programming concepts
     - Provides personalized help based on what the user is currently doing
  
  8. 📊 Dashboard:
     - Shows user progress, XP, level, streak
     - Quick access to courses, games, puzzles
     - Badges display (earned/unearned)
     - Bottom navigation bar with Home, Games, Puzzles, AI Buddy, Profile
  
  NAVIGATION GUIDE:
  - Home/Dashboard: '/dashboard'
  - Courses: '/courses'
  - Games: '/games'
  - Puzzles: '/puzzles'
  - AI Buddy: '/ai-buddy'
  - Profile: '/profile'
  - Leaderboard: '/leaderboard'
  - Challenges: '/challenges'
  - Daily Challenge: '/daily-challenge'
  - Projects: '/projects'
  `;

      // Build current context
      let contextParts = [
        `Current screen: ${currentScreen}`,
        `Current user: ${userName}`,
      ];

      if (courseInfo) {
        contextParts.push(`\nCOURSE CONTEXT:`);
        contextParts.push(`- Course: ${courseInfo.title}`);
        contextParts.push(`- Description: ${courseInfo.description}`);
        contextParts.push(`- Level: ${courseInfo.level}`);
        contextParts.push(`- Lessons: ${courseInfo.lessonsCount || 0} total`);
        
        if (currentLessonId && courseInfo.lessons?.[currentLessonId]) {
          const lesson = courseInfo.lessons[currentLessonId];
          contextParts.push(`\nCURRENT LESSON:`);
          contextParts.push(`- Lesson: ${lesson.title}`);
          contextParts.push(`- Lesson content: ${lesson.content?.substring(0, 200)}...`);
        }
      }

      if (gameInfo) {
        contextParts.push(`\nGAME CONTEXT:`);
        contextParts.push(`- Game: ${gameInfo.title}`);
        contextParts.push(`- Description: ${gameInfo.description}`);
        contextParts.push(`- Difficulty: ${gameInfo.difficulty}`);
      }

      if (currentPuzzleId) {
        contextParts.push(`\nPUZZLE CONTEXT:`);
        contextParts.push(`- Working on a coding puzzle`);
      }

      const currentContext = contextParts.join('\n');

      // Build conversation history
      const conversationHistory = messages
        .filter(msg => msg.id !== '1')
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');

      const prompt = `You are Codey, a friendly and enthusiastic AI coding buddy for Kids 2 Coding, an educational app for children learning to program.
  
  ABOUT THE APP:
  ${appKnowledge}
  
  CURRENT CONTEXT:
  ${currentContext}
  
  CONVERSATION HISTORY:
  ${conversationHistory}
  
  IMPORTANT GUIDELINES:
  1. Address the user by name (${userName}) when appropriate
  2. Use the app knowledge above to answer questions about:
     - How to navigate to different sections
     - What features are available
     - How progress tracking works
     - Details about specific courses, games, or puzzles
     - How to earn XP, badges, and level up
  3. If they're asking about their current screen/course/game, use the context to give specific help
  4. Keep explanations simple, fun, and engaging for young learners (ages 8-14)
  5. Use emojis occasionally to keep it friendly (😊, 🎮, 📚, etc.)
  6. If they ask something completely unrelated to coding or the app, gently guide them back
  7. If they want to go somewhere, tell them how to navigate there
  8. For debugging questions, ask to see their code
  9. Be encouraging and celebrate their progress!
  
  User: ${userMessage}
  Assistant:`;

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          prompt: prompt,
          stream: true,
          options: {
            temperature: 0.7,
            num_predict: 500,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama returned ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      setIsStreaming(true);
      setStreamingMessage('');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              fullResponse += parsed.response;
              setStreamingMessage(fullResponse);
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }

      setIsStreaming(false);
      return fullResponse;
    } catch (error) {
      console.error('Ollama API Error:', error);
      setIsStreaming(false);
      if (error.message?.includes('Failed to fetch')) {
        return "🔌 Cannot connect to Ollama. Make sure it's running on your PC with: ollama serve";
      }
      return "I encountered an error. Please check your Ollama connection and try again.";
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTyping || isStreaming) return;

    const userMessageText = inputText;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      // Get streaming AI response
      const aiResponseText = await generateStreamingResponse(userMessageText);

      // Add complete AI response
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setStreamingMessage('');
    } catch (error) {
      console.error('Error in handleSend:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
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
                <AppText style={styles.avatarText}>👤</AppText>
              </View>
            )}
            <AppText style={styles.senderName}>
              {isAI ? "Codey AI (Gemma 3)" : "You"}
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
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => copyToClipboard(message.text)}
            >
              <Copy size={16} color={Colors.textLight} />
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
              <AppText style={styles.subtitle}>
                {isOllamaConnected 
                  ? `🟢 Connected • Helping ${user?.displayName || 'you'}`
                  : "🔴 Ollama Disconnected"}
              </AppText>
            </View>
            <TouchableOpacity 
              style={styles.sparklesButton}
              onPress={checkOllamaConnection}
            >
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
            
            {/* Streaming message */}
            {isStreaming && streamingMessage && (
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
                  <AppText style={styles.messageTextAI}>{streamingMessage}</AppText>
                </View>
              </View>
            )}

            {/* Typing indicator */}
            {isTyping && !isStreaming && (
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
                    <Animated.View style={[styles.typingDot, { opacity: dot1Anim }]} />
                    <Animated.View style={[styles.typingDot, { opacity: dot2Anim }]} />
                    <Animated.View style={[styles.typingDot, { opacity: dot3Anim }]} />
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
              (!inputText.trim() || isTyping || isStreaming || !isOllamaConnected) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping || isStreaming || !isOllamaConnected}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tips}>
          <Lightbulb size={16} color={Colors.warning} />
          <AppText style={styles.tipsText}>
            {isOllamaConnected 
              ? "✅ Connected" 
              : "⚠️ Not connected"}
          </AppText>
        </View>

              {/* Bottom Navigation - Same as Dashboard */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push("/dashboard")}
        >
          <Home size={24} color={Colors.primary} />
          <AppText style={[styles.navLabel, { color: Colors.primary }]}>Home</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push("/games")}
        >
          <Gamepad2 size={24} color={Colors.textLight} />
          <AppText style={styles.navLabel}>Games</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push("/puzzles")}
        >
          <Puzzle size={24} color={Colors.textLight} />
          <AppText style={styles.navLabel}>Puzzles</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push("/ai-buddy")}
        >
          <Bot size={24} color={Colors.primary} />
          <AppText style={[styles.navLabel, { color: Colors.primary }]}>AI</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push("/profile")}
        >
          <User size={24} color={Colors.textLight} />
          <AppText style={styles.navLabel}>Profile</AppText>
        </TouchableOpacity>
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
  bottomNav: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  backgroundColor: Colors.surface,
  paddingVertical: 8,
  paddingBottom: 12,
  borderTopWidth: 1,
  borderTopColor: Colors.border,
},
navItem: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 4,
},
navLabel: {
  fontSize: 10,
  color: Colors.textLight,
  marginTop: 2,
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
  avatarText: {
    fontSize: 16,
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
    padding: 4,
  },
  actionText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.text,
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
    backgroundColor: Colors.textLight + "50",
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