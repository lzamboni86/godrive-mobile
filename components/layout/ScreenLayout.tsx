import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  topPadding?: number;
  bottomPadding?: number;
  horizontalPadding?: number;
}

export function ScreenLayout({
  children,
  backgroundColor = 'bg-white',
  edges = ['top', 'bottom'],
  topPadding = 0,
  bottomPadding = 0,
  horizontalPadding = 0,
}: ScreenLayoutProps) {
  return (
    <SafeAreaView className={`flex-1 ${backgroundColor}`} edges={edges}>
      <View 
        className={`flex-1 ${horizontalPadding > 0 ? `px-${horizontalPadding}` : ''}`}
        style={{
          paddingTop: topPadding > 0 ? topPadding : undefined,
          paddingBottom: bottomPadding > 0 ? bottomPadding : undefined,
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

interface HeaderLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export function HeaderLayout({
  children,
  title,
  subtitle,
  backgroundColor = 'bg-white',
  showBackButton = false,
  onBackPress,
  rightComponent,
}: HeaderLayoutProps) {
  return (
    <View className={`${backgroundColor} px-6 pt-8 pb-4 border-b border-neutral-200`}>
      {title && (
        <View className="mb-4">
          <Text className="text-2xl font-bold text-neutral-900">{title}</Text>
          {subtitle && (
            <Text className="text-neutral-500 text-sm mt-1">{subtitle}</Text>
          )}
        </View>
      )}
      
      {(showBackButton || rightComponent) && (
        <View className="flex-row items-center justify-between">
          {showBackButton && (
            <View className="w-6">
              {/* Back button will be handled by parent */}
            </View>
          )}
          {rightComponent && <View>{rightComponent}</View>}
        </View>
      )}
      
      {children}
    </View>
  );
}
