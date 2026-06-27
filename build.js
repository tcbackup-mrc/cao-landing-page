const fs = require('fs');
const path = require('path');

// 1. Đọc biến từ process.env (Vercel) hoặc từ tệp .env cục bộ
let webhookUrl = process.env.VITE_GOOGLE_SHEET_WEBHOOK_URL;

if (!webhookUrl) {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VITE_GOOGLE_SHEET_WEBHOOK_URL\s*=\s*(.*)/);
    if (match && match[1]) {
      webhookUrl = match[1].trim();
    }
  }
}

if (!webhookUrl) {
  console.error("Lỗi: Không tìm thấy VITE_GOOGLE_SHEET_WEBHOOK_URL trong biến môi trường hoặc file .env");
  process.exit(1);
}

// 2. Thay thế placeholder trong main.js
const mainJsPath = path.join(__dirname, 'main.js');
let mainContent = fs.readFileSync(mainJsPath, 'utf8');
mainContent = mainContent.replace('__GOOGLE_SHEET_WEBHOOK_URL__', webhookUrl);
fs.writeFileSync(mainJsPath, mainContent);

console.log("Đã tiêm thành công Webhook URL vào main.js");
