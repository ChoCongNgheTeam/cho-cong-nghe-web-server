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
