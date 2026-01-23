import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Phone, Save, Camera } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { studentService } from '@/services/student';
import { uploadService } from '@/services/upload';

export default function StudentEditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handlePickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para alterar a foto de perfil. Você pode liberar isso nas configurações do aparelho.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir Configurações', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu nome completo.');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu e-mail.');
      return;
    }

    try {
      setIsLoading(true);
      let avatarUrl: string | undefined = undefined;

      // Se há uma nova imagem selecionada (diferente da atual), faz upload
      if (profileImage && profileImage !== user?.avatar) {
        try {
          setIsUploadingImage(true);
          const upload = await uploadService.uploadImage(profileImage);
          avatarUrl = upload.url;
        } catch (uploadError: any) {
          console.error('Erro no upload da imagem:', uploadError);
          Alert.alert('Aviso', 'Não foi possível enviar a foto para o servidor. A foto será salva apenas neste dispositivo.');
          // Continua com a URI local como fallback
          avatarUrl = profileImage;
        } finally {
          setIsUploadingImage(false);
        }
      } else if (profileImage === user?.avatar) {
        // Se a imagem é a mesma que já estava, mantém a URL atual
        avatarUrl = profileImage;
      }

      await studentService.updateProfile(formData);
      updateUser({ ...user, ...formData, ...(avatarUrl ? { avatar: avatarUrl } : {}) });
      
      Alert.alert(
        'Sucesso!',
        'Seu perfil foi atualizado com sucesso.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      
      // Show more detailed error message
      const errorMessage = error?.response?.data?.message || error?.message || 'Não foi possível atualizar seu perfil. Tente novamente.';
      
      Alert.alert(
        'Erro',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Editar Perfil</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Foto de Perfil */}
          <View className="items-center mb-8">
            <TouchableOpacity onPress={handlePickImage} className="relative">
              {profileImage ? (
                <Image source={{ uri: profileImage }} className="w-24 h-24 rounded-full" />
              ) : (
                <View className="w-24 h-24 bg-emerald-500 rounded-full items-center justify-center">
                  <User size={48} color="#FFFFFF" />
                </View>
              )}
              <View className="absolute bottom-0 right-0 bg-emerald-600 rounded-full p-2 border-2 border-white">
                {isUploadingImage ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Camera size={16} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickImage} className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 mt-4">
              <Text className="text-emerald-700 font-medium text-sm">Alterar Foto</Text>
            </TouchableOpacity>
          </View>

          {/* Formulário */}
          <View className="space-y-6">
            {/* Nome */}
            <View>
              <Text className="text-sm font-medium text-neutral-700 mb-2">Nome Completo *</Text>
              <TextInput
                className="bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Seu nome completo"
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-neutral-700 mb-2">E-mail *</Text>
              <TextInput
                className="bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Telefone */}
            <View>
              <Text className="text-sm font-medium text-neutral-700 mb-2">Telefone</Text>
              <TextInput
                className="bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="(11) 99999-9999"
                keyboardType="phone-pad"
              />
            </View>

            {/* Informações Adicionais */}
            <View className="bg-neutral-50 rounded-xl p-4">
              <Text className="text-sm font-medium text-neutral-700 mb-2">Tipo de Conta</Text>
              <Text className="text-neutral-900">Aluno</Text>
              
              <Text className="text-sm font-medium text-neutral-700 mb-2 mt-4">Status</Text>
              <Text className="text-emerald-600">Ativo</Text>
              
              <Text className="text-sm font-medium text-neutral-700 mb-2 mt-4">Membro desde</Text>
              <Text className="text-neutral-900">Dezembro/2025</Text>
            </View>
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            className="bg-emerald-500 rounded-xl p-4 flex-row items-center justify-center mt-8 mb-4"
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Save size={20} color="#FFFFFF" />
            )}
            <Text className="text-white font-semibold ml-2">
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
