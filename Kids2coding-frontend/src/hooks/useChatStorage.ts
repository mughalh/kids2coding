import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type Chat = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

const STORAGE_KEY = 'ai_chats';

export const useChatStorage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);

  // Load chats from AsyncStorage on mount
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const storedChats = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedChats) {
        const parsedChats = JSON.parse(storedChats);
        // Sort by updatedAt descending (newest first)
        parsedChats.sort((a: Chat, b: Chat) => b.updatedAt - a.updatedAt);
        setChats(parsedChats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveChats = async (updatedChats: Chat[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats));
      setChats(updatedChats);
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  };

  const createNewChat = async (initialMessage?: string) => {
    const now = Date.now();
    const newChat: Chat = {
      id: `chat_${now}`,
      title: initialMessage 
        ? initialMessage.substring(0, 30) + (initialMessage.length > 30 ? '...' : '')
        : 'New Conversation',
      createdAt: now,
      updatedAt: now,
      messages: initialMessage ? [{
        id: `msg_${now}_1`,
        role: 'user',
        content: initialMessage,
        timestamp: now
      }] : []
    };

    const updatedChats = [newChat, ...chats];
    await saveChats(updatedChats);
    setCurrentChat(newChat);
    return newChat;
  };

  const addMessageToChat = async (chatId: string, content: string, role: 'user' | 'assistant') => {
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) return null;

    const now = Date.now();
    const newMessage: ChatMessage = {
      id: `msg_${now}`,
      role,
      content,
      timestamp: now
    };

    const updatedChats = [...chats];
    const updatedChat = { 
      ...updatedChats[chatIndex],
      messages: [...updatedChats[chatIndex].messages, newMessage],
      updatedAt: now,
      // Update title if this is the first user message
      title: updatedChats[chatIndex].messages.length === 0 && role === 'user'
        ? content.substring(0, 30) + (content.length > 30 ? '...' : '')
        : updatedChats[chatIndex].title
    };

    updatedChats[chatIndex] = updatedChat;
    await saveChats(updatedChats);
    
    if (currentChat?.id === chatId) {
      setCurrentChat(updatedChat);
    }
    
    return newMessage;
  };

  const loadChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
    }
    return chat;
  };

  const deleteChat = async (chatId: string) => {
    const updatedChats = chats.filter(c => c.id !== chatId);
    await saveChats(updatedChats);
    
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
    }
  };

  const deleteAllChats = async () => {
    await saveChats([]);
    setCurrentChat(null);
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) return;

    const updatedChats = [...chats];
    updatedChats[chatIndex] = {
      ...updatedChats[chatIndex],
      title: newTitle
    };

    await saveChats(updatedChats);
    
    if (currentChat?.id === chatId) {
      setCurrentChat(updatedChats[chatIndex]);
    }
  };

  return {
    chats,
    loading,
    currentChat,
    createNewChat,
    addMessageToChat,
    loadChat,
    deleteChat,
    deleteAllChats,
    updateChatTitle
  };
};