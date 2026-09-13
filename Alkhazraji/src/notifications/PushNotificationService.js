import { Capacitor } from '@capacitor/core';
import * as PushTokenManager from './PushTokenManager';

export async function initialize(userId) {
  console.log('[PushNotificationService] Mock initializing push for user', userId);
}

export async function handleLogout() {
  console.log('[PushNotificationService] Mock logout');
}
