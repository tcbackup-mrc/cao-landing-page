const fs = require('fs');
const path = require('path');

// Đọc cấu hình từ process.env hoặc từ tệp .env cục bộ
const config = {
  VITE_GOOGLE_SHEET_WEBHOOK_URL: process.env.VITE_GOOGLE_SHEET_WEBHOOK_URL,
  VITE_BANK_ID: process.env.VITE_BANK_ID,
  VITE_BANK_ACCOUNT: process.env.VITE_BANK_ACCOUNT,
  VITE_BANK_ACCOUNT_NAME: process.env.VITE_BANK_ACCOUNT_NAME
};

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  Object.keys(config).forEach(key => {
    if (!config[key]) {
      const regex = new RegExp(`${key}\\s*=\\s*(.*)`);
      const match = envContent.match(regex);
      if (match && match[1]) {
        config[key] = match[1].trim();
      }
    }
  });
}

// Kiểm tra tính đầy đủ của cấu hình
Object.keys(config).forEach(key => {
  if (!config[key]) {
    console.warn(`Cảnh báo: Không tìm thấy giá trị cho ${key}`);
    config[key] = "";
  }
});

// Tạo thư mục dist nếu chưa tồn tại
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Sao chép tài nguyên tĩnh
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'index.css'), path.join(distDir, 'index.css'));

// Thay thế các placeholder trong main.js và ghi vào dist
const mainJsPath = path.join(__dirname, 'main.js');
let mainContent = fs.readFileSync(mainJsPath, 'utf8');

mainContent = mainContent.replace('__GOOGLE_SHEET_WEBHOOK_URL__', config.VITE_GOOGLE_SHEET_WEBHOOK_URL);
mainContent = mainContent.replace('__BANK_ID__', config.VITE_BANK_ID);
mainContent = mainContent.replace('__BANK_ACCOUNT__', config.VITE_BANK_ACCOUNT);
mainContent = mainContent.replace('__BANK_ACCOUNT_NAME__', config.VITE_BANK_ACCOUNT_NAME);

fs.writeFileSync(path.join(distDir, 'main.js'), mainContent);

console.log("Đã build thành công dự án vào thư mục dist!");
