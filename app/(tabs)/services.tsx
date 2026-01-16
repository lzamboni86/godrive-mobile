import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ShoppingBag, Tag, Gift, Percent, Star } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ServicesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Hub de Serviços</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Banner de Lançamento em Breve - DESTAQUE */}
          <View className="bg-amber-100 border-2 border-amber-400 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center justify-center">
              <Text className="text-amber-800 text-lg font-bold text-center">
                🚀 Funcionalidade será lançada
              </Text>
            </View>
            <Text className="text-amber-700 text-sm text-center mt-2">
              Esta funcionalidade está em desenvolvimento e será liberada em breve!
            </Text>
          </View>

          <Text className="text-neutral-600 mb-6">
            Aproveite descontos exclusivos e parcerias para nossa comunidade de instrutores
          </Text>

          {/* Banner Principal */}
          <View className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 mb-6 opacity-50">
            <View className="flex-row items-center mb-3">
              <Gift size={24} color="#FFFFFF" />
              <Text className="text-white text-lg font-semibold ml-2">Ofertas Exclusivas</Text>
            </View>
            <Text className="text-white text-sm">
              Descontos especiais para instrutores Go Drive em parceiros selecionados
            </Text>
          </View>

          {/* Categorias - Desabilitadas */}
          <View className="mb-6 opacity-50">
            <Text className="text-neutral-900 font-semibold mb-3">Categorias</Text>
            <View className="flex-row flex-wrap gap-2">
              <View className="px-4 py-2 bg-neutral-300 rounded-full">
                <Text className="text-neutral-500 text-sm font-medium">Todos</Text>
              </View>
              <View className="px-4 py-2 bg-neutral-200 rounded-full">
                <Text className="text-neutral-500 text-sm font-medium">Material</Text>
              </View>
              <View className="px-4 py-2 bg-neutral-200 rounded-full">
                <Text className="text-neutral-500 text-sm font-medium">Serviços</Text>
              </View>
              <View className="px-4 py-2 bg-neutral-200 rounded-full">
                <Text className="text-neutral-500 text-sm font-medium">Equipamentos</Text>
              </View>
            </View>
          </View>

          {/* Lista de Parceiros - Desabilitado */}
          <View className="space-y-4">
            <View className="bg-white border border-neutral-200 rounded-2xl p-4 opacity-75">
              <View className="flex-row">
                <View className="w-16 h-16 bg-orange-100 rounded-xl items-center justify-center mr-4">
                  <Tag size={24} color="#F97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-900 font-semibold">20% OFF em Material Didático</Text>
                  <Text className="text-neutral-600 text-sm mb-2">Livraria Central - livros e apostilas</Text>
                  <View className="flex-row items-center">
                    <Percent size={16} color="#F97316" />
                    <Text className="text-orange-600 font-medium ml-1">Economize R$ 40</Text>
                  </View>
                </View>
              </View>
              <View className="mt-4 pt-4 border-t border-neutral-100">
                <Text className="text-orange-600 text-sm font-medium">Código: GOINST20</Text>
              </View>
              {/* Aviso de desabilitado */}
              <View className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2">
                <Text className="text-amber-800 text-xs font-medium text-center">
                  🚀 Funcionalidade será lançada
                </Text>
              </View>
            </View>

            <View className="bg-white border border-neutral-200 rounded-2xl p-4 opacity-75">
              <View className="flex-row">
                <View className="w-16 h-16 bg-blue-100 rounded-xl items-center justify-center mr-4">
                  <ShoppingBag size={24} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-900 font-semibold">15% OFF em Auto Peças</Text>
                  <Text className="text-neutral-600 text-sm mb-2">Auto Center - peças e acessórios</Text>
                  <View className="flex-row items-center">
                    <Percent size={16} color="#3B82F6" />
                    <Text className="text-blue-600 font-medium ml-1">Válido até 31/01</Text>
                  </View>
                </View>
              </View>
              <View className="mt-4 pt-4 border-t border-neutral-100">
                <Text className="text-blue-600 text-sm font-medium">Código: GOAUTO15</Text>
              </View>
              {/* Aviso de desabilitado */}
              <View className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2">
                <Text className="text-amber-800 text-xs font-medium text-center">
                  🚀 Funcionalidade será lançada
                </Text>
              </View>
            </View>

            <View className="bg-white border border-neutral-200 rounded-2xl p-4 opacity-75">
              <View className="flex-row">
                <View className="w-16 h-16 bg-purple-100 rounded-xl items-center justify-center mr-4">
                  <Star size={24} color="#9333EA" />
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-900 font-semibold">Seguro Auto Profissional</Text>
                  <Text className="text-neutral-600 text-sm mb-2">Seguros Brasil - cobertura completa</Text>
                  <View className="flex-row items-center">
                    <Percent size={16} color="#9333EA" />
                    <Text className="text-purple-600 font-medium ml-1">Economize 25%</Text>
                  </View>
                </View>
              </View>
              <View className="mt-4 pt-4 border-t border-neutral-100">
                <Text className="text-purple-600 text-sm font-medium">Válido para instrutores</Text>
              </View>
              {/* Aviso de desabilitado */}
              <View className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2">
                <Text className="text-amber-800 text-xs font-medium text-center">
                  🚀 Funcionalidade será lançada
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
