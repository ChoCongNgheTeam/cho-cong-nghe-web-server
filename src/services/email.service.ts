import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendResetPasswordEmail = async (email: string, resetLink: string) => {
  const mailOptions = {
    from: `"Hỗ trợ Khách hàng" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "🔐 Yêu cầu đặt lại mật khẩu",
    html: `
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
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2e3841 0%, #1a2027 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                      🔒 Đặt lại mật khẩu
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Xin chào,
                    </p>
                    
                    <p style="margin: 0 0 25px; color: #555555; font-size: 15px; line-height: 1.6;">
                      Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                      Nhấn vào nút bên dưới để tạo mật khẩu mới:
                    </p>
                    
                    <!-- Button -->
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
                                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                                    transition: all 0.3s ease;">
                            Đặt lại mật khẩu ngay
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Info Box -->
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
                      <a href="${resetLink}" 
                         style="color: #667eea; 
                                text-decoration: none; 
                                font-size: 13px;">
                        ${resetLink}
                      </a>
                    </div>
                  </td>
                </tr>
                
                <!-- Security Notice -->
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <div style="background-color: #f8f9fa; 
                                padding: 20px; 
                                border-radius: 8px; 
                                border: 1px solid #e9ecef;">
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
                
                <!-- Footer -->
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
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Thêm vào cuối email.service.ts

export const sendNotificationEmail = async (email: string, title: string, body: string, data?: Record<string, any>) => {
  const brandColor = "#3B82F6"; // Màu xanh chủ đạo

  const typeConfig: Record<string, string> = {
    WELCOME_VOUCHER: "🎉",
    VOUCHER_EXPIRING: "⏰",
    VOUCHER_ASSIGNED: "🎁",
    CAMPAIGN_PROMOTION: "🔥",
    USER_INACTIVE: "👋",
    ORDER_STATUS: "📦",
  };

  const icon = typeConfig[data?.type as string] ?? "🔔";

  // Khối Voucher Minimalist
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

  const mailOptions = {
    from: `"Chợ Công Nghệ" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `${icon} ${title}`,
    html: `
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
    `,
  };

  await transporter.sendMail(mailOptions);
};

// 📧 GỬI EMAIL XÁC NHẬN ĐẶT HÀNG THÀNH CÔNG
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
  }
) => {
  const brandColor = "#3B82F6"; // Màu xanh chủ đạo

  const emailPattern = /([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}),?\s*/;
  const cleanShippingAddress = orderDetails.shippingAddress.replace(emailPattern, '').trim();
  
  const mailOptions = {
    from: `"Chợ Công Nghệ" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `Xác nhận đơn hàng #${orderCode}`,
    html: `
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
                            ${(orderDetails.unitPrice * orderDetails.quantity).toLocaleString('vi-VN')}đ
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0 0; color: #111827; font-size: 16px; font-weight: 600;">Tổng thanh toán:</td>
                        <td style="padding: 16px 0 0; color: ${brandColor}; font-size: 18px; font-weight: 700; text-align: right;">
                          ${orderDetails.totalAmount.toLocaleString('vi-VN')}đ
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
                      paymentInfo?.paymentLink && ['MOMO', 'VNPAY', 'ZALOPAY', 'BANK_TRANSFER'].includes(paymentInfo.paymentMethodCode)
                        ? `
                          <div style="border: 1px dashed ${brandColor}; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 12px; color: #111827; font-size: 15px; font-weight: 600;">
                              Thanh toán đơn hàng
                            </h3>
                            <p style="margin: 0 0 16px; color: #4B5563; font-size: 13px;">
                              Quét mã QR dưới đây để hoàn tất thanh toán
                            </p>
                            
                            <img src="${paymentInfo.paymentMethodCode === 'BANK_TRANSFER' ? paymentInfo.paymentLink : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentInfo.paymentLink)}`}" 
                                 alt="Mã QR" 
                                 style="width: 200px; height: 200px; margin: 0 auto; display: block; border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px;">
                            
                            ${['MOMO', 'VNPAY', 'ZALOPAY'].includes(paymentInfo.paymentMethodCode) ? `
                              <div style="margin-top: 20px;">
                                <a href="${paymentInfo.paymentLink}" 
                                   style="display: inline-block; padding: 12px 24px; background-color: ${brandColor}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                                  Mở ứng dụng thanh toán
                                </a>
                              </div>
                            ` : ''}
                          </div>
                        `
                        : ''
                    }

                    <div style="text-align: center; margin-top: 32px;">
                      <a href="${process.env.FRONTEND_URL}/profile/orders/"
                         style="display: inline-block; padding: 12px 32px; background-color: #F3F4F6; color: #111827; text-decoration: none; border: 1px solid #D1D5DB; border-radius: 6px; font-weight: 600; font-size: 14px; transition: all 0.2s;">
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
    `,
  };

  await transporter.sendMail(mailOptions);
};