import express from 'express';
import tableController from '../controllers/tableController.js';

const router = express.Router();

router.get('/', tableController.getAllTables);
router.get('/:id', tableController.getTableById);
router.post('/', tableController.createTable);
router.put('/:id', tableController.updateTable);
router.delete('/:id', tableController.deleteTable);

export default router;
