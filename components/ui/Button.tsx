import React from 'react';
import { Text, Pressable, ActivityIndicator, ViewStyle } from 'react-native';

interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  style?: ViewStyle;
}

export function Button({
  title,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  className = '',
  style,
}: ButtonProps) {
  const baseStyles = 'flex-row items-center justify-center rounded-xl';

  const variantStyles = {
    primary: 'bg-brand-primary active:bg-primary-700',
    secondary: 'bg-neutral-200 active:bg-neutral-300',
    success: 'bg-success-500 active:bg-success-600',
    danger: 'bg-danger-500 active:bg-danger-600',
    outline: 'border-2 border-brand-primary bg-transparent active:bg-primary-50',
    ghost: 'bg-transparent',
  };

  const textVariantStyles = {
    primary: 'text-white',
    secondary: 'text-neutral-800',
    success: 'text-white',
    danger: 'text-white',
    outline: 'text-brand-primary',
    ghost: 'text-brand-primary',
  };

  const sizeStyles = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledStyles = disabled || loading ? 'opacity-50' : '';
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyle} ${className}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' || variant === 'ghost' ? '#1E3A8A' : '#FFFFFF'}
        />
      ) : children ? (
        children
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            className={`font-semibold ${textVariantStyles[variant]} ${textSizeStyles[size]} ${icon ? 'ml-2' : ''}`}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
