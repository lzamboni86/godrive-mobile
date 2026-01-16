import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    bgColor: 'bg-success-500',
    Icon: CheckCircle,
  },
  error: {
    bgColor: 'bg-danger-500',
    Icon: XCircle,
  },
  warning: {
    bgColor: 'bg-warning-500',
    Icon: AlertCircle,
  },
  info: {
    bgColor: 'bg-primary-500',
    Icon: Info,
  },
};

export function Toast({ message, type, visible, onHide }: ToastProps) {
  // Toast desabilitado - não renderiza nada para evitar erros
  return null;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
    showSuccess: (message: string) => showToast(message, 'success'),
    showError: (message: string) => showToast(message, 'error'),
    showWarning: (message: string) => showToast(message, 'warning'),
    showInfo: (message: string) => showToast(message, 'info'),
  };
}

