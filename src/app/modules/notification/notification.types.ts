export type NotificationType = "WELCOME_VOUCHER" | "VOUCHER_EXPIRING" | "VOUCHER_ASSIGNED" | "CAMPAIGN_PROMOTION" | "ORDER_STATUS" | "USER_INACTIVE";

export type NotificationChannel = "IN_APP" | "EMAIL" | "PUSH";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  channel: NotificationChannel;
  status: NotificationStatus;
}

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}
