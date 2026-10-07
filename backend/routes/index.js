import express from 'express';

import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import customerRoutes from './customerRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import tableRoutes from './tableRoutes.js';
import orderRoutes from './orderRoutes.js';
import orderDetailRoutes from './orderDetailRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = express.Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running'
  });
});

// Resource Routes
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/employees', employeeRoutes);
router.use('/tables', tableRoutes);
router.use('/orders', orderRoutes);
router.use('/order-details', orderDetailRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
