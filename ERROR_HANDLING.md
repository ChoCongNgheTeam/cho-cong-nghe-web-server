# Hướng dẫn xử lý lỗi API trên Frontend (Next.js)

Backend đã chuẩn hóa mọi response báo lỗi theo một định dạng chung. Các bạn Frontend cấu hình Axios hoặc Fetch để bắt lỗi theo format sau nhé.

### 1. Định dạng JSON Backend trả về khi có lỗi
```json
{
  "message": "Thông báo lỗi tổng quát (Dùng để hiện Toast/Alert)",
  "errors": {
    "email": "Email không hợp lệ",
    "password": "Mật khẩu quá ngắn"
  } // (Tùy chọn: Thường xuất hiện khi có mã 400 - Validation)
}