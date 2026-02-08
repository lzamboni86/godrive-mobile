import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import { Platform } from 'react-native';

export function useWebTitle() {
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS === 'web') {
      const updateTitle = () => {
        if (typeof window !== 'undefined') {
          // Título baseado na rota atual
          if (pathname.startsWith('/(admin)')) {
            document.title = 'Go Drive Admin';
          } else if (pathname.startsWith('/(tabs)')) {
            document.title = 'Go Drive Instrutor';
          } else if (pathname.startsWith('/(student)')) {
            document.title = 'Go Drive Aluno';
          } else if (pathname.startsWith('/(auth)')) {
            document.title = 'Go Drive - Login';
          } else {
            document.title = 'Go Drive';
          }
        }
      };

      updateTitle();
      
      // Atualizar quando a rota mudar
      const observer = new MutationObserver(updateTitle);
      
      if (typeof window !== 'undefined' && document.querySelector('title')) {
        observer.observe(document.querySelector('title')!, { childList: true });
      }

      return () => observer.disconnect();
    }
  }, [pathname]);
}
