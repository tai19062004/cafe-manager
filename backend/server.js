import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import db from './config/database.js';
import apiRoutes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration (hỗ trợ Vite frontend http://localhost:5173)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Root check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Cafe Management System API - Oracle 26ai'
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn không tồn tại: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server and initialize Oracle Pool
async function startServer() {
  try {
    // Khởi tạo connection pool tới Oracle
    await db.initPool();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Cafe Manager Backend is running on port ${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    // Graceful Shutdown
    const shutdown = async () => {
      console.log('\nĐang đóng máy chủ và giải phóng kết nối Oracle...');
      server.close(async () => {
        await db.closePool();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    console.error('❌ Không thể khởi động server do lỗi kết nối Database:', err.message);
    process.exit(1);
  }
}

startServer();
