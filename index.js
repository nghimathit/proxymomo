const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");

const app = express();
const port = 3001;

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mmopay.2022@gmail.com', // Thay thế bằng email của bạn
    pass: 'uech tkqf kqye ailp', // Thay thế bằng mật khẩu email của bạn (nên sử dụng mật khẩu ứng dụng nếu sử dụng xác thực hai bước)
  },
});

// Thời gian khóa gửi email (15 phút)
const EMAIL_COOLDOWN = 10*60*1000;
let lastEmailSentTime = 0;

// Middleware cho phép CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  const currentTime = Date.now();

  // Kiểm tra thời gian gửi email trước đó
  if (currentTime - lastEmailSentTime > EMAIL_COOLDOWN) {
    const mailOptions = {
      from: 'mmopay.2022@gmail.com',
      to: 'vannghinguyen152001@gmail.com', // Địa chỉ nhận thông báo
      subject: 'Thông báo truy cập API MOMO',
      text: `Có một yêu cầu truy cập vào API: ${req.method} ${req.originalUrl} từ IP: ${req.ip}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Lỗi gửi email:', err);
      } else {
        console.log('Email đã được gửi:', info.response);
        lastEmailSentTime = currentTime; // Cập nhật thời gian gửi email
      }
    });
  }

  next();
});

// Middleware để xử lý dữ liệu JSON
app.use(express.json());

// Route cho việc đăng nhập và lấy token
app.post("/api/authentication/login", async (req, res) => {
  try {
    const response = await axios.post(
      "https://business.momo.vn/api/authentication/login?language=vi",
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Route để lấy thông tin merchant
app.get("/api/profile/v2/merchants", async (req, res) => {
  try {
    const response = await axios.get(
      "https://business.momo.vn/api/profile/v2/merchants?requestType=LOGIN_MERCHANTS&language=vi",
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Route để lấy dữ liệu giao dịch
app.get("/api/transaction/v2/transactions/statistics", async (req, res) => {
  const { fromDate, toDate, merchantId } = req.query;
  try {
    const response = await axios.get(
      `https://business.momo.vn/api/transaction/v2/transactions/statistics?fromDate=${fromDate}&toDate=${toDate}&status=ALL&merchantId=${merchantId}&language=vi`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Server proxy lắng nghe trên cổng 3001
app.listen(port, () => {
  console.log(`Proxy server đang chạy tại http://localhost:${port}`);
});
