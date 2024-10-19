const express = require("express");
const axios = require("axios");
const app = express();
const port = 3001; // Server proxy chạy trên cổng 3001

// Middleware cho phép CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
          Authorization: req.headers.authorization, // Gửi token từ header
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
      `https://business.momo.vn/api/transaction/v2/transactions/statistics?pageSize=10&pageNumber=0&fromDate=${fromDate}&toDate=${toDate}&status=ALL&merchantId=${merchantId}&language=vi`,
      {
        headers: {
          Authorization: req.headers.authorization, // Gửi token từ header
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
