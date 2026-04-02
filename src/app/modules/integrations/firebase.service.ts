import admin from "firebase-admin";

let initialized = false;

export const initFirebase = () => {
  if (initialized || !process.env.FIREBASE_PROJECT_ID) return;

  // console.log("PRIVATE KEY:", process.env.FIREBASE_PRIVATE_KEY);

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });

  initialized = true;
  console.log("[Firebase] Initialized");
};

export const sendPushNotification = async (token: string, title: string, body: string, data?: Record<string, string>): Promise<boolean> => {
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data: data ?? {},
      webpush: {
        notification: { icon: "/icons/icon-192x192.png" },
      },
    });
    return true;
  } catch (err: any) {
    // Token không hợp lệ → xóa khỏi DB
    if (err.code === "messaging/invalid-registration-token" || err.code === "messaging/registration-token-not-registered") {
      return false; // caller sẽ xóa token
    }
    console.error("[FCM] Error:", err.message);
    return false;
  }
};

export const sendMulticastNotification = async (tokens: string[], title: string, body: string, data?: Record<string, string>) => {
  if (tokens.length === 0) return { successCount: 0, failureCount: 0 };

  const response = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: data ?? {},
  });

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    responses: response.responses,
  };
};
