# 🛒 Chợ Công Nghệ - Web Server

Backend API cho dự án Chợ Công Nghệ, được xây dựng với Node.js, Express, Prisma và PostgreSQL.

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 20.x
- **Docker & Docker Compose**: Latest version
- **npm**: >= 10.x
- **Database Tool** (optional): DBeaver, pgAdmin, hoặc TablePlus

## 🚀 Hướng dẫn cài đặt

### 1. Clone Repository

```bash
git clone https://github.com/ChoCongNgheTeam/cho-cong-nghe-web-server.git
cd cho-cong-nghe-web-server
```

### 2. Cấu hình Environment Variables

Tạo file `.env` ở thư mục root và cấu hình theo template sau:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/web_db"

# Server
PORT=5000

# PostgreSQL Docker
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=web_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
RESET_TOKEN_EXPIRES_IN=1h
```

> ⚠️ **Lưu ý**: Thông tin cụ thể về credentials sẽ được leader cập nhật cho team members.

### 3. Cài đặt Dependencies

```bash
npm install
```

### 4. Khởi động Docker Services

```bash
# Build và start containers
docker compose up --build -d

# Kiểm tra trạng thái containers
docker compose ps

# Kiểm tra logs (nếu có lỗi)
docker compose logs -f
```

Verify PostgreSQL đã chạy thành công:

```bash
docker compose logs postgres
```

Bạn sẽ thấy message: `database system is ready to accept connections`

### 5. Kết nối Database (Optional - Để kiểm tra)

Sử dụng DBeaver hoặc tool tương tự với thông tin:

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `web_db`
- **Username**: `postgres` (hoặc theo config của leader)
- **Password**: `postgres` (hoặc theo config của leader)

### 6. Setup Database Schema & Seed Data

Vì project đã có migration sẵn, bạn chỉ cần chạy:

```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations (tạo tables)
npx prisma migrate deploy

# Seed data mẫu vào database
npx prisma db seed
```

**Giải thích các lệnh:**

- `prisma generate`: Tạo Prisma Client từ schema
- `prisma migrate deploy`: Áp dụng các migration đã có (tạo tables)
- `prisma db seed`: Chạy seed files để import data mẫu

### 7. Verify Database

Kiểm tra xem data đã được seed thành công:

```bash
# Mở Prisma Studio để xem data
npx prisma studio
```

Hoặc check trực tiếp trong DBeaver/pgAdmin.

### 8. Chạy Development Server

```bash
docker compose up -d
```

Server sẽ chạy tại: `http://localhost:5000`

### 9. Truy cập API Documentation

Mở trình duyệt và vào:

```
http://localhost:5000/api-docs
```

Bạn sẽ thấy Swagger UI với danh sách tất cả các API endpoints.

## 📦 Scripts Available

```bash
# Development với hot-reload
npm run dev

# Build production
npm run build

# Run production
npm start

# Prisma commands
npx prisma generate        # Generate Prisma Client
npx prisma migrate dev     # Tạo migration mới
npx prisma migrate deploy  # Apply migrations
npx prisma db seed         # Seed database
npx prisma studio          # Mở Prisma Studio GUI
```

## 🐳 Docker Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart specific service
docker compose restart backend

# Rebuild containers
docker compose up --build -d

# Remove all (bao gồm volumes)
docker compose down -v
```

## 📁 Cấu trúc dự án

```
web-server/
├── prisma/
│   ├── migrations/          # Database migrations
│   ├── seeds/              # Seed data files
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Main seed file
├── src/
│   ├── app/
│   │   ├── config/        # App configurations
│   │   ├── middlewares/   # Express middlewares
│   │   ├── modules/       # Feature modules
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helper functions
│   └── server.ts          # App entry point
├── .env                    # Environment variables
├── docker-compose.yml     # Docker configuration
├── Dockerfile            # Docker image config
├── package.json
└── tsconfig.json
```

## 🔧 Troubleshooting

### Lỗi kết nối Database

```bash
# Restart PostgreSQL container
docker compose restart postgres

# Check logs
docker compose logs postgres
```

### Port đã được sử dụng

```bash
# Thay đổi PORT trong .env
PORT=5001

# Hoặc kill process đang dùng port 5000
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Prisma Client lỗi

```bash
# Re-generate Prisma Client
npx prisma generate

# Clear node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

### Migration lỗi

```bash
# Reset database (⚠️ XÓA TẤT CẢ DATA)
npx prisma migrate reset

# Sau đó seed lại
npx prisma db seed
```

## 🤝 Contributing

1. Tạo branch mới từ `develop`
2. Commit changes của bạn
3. Push lên GitHub
4. Tạo Pull Request

## 📞 Liên hệ

Nếu gặp vấn đề, liên hệ team leader để được hỗ trợ.
