const Review = require('../models/reviewModel');
const Book = require('../models/bookModel');

const createReview = async (req, res) => {
  const { bookId, rating, comment } = req.body;

  try {
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      book: bookId,
    });

    if (alreadyReviewed) {
      res.status(400).send('Book already reviewed');
    }

    const review = await Review.create({
      rating,
      comment,
      user: req.user._id,
      book: bookId,
    });

    const book = await Book.findById(bookId);
    
    if (book) {
      const newRating = (book.rating * book.ratingCount + rating) / (book.ratingCount + 1);
      
      book.rating = newRating;
      book.ratingCount += 1;
      
      await book.save();
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('book', 'title author')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).send('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403).send('User not authorized');
    }

    const oldRating = review.rating;
    
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    
    const updatedReview = await review.save();

    const book = await Book.findById(review.book);
    
    if (book && rating) {
      const adjustedRating = (book.rating * book.ratingCount - oldRating + rating) / book.ratingCount;
      book.rating = adjustedRating;
      await book.save();
    }

    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).send('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403).send('User not authorized');
    }

    const book = await Book.findById(review.book);
    
    if (book && book.ratingCount > 1) {
      const adjustedRating = (book.rating * book.ratingCount - review.rating) / (book.ratingCount - 1);
      book.rating = adjustedRating;
      book.ratingCount -= 1;
    } else if (book) {
      book.rating = 0;
      book.ratingCount = 0;
    }
    
    if (book) {
      await book.save();
    }

    await review.remove();
    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getBookReviews,
  getUserReviews,
  updateReview,
  deleteReview,
};