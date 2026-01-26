import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Phone, Save, Camera } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { instructorService } from '@/services/instructor';
import { uploadInstructorService } from '@/services/upload-instructor';

export default function InstructorEditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
    pixKey: '',
    hourlyRate: '80'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Carregar dados do instrutor ao montar
  React.useEffect(() => {
    loadInstructorData();
  }, [user?.id]);

  const loadInstructorData = async () => {
    if (!user?.id) return;
    
    try {
      const response = await instructorService.getProfile(user.id) as { instructor: { bio?: string; pixKey?: string; hourlyRate?: number } };
      const instructor = response.instructor;
      
      if (instructor) {
        setFormData(prev => ({
          ...prev,
          bio: instructor.bio || '',
          pixKey: instructor.pixKey || '',
          hourlyRate: instructor.hourlyRate?.toString() || '80'
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do instrutor:', error);
    }
  };

  const handlePickImage = async () => {
    // Request permission for iOS
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para alterar a foto de perfil. Você pode liberar isso nas configurações do aparelho.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir Configurações', onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    try {
      console.log('🖼️ [EDIT-PROFILE] Iniciando seleção de imagem...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: false, // Garante que usamos URI em vez de base64
      });

      console.log('🖼️ [EDIT-PROFILE] Resultado do ImagePicker:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        console.log('🖼️ [EDIT-PROFILE] Imagem selecionada:', selectedAsset.uri);
        
        // Validação adicional para iOS
        if (selectedAsset.uri && (selectedAsset.uri.startsWith('file://') || selectedAsset.uri.startsWith('ph://') || selectedAsset.uri.startsWith('assets-library://'))) {
          setProfileImage(selectedAsset.uri);
          console.log('✅ [EDIT-PROFILE] Imagem definida com sucesso');
        } else {
          console.error('❌ [EDIT-PROFILE] URI inválida:', selectedAsset.uri);
          Alert.alert('Erro', 'Formato de imagem não suportado. Tente outra imagem.');
        }
      } else {
        console.log('🖼️ [EDIT-PROFILE] Seleção cancelada pelo usuário');
      }
    } catch (error) {
      console.error('❌ [EDIT-PROFILE] Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem. Tente novamente.');
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
          const upload = await uploadInstructorService.uploadImage(profileImage);
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

      await instructorService.updateProfile({
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate)
      });
      updateUser({
        ...(formData.name ? { name: formData.name } : {}),
        ...(formData.email ? { email: formData.email } : {}),
        ...(typeof formData.phone === 'string' ? { phone: formData.phone } : {}),
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      });
      
      Alert.alert(
        'Sucesso!',
        'Seu perfil foi atualizado com sucesso.',
        [{ text: 'OK' }]
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
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900">Editar Perfil</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
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
            <Text className="text-gray-700 font-medium mb-2">Nome Completo</Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
              placeholder="Seu nome completo"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Email */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">E-mail</Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
              placeholder="seu@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Telefone */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Telefone (Opcional)</Text>
            <TextInput
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
              placeholder="(00) 00000-0000"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>

          {/* Bio */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Bio (Sobre Mim)</Text>
            <TextInput
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 min-h-[100px]"
              placeholder="Fale um pouco sobre você, sua experiência como instrutor..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Chave PIX */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Chave PIX</Text>
            <TextInput
              value={formData.pixKey}
              onChangeText={(text) => setFormData(prev => ({ ...prev, pixKey: text }))}
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
              placeholder="email@exemplo.com, CPF ou telefone"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Valor da Aula */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Valor da Aula (R$)</Text>
            <TextInput
              value={formData.hourlyRate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, hourlyRate: text }))}
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
              placeholder="80.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          className={`mt-8 mb-8 rounded-xl py-4 flex-row items-center justify-center ${
            isLoading ? 'bg-gray-400' : 'bg-emerald-600'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Save size={20} color="#FFFFFF" className="mr-2" />
              <Text className="text-white font-semibold text-lg">Salvar Alterações</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
