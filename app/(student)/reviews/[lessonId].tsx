import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Star, ArrowLeft } from 'lucide-react-native';
import { api } from '@/services/api';

type ExistingReview = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
};

export default function StudentReviewScreen() {
  const { lessonId: lessonIdParam } = useLocalSearchParams<{ lessonId: string }>();
  const lessonId = Array.isArray(lessonIdParam) ? lessonIdParam[0] : lessonIdParam;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');

  const canSubmit = useMemo(() => rating >= 1 && rating <= 5 && !isSubmitting && !existingReview, [rating, isSubmitting, existingReview]);

  useEffect(() => {
    setExistingReview(null);
    setRating(0);
    setComment('');
    if (lessonId) {
      loadExistingReview();
    }
  }, [lessonId]);

  const loadExistingReview = async () => {
    if (!lessonId) return;
    try {
      setIsLoading(true);
      const response = await api.get<ExistingReview | null>(`/reviews/lesson/${lessonId}`);
      if (response) {
        setExistingReview(response);
        setRating(response.rating);
        setComment(response.comment || '');
      } else {
        setExistingReview(null);
        setRating(0);
        setComment('');
      }
    } catch (err: any) {
      if (err?.statusCode === 404) {
        setExistingReview(null);
        setRating(0);
        setComment('');
        return;
      }
      console.log('Erro ao carregar avaliação:', err);
      Alert.alert('Erro', 'Não foi possível carregar a avaliação.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitReview = async () => {
    if (!lessonId || !canSubmit) return;

    try {
      setIsSubmitting(true);
      await api.post('/reviews', {
        lessonId,
        rating,
        comment: comment.trim() ? comment.trim() : undefined,
      });

      Alert.alert('Sucesso', 'Avaliação enviada com sucesso!');
      router.back();
    } catch (err: any) {
      console.log('Erro ao enviar avaliação:', err);
      Alert.alert('Erro', err?.message || 'Não foi possível enviar a avaliação');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-neutral-500 mt-3">Carregando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-neutral-900">Avaliar Aula</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {existingReview ? (
          <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
            <Text className="text-emerald-900 font-semibold">Você já avaliou esta aula</Text>
            <Text className="text-emerald-700 text-sm mt-1">Você pode visualizar sua avaliação abaixo.</Text>
          </View>
        ) : (
          <View className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-4">
            <Text className="text-neutral-900 font-semibold">Sua opinião é importante</Text>
            <Text className="text-neutral-600 text-sm mt-1">Dê uma nota para o instrutor e, se quiser, deixe um comentário.</Text>
          </View>
        )}

        <Text className="text-neutral-900 font-semibold mb-2">Nota</Text>
        <View className="flex-row items-center mb-4">
          {[1, 2, 3, 4, 5].map((value) => {
            const selected = value <= rating;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => !existingReview && setRating(value)}
                disabled={!!existingReview}
                className="mr-2"
              >
                <Star
                  size={28}
                  color={selected ? '#F59E0B' : '#D1D5DB'}
                  fill={selected ? '#F59E0B' : 'transparent'}
                />
              </TouchableOpacity>
            );
          })}
          <Text className="ml-2 text-neutral-600">{rating > 0 ? `${rating}/5` : 'Selecione'}</Text>
        </View>

        <Text className="text-neutral-900 font-semibold mb-2">Comentário (opcional)</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Conte como foi sua experiência..."
          multiline
          editable={!existingReview && !isSubmitting}
          className="bg-neutral-100 rounded-xl px-4 py-3 text-neutral-900"
          style={{ minHeight: 120, textAlignVertical: 'top' }}
        />

        <TouchableOpacity
          onPress={submitReview}
          disabled={!canSubmit}
          className={`mt-6 rounded-xl py-3 items-center justify-center ${canSubmit ? 'bg-emerald-500' : 'bg-neutral-200'}`}
        >
          <Text className={`font-semibold ${canSubmit ? 'text-white' : 'text-neutral-500'}`}>
            {isSubmitting ? 'Enviando...' : existingReview ? 'Avaliação enviada' : 'Enviar avaliação'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
