// Chạy: node fix-checksums.js
// Đặt file này ở gốc project (F:\ChoCongNghe\web-server), ngang hàng với folder "prisma"
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const migrationsDir = path.join(__dirname, "prisma", "migrations");

const dirs = fs
  .readdirSync(migrationsDir)
  .filter((d) => fs.statSync(path.join(migrationsDir, d)).isDirectory());

let sql = "";
let count = 0;

for (const dir of dirs) {
  const filePath = path.join(migrationsDir, dir, "migration.sql");
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath); // đọc raw bytes, không convert gì cả
  const checksum = crypto.createHash("sha256").update(content).digest("hex");

  sql += `UPDATE "_prisma_migrations" SET checksum = '${checksum}' WHERE migration_name = '${dir}';\n`;
  count++;
}

fs.writeFileSync(path.join(__dirname, "update_checksums.sql"), sql, "utf8");
console.log(`Đã tạo update_checksums.sql với ${count} migration.`);
