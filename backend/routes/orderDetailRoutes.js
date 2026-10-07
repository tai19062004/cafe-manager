import express from 'express';
import orderDetailController from '../controllers/orderDetailController.js';

const router = express.Router();

router.get('/', orderDetailController.getAllOrderDetails);
router.get('/by-order/:orderId', orderDetailController.getOrderDetailsByOrderId);

export default router;
