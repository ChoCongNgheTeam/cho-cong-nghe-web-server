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
  // Map type → icon + color
  const typeConfig: Record<string, { icon: string; color: string }> = {
    WELCOME_VOUCHER: { icon: "🎉", color: "#10b981" },
    VOUCHER_EXPIRING: { icon: "⏰", color: "#f59e0b" },
    VOUCHER_ASSIGNED: { icon: "🎁", color: "#8b5cf6" },
    CAMPAIGN_PROMOTION: { icon: "🔥", color: "#ef4444" },
    USER_INACTIVE: { icon: "👀", color: "#3b82f6" },
    ORDER_STATUS: { icon: "📦", color: "#6366f1" },
  };

  const config = typeConfig[data?.type as string] ?? { icon: "🔔", color: "#2e3841" };

  // Nếu có voucherCode → render voucher card
  const voucherBlock = data?.voucherCode
    ? `
      <div style="background: linear-gradient(135deg, ${config.color}15 0%, ${config.color}08 100%);
                  border: 2px dashed ${config.color};
                  border-radius: 12px;
                  padding: 24px;
                  text-align: center;
                  margin: 24px 0;">
        <p style="margin: 0 0 8px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
          Mã voucher của bạn
        </p>
        <p style="margin: 0 0 12px; color: ${config.color}; font-size: 28px; font-weight: 800; letter-spacing: 4px;">
          ${data.voucherCode}
        </p>
        ${
          data.discountValue
            ? `<p style="margin: 0; color: #666; font-size: 14px;">
               Giảm <strong>${Number(data.discountValue).toLocaleString("vi-VN")}đ</strong>
             </p>`
            : ""
        }
      </div>`
    : "";

  const mailOptions = {
    from: `"Thông báo" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `${config.icon} ${title}`,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f7fa;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:40px 20px;">
              <table role="presentation" style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,${config.color} 0%,${config.color}cc 100%);padding:40px 30px;text-align:center;">
                    <div style="font-size:48px;margin-bottom:12px;">${config.icon}</div>
                    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:600;line-height:1.3;">
                      ${title}
                    </h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 30px;">
                    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">
                      ${body}
                    </p>

                    ${voucherBlock}

                    <a href="${process.env.FRONTEND_URL}"
                       style="display:inline-block;margin-top:16px;padding:14px 36px;
                              background:linear-gradient(135deg,${config.color} 0%,${config.color}cc 100%);
                              color:#fff;text-decoration:none;border-radius:8px;
                              font-weight:600;font-size:15px;">
                      Mua sắm ngay
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8f9fa;padding:24px 30px;text-align:center;border-top:1px solid #e9ecef;">
                    <p style="margin:0 0 6px;color:#999;font-size:13px;">
                      Bạn nhận được email này vì đã đăng ký tài khoản tại cửa hàng.
                    </p>
                    <p style="margin:0;color:#bbb;font-size:12px;">
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
  // 🔧 TÁCH EMAIL KHỎI SHIPPING ADDRESS NẾU BỊ DÍNH
  const emailPattern = /([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}),?\s*/;
  const cleanShippingAddress = orderDetails.shippingAddress.replace(emailPattern, '').trim();
  
  const mailOptions = {
    from: `"Chợ Công Nghệ" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `✅ Đơn hàng ${orderCode} của bạn đã được tạo thành công!`,
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
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                      Đơn hàng đã được tạo thành công!
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Xin chào <strong>${customerName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 25px; color: #555555; font-size: 15px; line-height: 1.6;">
                      Cảm ơn bạn đã đặt hàng tại Chợ Công Nghệ! Đơn hàng của bạn đã được tạo thành công và staff sẽ xác nhận trong vòng 1-2 giờ.
                    </p>

                    <!-- Order Code Card -->
                    <div style="background: linear-gradient(135deg, #10b98115 0%, #05966908 100%);
                                border: 2px dashed #10b981;
                                border-radius: 12px;
                                padding: 24px;
                                text-align: center;
                                margin: 24px 0;">
                      <p style="margin: 0 0 8px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
                        Mã đơn hàng của bạn
                      </p>
                      <p style="margin: 0; color: #10b981; font-size: 32px; font-weight: 800; letter-spacing: 2px;">
                        ${orderCode}
                      </p>
                    </div>

                    <!-- Order Details -->
                    <div style="background-color: #f8f9fa; padding: 24px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #10b981;">
                      <h2 style="margin: 0 0 16px; color: #333; font-size: 16px; font-weight: 600;">
                        📦 Chi tiết đơn hàng
                      </h2>
                      
                      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                        <tr style="border-bottom: 1px solid #e9ecef;">
                          <td style="padding: 10px 0; color: #666; font-size: 14px;">Sản phẩm:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 500; text-align: right;">
                            ${orderDetails.productName}
                          </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e9ecef;">
                          <td style="padding: 10px 0; color: #666; font-size: 14px;">Phiên bản:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 500; text-align: right;">
                            ${orderDetails.variantName}
                          </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e9ecef;">
                          <td style="padding: 10px 0; color: #666; font-size: 14px;">Số lượng:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 500; text-align: right;">
                            ${orderDetails.quantity} chiếc
                          </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e9ecef;">
                          <td style="padding: 10px 0; color: #666; font-size: 14px;">Giá (mỗi sản phẩm):</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 500; text-align: right;">
                            ${orderDetails.unitPrice.toLocaleString('vi-VN')}đ
                          </td>
                        </tr>
                        <tr style="background: #f0f4f8; border-radius: 6px;">
                          <td style="padding: 12px 0; color: #333; font-size: 15px; font-weight: 600;">Tổng tiền:</td>
                          <td style="padding: 12px 0; color: #10b981; font-size: 18px; font-weight: 700; text-align: right;">
                            ${orderDetails.totalAmount.toLocaleString('vi-VN')}đ
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Email Info -->
                    <div style="background-color: #f0f4f8; border-left: 4px solid #667eea; padding: 16px; border-radius: 6px; margin: 24px 0;">
                      <p style="margin: 0 0 12px; color: #3730a3; font-size: 14px; font-weight: 600;">
                        📧 Email
                      </p>
                      <p style="margin: 0; color: #3730a3; font-size: 14px;">
                        ${email}
                      </p>
                    </div>

                    <!-- Shipping Info -->
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; border-radius: 6px; margin: 24px 0;">
                      <p style="margin: 0 0 12px; color: #856404; font-size: 14px; font-weight: 600;">
                        📍 Địa chỉ giao hàng
                      </p>
                      <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                        ${cleanShippingAddress}
                      </p>
                    </div>

                    <!-- Payment Info -->
                    <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 16px; border-radius: 6px; margin: 24px 0;">
                      <p style="margin: 0 0 12px; color: #1565c0; font-size: 14px; font-weight: 600;">
                        💳 Phương thức thanh toán
                      </p>
                      <p style="margin: 0; color: #1565c0; font-size: 14px;">
                        ${orderDetails.paymentMethod}
                      </p>
                    </div>

                    <!-- Payment QR Code Section (for MOMO, VNPAY, ZALOPAY) -->
                    ${
                      paymentInfo?.paymentLink && 
                      ['MOMO', 'VNPAY', 'ZALOPAY'].includes(paymentInfo.paymentMethodCode)
                        ? `
                          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0; border: 2px dashed #0068ff; text-align: center;">
                            <h3 style="margin: 0 0 16px; color: #333; font-size: 15px; font-weight: 600;">
                              📱 Thanh toán đơn hàng
                            </h3>
                            
                            <p style="margin: 0 0 16px; color: #666; font-size: 13px;">
                              Dành cho máy tính: Dùng ứng dụng ngân hàng/ví điện tử để quét mã QR bên dưới.
                            </p>
                            
                            <div style="margin: 16px 0;">
                              <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentInfo.paymentLink)}" 
                                   alt="QR Thanh toán" 
                                   style="width: 250px; height: 250px; margin: 0 auto; display: block;">
                            </div>
                            
                            <p style="margin: 16px 0; color: #666; font-size: 13px;">
                              Hoặc đang dùng điện thoại? Bấm nút dưới đây:
                            </p>
                            
                            <a href="${paymentInfo.paymentLink}" 
                               style="display: inline-block; 
                                      padding: 14px 32px; 
                                      background: linear-gradient(135deg, #0068ff 0%, #0052cc 100%); 
                                      color: #fff; 
                                      text-decoration: none; 
                                      border-radius: 6px; 
                                      font-weight: 600; 
                                      font-size: 14px;
                                      box-shadow: 0 4px 12px rgba(0, 104, 255, 0.3);">
                              Thanh Toán Ngay
                            </a>
                          </div>
                        `
                        : ''
                    }

                    <!-- Bank Transfer QR Section (for BANK_TRANSFER) -->
                    ${
                      paymentInfo?.paymentMethodCode === 'BANK_TRANSFER'
                        ? `
                          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0; border: 2px dashed #ff6b6b; text-align: center;">
                            <h3 style="margin: 0 0 16px; color: #333; font-size: 15px; font-weight: 600;">
                              🏦 Quét mã để chuyển khoản
                            </h3>
                            
                            <div style="margin: 16px 0;">
                              <img src="${paymentInfo.paymentLink}" 
                                   alt="QR Chuyển khoản" 
                                   style="width: 250px; height: 250px; margin: 0 auto; display: block;">
                            </div>
                            
                            <p style="margin: 12px 0 0; color: #666; font-size: 12px;">
                              Dùng ứng dụng Mobile Banking để quét mã QR trên
                            </p>
                          </div>
                        `
                        : ''
                    }

                    <!-- Next Steps -->
                    <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin: 24px 0;">
                      <h3 style="margin: 0 0 12px; color: #333; font-size: 15px; font-weight: 600;">
                        ⏭️ Bước tiếp theo
                      </h3>
                      <ol style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.8;">
                        <li>Staff sẽ xác nhận đơn hàng trong vòng <strong>1-2 giờ</strong></li>
                        <li>Bạn sẽ nhận được tin nhắn SMS khi đơn được xác nhận</li>
                        <li>Giao hàng sẽ diễn ra trong <strong>1-3 ngày</strong> (tuỳ khu vực)</li>
                        <li>Kiểm tra lại thông tin đơn hàng tại <strong>Lịch sử đơn hàng</strong></li>
                      </ol>
                    </div>

                    <!-- Support -->
                    <div style="text-align: center; margin-top: 32px;">
                      <p style="margin: 0 0 16px; color: #666; font-size: 14px;">
                        Có câu hỏi? Chúng tôi luôn sẵn sàng hỗ trợ
                      </p>
                      <a href="${process.env.FRONTEND_URL}/order-status/${orderCode}"
                         style="display: inline-block; padding: 14px 36px; 
                                background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                                color: #fff; text-decoration: none; 
                                border-radius: 8px; font-weight: 600; font-size: 15px;
                                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
                        Xem chi tiết đơn hàng
                      </a>
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
