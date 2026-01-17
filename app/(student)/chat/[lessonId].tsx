import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Send, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';

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

export default function StudentChatScreen() {
  const { user } = useAuth();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  
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

  useEffect(() => {
    // Scroll para o final quando mensagens carregam
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadChat = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/chat/lesson/${lessonId}`);
      setChat(response as Chat);
      setMessages((response as Chat).messages || []);
      
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
      return {
        ...chat.lesson.instructor.user,
        role: 'INSTRUCTOR'
      };
    } else {
      return {
        ...chat.lesson.student,
        role: 'STUDENT'
      };
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-neutral-900">
            {otherParticipant?.name || 'Chat'}
          </Text>
          <Text className="text-sm text-neutral-500">
            {otherParticipant?.role === 'INSTRUCTOR' ? 'Instrutor' : 'Aluno'}
          </Text>
        </View>
        {!canSend && (
          <View className="flex-row items-center">
            <Lock size={16} color="#6B7280" />
            <Text className="text-xs text-neutral-500 ml-1">Bloqueado</Text>
          </View>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {messages.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-neutral-500 text-center">
              Nenhuma mensagem ainda.{'\n'}Seja o primeiro a cumprimentar!
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {messages.map((message) => {
              const isOwn = message.senderId === user?.id;
              return (
                <View
                  key={message.id}
                  className={`flex-row ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <View
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-emerald-500 rounded-br-sm'
                        : 'bg-neutral-100 rounded-bl-sm'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        isOwn ? 'text-white' : 'text-neutral-900'
                      }`}
                    >
                      {message.content}
                    </Text>
                    <Text
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-emerald-100' : 'text-neutral-500'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Input */}
      {canSend && (
        <View className="p-4 border-t border-neutral-100">
          <View className="flex-row items-end space-x-2">
            <View className="flex-1">
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Digite uma mensagem..."
                multiline
                className="bg-neutral-100 rounded-2xl px-4 py-3 max-h-20 text-neutral-900"
                textAlignVertical="top"
                editable={!isSending}
              />
            </View>
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                newMessage.trim() && !isSending
                  ? 'bg-emerald-500'
                  : 'bg-neutral-200'
              }`}
            >
              <Send
                size={20}
                color={newMessage.trim() && !isSending ? 'white' : '#9CA3AF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
