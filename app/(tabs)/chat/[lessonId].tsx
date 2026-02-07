import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Send, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

interface Chat {
  id: string;
  lessonId: string;
  messages: Message[];
  lesson: {
    id: string;
    student: {
      id: string;
      name: string;
      email: string;
    };
    instructor: {
      user: {
        id: string;
        name: string;
        email: string;
      };
    };
  };
}

export default function ChatScreen() {
  const { user } = useAuth();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const insets = useSafeAreaInsets();
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [canSend, setCanSend] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChat();
  }, [lessonId]);

  const loadChat = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/chat/lesson/${lessonId}`);
      setChat(response as Chat);
      setMessages((response as Chat).messages || []);

      try {
        await api.post(`/chat/lesson/${lessonId}/mark-read`);
      } catch {
        // Ignora erro de marcação como lido
      }
      
      // Verificar se pode enviar mensagens
      const canSendResponse = await api.get(`/chat/${(response as Chat).id}/can-send`);
      setCanSend((canSendResponse as any).canSend);
    } catch (error: any) {
      console.error('Erro ao carregar chat:', error);
      Alert.alert('Erro', 'Não foi possível carregar o chat');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chat || !canSend) return;

    try {
      setIsSending(true);
      const response = await api.post('/chat/messages', {
        chatId: chat.id,
        content: newMessage.trim(),
      });

      setMessages(prev => [...prev, response as Message]);
      setNewMessage('');
      
      // Scroll para baixo
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      Alert.alert('Erro', error.message || 'Não foi possível enviar a mensagem');
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = () => {
    if (!chat || !user) return null;
    
    if (user.role === 'STUDENT') {
      return chat.lesson.instructor.user;
    } else {
      return chat.lesson.student;
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-neutral-500">Carregando chat...</Text>
      </View>
    );
  }

  if (!chat) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-neutral-500">Chat não encontrado</Text>
        <Button
          onPress={() => router.back()}
          className="mt-4"
        >
          <Text className="text-white">Voltar</Text>
        </Button>
      </View>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}
      >
        {/* Header */}
        <View className="bg-white border-b border-neutral-200 px-4 pt-8 pb-3">
          <View className="flex-row items-center">
            <Button
              variant="ghost"
              onPress={() => router.back()}
              className="mr-3"
            >
              <Text className="text-neutral-600">←</Text>
            </Button>
            <View className="flex-1">
              <Text className="font-semibold text-neutral-900">
                {otherParticipant?.name}
              </Text>
              <Text className="text-sm text-neutral-500">
                {otherParticipant?.email}
              </Text>
            </View>
            {!canSend && (
              <View className="flex-row items-center">
                <Lock size={16} color="#EF4444" />
                <Text className="text-xs text-red-500 ml-1">Encerrado</Text>
              </View>
            )}
          </View>
        </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-2"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-neutral-400 text-center">
              Nenhuma mensagem ainda.{'\n'}Inicie a conversa!
            </Text>
          </View>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === user?.id;
            
            return (
              <View
                key={message.id}
                className={`mb-3 max-w-[80%] ${isOwn ? 'self-end' : 'self-start'}`}
              >
                <View
                  className={`px-4 py-2 rounded-2xl ${
                    isOwn
                      ? 'bg-brand-primary text-white'
                      : 'bg-neutral-100 text-neutral-900'
                  }`}
                >
                  <Text className={`text-sm ${isOwn ? 'text-white' : 'text-neutral-900'}`}>
                    {message.content}
                  </Text>
                </View>
                <Text className={`text-xs text-neutral-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                  {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Input */}
      {canSend ? (
        <View
          className="bg-white border-t border-neutral-200 px-4 py-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <View className="flex-row items-center bg-neutral-100 rounded-xl px-4">
            <TextInput
              className="flex-1 py-3 text-neutral-900"
              placeholder="Digite uma mensagem..."
              placeholderTextColor="#9CA3AF"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
              editable={!isSending}
            />
            <Button
              onPress={sendMessage}
              disabled={!newMessage.trim() || isSending}
              loading={isSending}
              className="ml-2 p-2"
              variant="ghost"
            >
              <Send size={20} color={newMessage.trim() ? "#2563EB" : "#9CA3AF"} />
            </Button>
          </View>
        </View>
      ) : (
        <View className="bg-white border-t border-neutral-200 px-4 py-3">
          <View className="flex-row items-center justify-center">
            <Lock size={16} color="#EF4444" />
            <Text className="text-sm text-red-500 ml-2">
              O chat foi encerrado porque a aula foi finalizada
            </Text>
          </View>
        </View>
      )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
