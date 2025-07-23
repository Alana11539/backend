
import express from 'express';
import { registerUser, loginUser,updateUser, deleteUser,refreshAccessToken,requestPasswordReset, resetPassword, getAdminDashboard } from '../controller/adminController.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();
router.get('/activities', verifyToken, (req, res) => {
  res.json({
    message: 'This is a protected admin route.',
    user: req.user,
  });
});
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getAdminDashboard);
router.put('/update/:adminId', updateUser);
router.delete('/delete/:adminId', deleteUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);


export default router;
