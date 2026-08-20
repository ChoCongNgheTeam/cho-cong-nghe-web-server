import { Resend } from "resend";

/**
 * Trước đây dùng nodemailer + SMTP Gmail (port 587).
 * Trên Render free tier, outbound port SMTP hay bị timeout/không ổn định
 * -> đổi sang gửi qua HTTPS API (Resend), port 443, không bao giờ bị chặn.
 *
 * Cần set biến môi trường:
 *   RESEND_API_KEY=re_xxxxxxxx
 *   SMTP_FROM="Cho Cong Nghe <no-reply@yourdomain.com>"   (domain đã verify trên Resend)
 *   FRONTEND_URL=https://your-frontend.vercel.app
 *
 * Tất cả các hàm export bên dưới giữ NGUYÊN tên và tham số như cũ,
 * nên auth.service.ts và các nơi khác KHÔNG cần sửa gì thêm.
 */

// Lazy-init: trước đây `new Resend(...)` chạy ngay lúc module được import
// (top-level), nên nếu thiếu RESEND_API_KEY, việc import module này — và do
// đó TOÀN BỘ APP (auth.service.ts import email.service.ts ở top-level) —
// crash ngay lúc khởi động, kể cả khi request không hề gửi email. Giờ chỉ
// khởi tạo client khi thực sự cần gửi mail, và báo lỗi rõ ràng lúc đó.
let resend: Resend | null = null;
function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY chưa được cấu hình — không thể gửi email.");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Helper dùng chung cho mọi email, có log lỗi rõ ràng để dễ debug trên Render
const sendMail = async (opts: { to: string; subject: string; html: string }) => {
  const { data, error } = await getResendClient().emails.send({
    from: process.env.SMTP_FROM || "Cho Cong Nghe <onboarding@resend.dev>",
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) {
    console.error("[Resend] Failed to send email:", error);
    throw new Error(`Resend send failed: ${error.message ?? JSON.stringify(error)}`);
  }

  return data;
};

export const sendResetPasswordEmail = async (email: string, resetLink: string) => {
  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

              <tr>
                <td style="background: linear-gradient(135deg, #2e3841 0%, #1a2027 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                    🔒 Đặt lại mật khẩu
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                    Xin chào,
                  </p>

                  <p style="margin: 0 0 25px; color: #555555; font-size: 15px; line-height: 1.6;">
                    Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                    Nhấn vào nút bên dưới để tạo mật khẩu mới:
                  </p>

                  <table role="presentation" style="margin: 30px 0;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="${resetLink}"
                           style="display: inline-block;
                                  padding: 16px 40px;
                                  background: linear-gradient(135deg, #2e3841 0%, #1a2027 100%);
                                  color: #ffffff;
                                  text-decoration: none;
                                  border-radius: 8px;
                                  font-weight: 600;
                                  font-size: 16px;
                                  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                          Đặt lại mật khẩu ngay
                        </a>
                      </td>
                    </tr>
                  </table>

                  <div style="background-color: #fff3cd;
                              border-left: 4px solid #ffc107;
                              padding: 15px 20px;
                              border-radius: 6px;
                              margin: 25px 0;">
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                      ⏰ <strong>Lưu ý:</strong> Link này sẽ hết hạn sau <strong>1 giờ</strong> kể từ khi nhận email.
                    </p>
                  </div>

                  <p style="margin: 25px 0 10px; color: #666666; font-size: 14px; line-height: 1.6;">
                    Nếu nút không hoạt động, vui lòng sao chép và dán link sau vào trình duyệt:
                  </p>

                  <div style="background-color: #f8f9fa;
                              padding: 12px 15px;
                              border-radius: 6px;
                              border: 1px solid #e9ecef;
                              word-break: break-all;">
                    <a href="${resetLink}" style="color: #667eea; text-decoration: none; font-size: 13px;">
                      ${resetLink}
                    </a>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding: 0 30px 30px;">
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px; color: #333333; font-size: 14px; font-weight: 600;">
                      🛡️ Bảo mật tài khoản
                    </p>
                    <p style="margin: 0; color: #666666; font-size: 13px; line-height: 1.5;">
                      Nếu bạn <strong>không yêu cầu</strong> đặt lại mật khẩu, vui lòng bỏ qua email này.
                      Tài khoản của bạn vẫn an toàn và không có thay đổi nào được thực hiện.
                    </p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px; color: #999999; font-size: 13px;">
                    Cần hỗ trợ? Liên hệ với chúng tôi qua email hoặc hotline
                  </p>
                  <p style="margin: 0; color: #bbbbbb; font-size: 12px;">
                    © ${new Date().getFullYear()} Your Company. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendMail({ to: email, subject: "🔐 Yêu cầu đặt lại mật khẩu", html });
};

export const sendVerificationEmail = async (email: string, verifyLink: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color: #333;">Xác nhận email</h2>
      <p>Cảm ơn bạn đã đăng ký! Vui lòng nhấp vào nút bên dưới để xác nhận địa chỉ email và kích hoạt tài khoản.</p>
      <a
        href="${verifyLink}"
        style="
          display: inline-block;
          margin-top: 16px;
          padding: 12px 24px;
          background-color: #4f46e5;
          color: #fff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        "
      >
        Xác nhận email
      </a>
      <p style="margin-top: 24px; color: #666; font-size: 13px;">
        Link có hiệu lực trong <strong>24 giờ</strong>. Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email này.
      </p>
      <p style="color: #999; font-size: 12px;">Hoặc copy link sau vào trình duyệt:<br />${verifyLink}</p>
    </div>
  `;

  await sendMail({ to: email, subject: "Xác nhận tài khoản của bạn", html });
};

export const sendNotificationEmail = async (email: string, title: string, body: string, data?: Record<string, any>) => {
  const brandColor = "#3B82F6";

  const typeConfig: Record<string, string> = {
    WELCOME_VOUCHER: "🎉",
    VOUCHER_EXPIRING: "⏰",
    VOUCHER_ASSIGNED: "🎁",
    CAMPAIGN_PROMOTION: "🔥",
    USER_INACTIVE: "👋",
    ORDER_STATUS: "📦",
  };

  const icon = typeConfig[data?.type as string] ?? "🔔";

  const voucherBlock = data?.voucherCode
    ? `
      <div style="background-color: #F9FAFB; border: 1px dashed #D1D5DB; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <p style="margin: 0 0 8px; color: #6B7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
          Mã voucher của bạn
        </p>
        <p style="margin: 0 0 8px; color: ${brandColor}; font-size: 24px; font-weight: 700; letter-spacing: 2px;">
          ${data.voucherCode}
        </p>
        ${
          data.discountValue
            ? `<p style="margin: 0; color: #4B5563; font-size: 14px;">
               Giảm <strong>${Number(data.discountValue).toLocaleString("vi-VN")}đ</strong>
             </p>`
            : ""
        }
      </div>`
    : "";

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F3F4F6;">
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:40px 20px;">
            <table role="presentation" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">

              <tr>
                <td style="padding:30px 30px 20px;text-align:center;border-bottom:1px solid #F3F4F6;">
                  <h1 style="margin:0;color:${brandColor};font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                    ChoCongNghe
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding:30px;">
                  <div style="font-size:32px;margin-bottom:16px;text-align:center;">${icon}</div>
                  <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;text-align:center;line-height:1.4;">
                    ${title}
                  </h2>

                  <p style="margin:0 0 20px;color:#4B5563;font-size:15px;line-height:1.6;text-align:center;">
                    ${body}
                  </p>

                  ${voucherBlock}

                  <div style="text-align:center;margin-top:30px;">
                    <a href="${process.env.FRONTEND_URL}"
                       style="display:inline-block;padding:12px 32px;background-color:${brandColor};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">
                      Truy cập cửa hàng
                    </a>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="background:#F9FAFB;padding:24px 30px;text-align:center;border-top:1px solid #E5E7EB;">
                  <p style="margin:0 0 6px;color:#6B7280;font-size:13px;">
                    Đây là email tự động, vui lòng không trả lời.
                  </p>
                  <p style="margin:0;color:#9CA3AF;font-size:12px;">
                    © ${new Date().getFullYear()} Chợ Công Nghệ. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendMail({ to: email, subject: `${icon} ${title}`, html });
};

export const sendOrderConfirmationEmail = async (
  email: string,
  customerName: string,
  orderCode: string,
  orderDetails: {
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    shippingAddress: string;
    paymentMethod: string;
  },
  paymentInfo?: {
    paymentMethodCode: string;
    paymentLink?: string;
  },
) => {
  const brandColor = "#3B82F6";

  const emailPattern = /([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}),?\s*/;
  const cleanShippingAddress = orderDetails.shippingAddress.replace(emailPattern, "").trim();

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color: #F3F4F6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden;">

              <tr>
                <td style="padding: 30px 30px 20px; text-align: center; border-bottom: 1px solid #F3F4F6;">
                  <h1 style="margin: 0; color: ${brandColor}; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                    ChoCongNghe
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 30px;">
                  <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px; font-weight: 600; text-align: center;">
                    Đặt hàng thành công
                  </h2>

                  <p style="margin: 0 0 24px; color: #4B5563; font-size: 15px; line-height: 1.6; text-align: center;">
                    Xin chào <strong>${customerName}</strong>, cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang được xử lý.
                  </p>

                  <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                    <p style="margin: 0 0 4px; color: #6B7280; font-size: 13px; text-transform: uppercase;">
                      Mã đơn hàng
                    </p>
                    <p style="margin: 0; color: #111827; font-size: 20px; font-weight: 700;">
                      #${orderCode}
                    </p>
                  </div>

                  <h3 style="margin: 0 0 12px; color: #111827; font-size: 16px; font-weight: 600; border-bottom: 2px solid #F3F4F6; padding-bottom: 8px;">
                    Chi tiết sản phẩm
                  </h3>

                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #F3F4F6;">
                        <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 500;">${orderDetails.productName}</p>
                        <p style="margin: 4px 0 0; color: #6B7280; font-size: 13px;">Phân loại: ${orderDetails.variantName}</p>
                        <p style="margin: 4px 0 0; color: #6B7280; font-size: 13px;">Số lượng: ${orderDetails.quantity}</p>
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #F3F4F6; text-align: right; vertical-align: top;">
                        <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 500;">
                          ${(orderDetails.unitPrice * orderDetails.quantity).toLocaleString("vi-VN")}đ
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 16px 0 0; color: #111827; font-size: 16px; font-weight: 600;">Tổng thanh toán:</td>
                      <td style="padding: 16px 0 0; color: ${brandColor}; font-size: 18px; font-weight: 700; text-align: right;">
                        ${orderDetails.totalAmount.toLocaleString("vi-VN")}đ
                      </td>
                    </tr>
                  </table>

                  <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin-bottom: 24px;">

                    <div style="margin-bottom: 16px;">
                      <p style="margin: 0 0 4px; color: #6B7280; font-size: 13px; font-weight: 600; text-transform: uppercase;">
                        Thông tin giao hàng
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 14px; line-height: 1.5;">
                        ${cleanShippingAddress}
                      </p>
                    </div>

                    <div style="margin-bottom: 16px;">
                      <p style="margin: 0 0 4px; color: #6B7280; font-size: 13px; font-weight: 600; text-transform: uppercase;">
                        Thông tin liên hệ
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 14px;">
                        ${email}
                      </p>
                    </div>

                    <div>
                      <p style="margin: 0 0 4px; color: #6B7280; font-size: 13px; font-weight: 600; text-transform: uppercase;">
                        Phương thức thanh toán
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 14px;">
                        ${orderDetails.paymentMethod}
                      </p>
                    </div>

                  </div>

                  ${
                    paymentInfo?.paymentLink && ["MOMO", "VNPAY", "ZALOPAY", "BANK_TRANSFER"].includes(paymentInfo.paymentMethodCode)
                      ? `
                        <div style="border: 1px dashed ${brandColor}; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                          <h3 style="margin: 0 0 12px; color: #111827; font-size: 15px; font-weight: 600;">
                            Thanh toán đơn hàng
                          </h3>
                          <p style="margin: 0 0 16px; color: #4B5563; font-size: 13px;">
                            Quét mã QR dưới đây để hoàn tất thanh toán
                          </p>

                          <img src="${paymentInfo.paymentMethodCode === "BANK_TRANSFER" ? paymentInfo.paymentLink : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentInfo.paymentLink)}`}"
                               alt="Mã QR"
                               style="width: 200px; height: 200px; margin: 0 auto; display: block; border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px;">

                          ${
                            ["MOMO", "VNPAY", "ZALOPAY"].includes(paymentInfo.paymentMethodCode)
                              ? `
                            <div style="margin-top: 20px;">
                              <a href="${paymentInfo.paymentLink}"
                                 style="display: inline-block; padding: 12px 24px; background-color: ${brandColor}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                                Mở ứng dụng thanh toán
                              </a>
                            </div>
                          `
                              : ""
                          }
                        </div>
                      `
                      : ""
                  }

                  <div style="text-align: center; margin-top: 32px;">
                    <a href="${process.env.FRONTEND_URL}/profile/orders/"
                       style="display: inline-block; padding: 12px 32px; background-color: #F3F4F6; color: #111827; text-decoration: none; border: 1px solid #D1D5DB; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      Tra cứu đơn hàng
                    </a>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="background-color: #F9FAFB; padding: 24px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                  <p style="margin: 0 0 8px; color: #6B7280; font-size: 13px;">
                    Mọi thắc mắc xin vui lòng liên hệ CSKH.
                  </p>
                  <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                    © ${new Date().getFullYear()} Chợ Công Nghệ. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendMail({ to: email, subject: `Xác nhận đơn hàng #${orderCode}`, html });
};

export interface NewDeviceAlertPayload {
  browser: string; // e.g. "Chrome 147 / Windows 10"
  deviceName: string; // e.g. "Desktop" | "Apple iPhone"
  location: string; // e.g. "Ho Chi Minh City, VN"
  ip: string; // e.g. "113.161.x.x"
  time: Date; // login timestamp
}

/**
 * Sent the first time a user logs in from a browser+device combo we've
 * never seen before in the past 30 days.
 */
export const sendNewDeviceLoginAlert = async (email: string, payload: NewDeviceAlertPayload): Promise<void> => {
  const { browser, deviceName, location, ip, time } = payload;

  const timeStr = time.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "full",
    timeStyle: "short",
  });

  const changePasswordUrl = `${process.env.FRONTEND_URL}/settings?tab=security`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; color: #333;">

      <div style="background: #f59e0b; padding: 16px 24px; border-radius: 12px 12px 0 0;">
        <h2 style="margin: 0; color: #fff; font-size: 18px;">⚠️ Phát hiện đăng nhập mới</h2>
      </div>

      <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none;
                  padding: 24px; border-radius: 0 0 12px 12px;">

        <p style="margin-top: 0;">
          Chúng tôi phát hiện tài khoản của bạn vừa được đăng nhập từ một
          <strong>thiết bị chưa từng sử dụng trước đây</strong>.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;
                      font-size: 14px; background: #f9fafb; border-radius: 8px;
                      overflow: hidden;">
          <tr>
            <td style="padding: 10px 14px; color: #6b7280; width: 40%;">🖥️ Thiết bị</td>
            <td style="padding: 10px 14px; font-weight: 600;">${deviceName}</td>
          </tr>
          <tr style="background: #f3f4f6;">
            <td style="padding: 10px 14px; color: #6b7280;">🌐 Trình duyệt</td>
            <td style="padding: 10px 14px; font-weight: 600;">${browser}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; color: #6b7280;">📍 Vị trí</td>
            <td style="padding: 10px 14px; font-weight: 600;">${location}</td>
          </tr>
          <tr style="background: #f3f4f6;">
            <td style="padding: 10px 14px; color: #6b7280;">🔌 Địa chỉ IP</td>
            <td style="padding: 10px 14px; font-weight: 600; font-family: monospace;">${ip}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; color: #6b7280;">🕐 Thời gian</td>
            <td style="padding: 10px 14px; font-weight: 600;">${timeStr}</td>
          </tr>
        </table>

        <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;
                    padding: 14px 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px;">
            <strong>Nếu đây là bạn</strong> — không cần làm gì thêm.
          </p>
          <p style="margin: 6px 0 0; font-size: 14px;">
            <strong>Nếu không phải bạn</strong> — hãy đổi mật khẩu ngay và
            thu hồi tất cả phiên đăng nhập khác.
          </p>
        </div>

        <a
          href="${changePasswordUrl}"
          style="display: inline-block; margin-top: 8px; padding: 12px 24px;
                 background: #dc2626; color: #fff; text-decoration: none;
                 border-radius: 8px; font-weight: bold; font-size: 14px;"
        >
          🔒 Đổi mật khẩu ngay
        </a>

        <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
          Email này được gửi tự động từ hệ thống bảo mật.
          Bạn nhận được vì tài khoản liên kết với địa chỉ email này.
        </p>
      </div>
    </div>
  `;

  await sendMail({ to: email, subject: "⚠️ Đăng nhập từ thiết bị mới", html });
};
