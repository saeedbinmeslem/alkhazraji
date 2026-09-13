class PushTokenManager {
    static async registerToken(userId, fcmToken, tokenType = 'web') {
        console.log(`[PushTokenManager] Mock registering token for user ${userId}`);
    }
    static async removeToken(userId, fcmToken) {
        console.log(`[PushTokenManager] Mock removing token for user ${userId}`);
    }
}
export default PushTokenManager;
