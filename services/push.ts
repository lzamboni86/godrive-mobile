import Constants from 'expo-constants';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Skip on Expo Go or unsupported environments
  if ((Constants as any).executionEnvironment === 'storeClient' || Constants.appOwnership === 'expo') {
    return null;
  }

  try {
    const Notifications = await import('expo-notifications');

    // Android requires notification channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const projectId = (Constants.expoConfig?.extra as any)?.eas?.projectId;
    const tokenResponse = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return tokenResponse.data;
  } catch (error) {
    // Silently fail - push notifications are optional
    console.log('Push notification registration skipped:', error);
    return null;
  }
}
