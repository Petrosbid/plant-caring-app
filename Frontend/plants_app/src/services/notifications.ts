import * as Device from "expo-device";
import Constants from "expo-constants";
import * as Localization from "expo-localization";
import { Platform } from "react-native";
import type { User } from "../types";
import { authService } from "./api";

type NotificationsModule = typeof import("expo-notifications");

let notificationsModulePromise: Promise<NotificationsModule | null> | null =
  null;
let notificationHandlerConfigured = false;
let expoGoWarningShown = false;

function isExpoGo() {
  return Constants.executionEnvironment === "storeClient";
}

function warnExpoGoUnsupported() {
  if (expoGoWarningShown) {
    return;
  }

  expoGoWarningShown = true;
  console.warn(
    "[Notifications] Push token registration is disabled in Expo Go. Use a development build for remote push notifications.",
  );
}

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (Platform.OS === "web") {
    return null;
  }

  if (isExpoGo()) {
    warnExpoGoUnsupported();
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import("expo-notifications").then(
      (module) => module,
      (error) => {
        notificationsModulePromise = null;
        throw error;
      },
    );
  }

  return notificationsModulePromise;
}

async function configureNotificationHandler() {
  if (notificationHandlerConfigured) {
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  notificationHandlerConfigured = true;
}

export async function registerPushNotifications(
  user: User,
  setUser: (user: User) => void,
) {
  if (!Device.isDevice) {
    console.log("Must use physical device for Push Notifications");
    return;
  }

  try {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return;
    }

    await configureNotificationHandler();

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;
    const timezone = Localization.getCalendars()[0]?.timeZone || "Asia/Tehran";

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#22c55e",
      });
    }

    if (user.push_token !== token || user.timezone !== timezone) {
      console.log(
        "Updating push token and timezone in backend:",
        token,
        timezone,
      );
      const updatedUser = await authService.updateProfile({
        push_token: token,
        timezone,
      });
      setUser(updatedUser);
    }
  } catch (error) {
    console.error("Error registering push notifications:", error);
  }
}
