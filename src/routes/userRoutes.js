const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  addToReadingList,
  logout,
  removeFromReadingList,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logout);
router.get('/profile', protect, getUserProfile);
router.put('/reading-list', protect, addToReadingList);
router.post('/reading-list', protect, removeFromReadingList);

module.exports = router;