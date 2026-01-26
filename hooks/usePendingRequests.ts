import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import Constants from 'expo-constants';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { connectRealtime } from '@/services/realtime';

// Verificar se está rodando no Expo Go
const isExpoGo = (Constants as any).executionEnvironment === 'storeClient' || Constants.appOwnership === 'expo';

export function usePendingRequests() {
  const { user, token } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = async () => {
    if (!user?.id) return;
    
    try {
      // Buscar apenas solicitações pendentes
      const response = await api.get(`/instructor/${user?.id}/requests`);
      
      const requests = Array.isArray(response) ? response : [];
      
      // Contar apenas solicitações aguardando aprovação
      const pendingRequests = requests.filter(req => 
        req.status === 'REQUESTED' || req.status === 'WAITING_APPROVAL'
      );
      
      const count = pendingRequests.length;
      setPendingCount(count);
      
    } catch (error) {
      console.error('Erro ao buscar contagem de solicitações:', error);
      setPendingCount(0);
    }
  };

  useEffect(() => {
    fetchPendingCount();

    return () => undefined;
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !token) return;

    const socket = connectRealtime(token);
    const refresh = () => fetchPendingCount();

    socket.on('lesson_request_created', refresh);
    socket.on('lesson_request_updated', refresh);

    // Só adicionar listeners de notificação se NÃO estiver no Expo Go
    let receivedSub: any = null;
    let responseSub: any = null;

    let cancelled = false;
    const setupNotifications = async () => {
      if (isExpoGo) return;
      try {
        const Notifications = await import('expo-notifications');
        if (cancelled) return;

        receivedSub = Notifications.addNotificationReceivedListener(() => {
          refresh();
        });

        responseSub = Notifications.addNotificationResponseReceivedListener(() => {
          refresh();
        });
      } catch (e) {
        console.warn('Notificações não disponíveis:', e);
      }
    };

    setupNotifications();

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
      }
    });

    return () => {
      cancelled = true;
      socket.off('lesson_request_created', refresh);
      socket.off('lesson_request_updated', refresh);
      if (receivedSub) receivedSub.remove();
      if (responseSub) responseSub.remove();
      appStateSub.remove();
    };
  }, [user?.id, token]);

  return pendingCount;
}
