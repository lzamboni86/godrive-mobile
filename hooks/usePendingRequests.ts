import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export function usePendingRequests() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = async () => {
    try {
      console.log('🔔 Buscando contagem para User ID:', user?.id);
      
      // Buscar apenas solicitações pendentes
      const response = await api.get(`/instructor/${user?.id}/requests`);
      console.log('🔔 Resposta requests:', response);
      
      const requests = Array.isArray(response) ? response : [];
      console.log('🔔 Total requests:', requests.length);
      
      // Contar apenas solicitações aguardando aprovação (excluir recusadas)
      const pendingRequests = requests.filter(req => 
        req.status === 'REQUESTED' || req.status === 'WAITING_APPROVAL'
      );
      
      // Verificar se há aulas recusadas no total
      const rejectedRequests = requests.filter(req => 
        req.status === 'REJECTED' || req.status === 'CANCELLED'
      );
      
      console.log('🔔 Pending requests:', pendingRequests.map(r => ({ id: r.id, status: r.status })));
      console.log('🔔 Rejected requests:', rejectedRequests.map(r => ({ id: r.id, status: r.status })));
      console.log('🔔 Total requests breakdown:', {
        REQUESTED: requests.filter(r => r.status === 'REQUESTED').length,
        WAITING_APPROVAL: requests.filter(r => r.status === 'WAITING_APPROVAL').length,
        REJECTED: requests.filter(r => r.status === 'REJECTED').length,
        CANCELLED: requests.filter(r => r.status === 'CANCELLED').length,
        CONFIRMED: requests.filter(r => r.status === 'CONFIRMED').length
      });
      
      const count = pendingRequests.length;
      console.log('🔔 Final count:', count);
      
      // Forçar atualização se count mudou
      setPendingCount(count);
      
      // Debug extra
      console.log('🔔 Badge deve mostrar:', count);
      
    } catch (error) {
      console.error('Erro ao buscar contagem de solicitações:', error);
      setPendingCount(0);
    }
  };

  useEffect(() => {
    fetchPendingCount();
    
    // Atualizar frequentemente para refletir aprovações mais rápido
    const interval = setInterval(fetchPendingCount, 5000); // 5 segundos
    
    return () => {
      clearInterval(interval);
    };
  }, [user?.id]);

  return pendingCount;
}
