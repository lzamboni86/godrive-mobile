import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export function Loading({
  size = 'large',
  color = '#0A84FF',
  message,
  fullScreen = false,
}: LoadingProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size={size} color={color} />
        {message && (
          <Text className="text-neutral-600 mt-4 text-base">{message}</Text>
        )}
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-8">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-neutral-600 mt-3 text-sm">{message}</Text>
      )}
    </View>
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
      <View className="bg-white rounded-2xl p-6 items-center mx-8">
        <ActivityIndicator size="large" color="#0A84FF" />
        {message && (
          <Text className="text-neutral-700 mt-4 text-base text-center">
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}
