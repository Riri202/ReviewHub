const Review = require("../models/reviewModel");
const Book = require("../models/bookModel");

const createReview = async (req, res) => {
  const { bookId, rating, comment } = req.body;

  try {
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      book: bookId,
    });

    if (alreadyReviewed) {
      return res.status(400).send("Book already reviewed");
    }

    await Review.create({
      rating,
      comment,
      user: req.user._id,
      book: bookId,
    });

    const book = await Book.findById(bookId);
    
    if (book) {
      const newRating =
        (book.rating * book.ratingCount + Number(rating)) / (book.ratingCount + 1);
      const newRatingCount = (book.ratingCount += 1);
      await Book.findByIdAndUpdate(book._id, {
        rating: newRating,
        ratingCount: newRatingCount,
      });
    }

    res.redirect(`/api/books/${bookId}`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.id })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("book", "title author")
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
      res.status(404).send("Review not found");
    }

    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403).send("You are not authorized to edit this review");
    }

    const oldRating = review.rating;

    review.rating = Number(rating) || review.rating;
    review.comment = comment || review.comment;

    await review.save({ validateModifiedOnly: true });

    const book = await Book.findById(review.book);

    if (book && rating) {
      const adjustedRating =
        (book.rating * book.ratingCount - oldRating + Number(rating)) /
        book.ratingCount;
      book.rating = adjustedRating;
      await book.save({ validateModifiedOnly: true });
    }

    res.redirect(`/api/books/${book._id}`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).send("Review not found");
    }

    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403).send("You are not authorized to delete this review");
    }

    const book = await Book.findById(review.book);

    if (book) {
      let updatedFields = {};

      if (book.ratingCount > 1) {
        const adjustedRating =
          (book.rating * book.ratingCount - review.rating) /
          (book.ratingCount - 1);
        updatedFields = {
          rating: adjustedRating,
          ratingCount: book.ratingCount - 1,
        };
      } else {
        updatedFields = {
          rating: 0,
          ratingCount: 0,
        };
      }

      await Book.findByIdAndUpdate(book._id, updatedFields, { new: true });
    }

    await review.deleteOne({ _id: req.params.id });
    res.redirect(`/api/books/${book._id}`);
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
