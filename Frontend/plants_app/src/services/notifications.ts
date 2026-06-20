import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Localization from 'expo-localization';
import { authService } from './api';

// Configure foreground notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerPushNotifications(user: any, setUser: (user: any) => void) {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    // Determine device timezone
    const timezone = Localization.getCalendars()[0]?.timeZone || 'Asia/Tehran';

    // Android channel settings
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#22c55e', // green color matching our brand
      });
    }

    // Sync token and timezone with backend if they have changed or are empty
    if (user && (user.push_token !== token || user.timezone !== timezone)) {
      console.log('Updating push token and timezone in backend:', token, timezone);
      const updatedUser = await authService.updateProfile({
        push_token: token,
        timezone: timezone,
      });
      setUser(updatedUser);
    }
  } catch (error) {
    console.error('Error registering push notifications:', error);
  }
}
