import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

export function Card({ children, className = '', onPress }: CardProps) {
  const baseStyles = 'bg-white rounded-2xl p-4 shadow-sm';

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${baseStyles} ${className} active:opacity-90`}
      >
        {children}
      </Pressable>
    );
  }

  return <View className={`${baseStyles} ${className}`}>{children}</View>;
}

interface BalanceCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'neutral';
}

export function BalanceCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'primary',
}: BalanceCardProps) {
  const variantStyles = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    neutral: 'bg-neutral-700',
  };

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  return (
    <View className={`${variantStyles[variant]} rounded-2xl p-5 shadow-lg`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white/80 text-sm font-medium">{title}</Text>
        {icon}
      </View>
      <Text className="text-white text-3xl font-bold">{formattedValue}</Text>
      {subtitle && (
        <Text className="text-white/70 text-xs mt-1">{subtitle}</Text>
      )}
    </View>
  );
}
