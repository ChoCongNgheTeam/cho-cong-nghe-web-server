export type NotificationType =
  | "WELCOME_VOUCHER"
  | "VOUCHER_EXPIRING"
  | "VOUCHER_ASSIGNED"
  | "CAMPAIGN_PROMOTION"
  | "ORDER_STATUS"
  | "USER_INACTIVE"
  | "COMMENT_NEW" // Khách hàng bình luận mới
  | "REVIEW_NEW"; // Khách hàng đánh giá mới

export type NotificationChannel = "IN_APP" | "EMAIL" | "PUSH";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

/** Các type thông báo dành riêng cho admin/staff */
export const ADMIN_NOTIFICATION_TYPES: NotificationType[] = ["ORDER_STATUS", "COMMENT_NEW", "REVIEW_NEW"];

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
