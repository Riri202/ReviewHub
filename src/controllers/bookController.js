const Book = require("../models/bookModel");
const Review = require("../models/reviewModel");
const { mongooseDocsToObjects, isAdmin } = require("../utils");

const createBook = async (req, res) => {
  const { title, author, genre } = req.body;

  try {
    const book = await Book.create({
      title,
      author,
      genre,
      user: req.user._id,
    });

    res.redirect("/catalog");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBooks = async (req, res) => {
  try {
    const { search, page = 1, limit = 2 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    const count = await Book.countDocuments(query);

    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const user = req.user.toObject();

    res.render("book-catalog", {
      user,
      books: mongooseDocsToObjects(books),
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      prevPage: page > 1,
      nextPage: page < Math.ceil(count / limit),
      totalBooks: count,
      isAdmin: isAdmin(user),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send("Book ID not provided");
    }

    const book = await Book.findById(req.params.id).populate("user");

    if (!book) {
      return res.status(404).send("Book not found");
    }

    const user = req.user.toObject();
    const isAdminUser = isAdmin(user);
    let fixedReviews = [];

    const reviews = await Review.find({ book: req.params.id }).populate("user");

    if (reviews.length) {

      fixedReviews = mongooseDocsToObjects(reviews);
  
      fixedReviews.forEach((review) => {
        review.isOwnReview = review.user._id.toString() === user._id.toString();
      });
    }


    const hasBeenAddedToReadingList = user.readingList?.some((item) =>
      item._id.equals(book._id)
    );

    const hasBeenReviewed =
      (
        await Review.find({
          user: req.user._id,
          book: req.params.id,
        })
      ).length > 0;
    res.render("book-detail", {
      book: book.toObject(),
      user,
      isAdmin: isAdminUser,
      hasBeenAddedToReadingList,
      hasBeenReviewed,
      reviews: fixedReviews,
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateBook = async (req, res) => {
  try {
    const { title, author, genre } = req.body;
    await Book.findByIdAndUpdate(req.params.id, { title, author, genre });
    res.redirect(`/api/books/${req.params.id}`);
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      await Review.deleteMany({ book: req.params.id });

      await Book.deleteOne({ _id: req.params.id });
      res.redirect("/catalog");
    } else {
      res.status(404);
      throw new Error("Book not found");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
};
