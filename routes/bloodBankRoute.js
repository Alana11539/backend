import express from 'express';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import { authorizeRoles } from '../middleware/authRole.js';
import { getBloodStock, updateBloodStock, intitalizeBloodStock  } from '../controller/bloodbankController.js';

const router = express.Router();
router.get('/blood-stock', isAuthenticated, authorizeRoles('admin'), getBloodStock);
router.post('/update-blood-stock', isAuthenticated, authorizeRoles('admin'), updateBloodStock);
router.post('/initialize-blood-stock', isAuthenticated, authorizeRoles('admin'), intitalizeBloodStock);
export default router;