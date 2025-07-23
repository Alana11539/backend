import express from 'express';
import multer from 'multer';

import { isAuthenticated } from '../middleware/isAuthenticated.js';
import { authorizeRoles } from '../middleware/authRole.js';
import { registerDonor, getAllDonors, getDonorbyId, updateDonor, deleteDonor ,addDonationRecord} from '../controller/donorController.js';
const router = express.Router();
router.post('/register',isAuthenticated,authorizeRoles('admin'),registerDonor);
router.get('/', isAuthenticated, authorizeRoles('admin'), getAllDonors);
router.get('/donor/:id', isAuthenticated, authorizeRoles('admin'), getDonorbyId);
router.put('/donor/:id', isAuthenticated, authorizeRoles('admin'), updateDonor);
router.delete('/donor/:id', isAuthenticated, authorizeRoles('admin'), deleteDonor);
router.post('/donor/:id/donation', isAuthenticated, authorizeRoles('admin'), addDonationRecord);
export default router;