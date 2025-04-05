const express = require('express');
const router = express.Router();
const {
  createReview,
  getBookReviews,
  getUserReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/book/:id', getBookReviews);
router.get('/user', protect, getUserReviews);
router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;