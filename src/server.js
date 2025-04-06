const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
const handlebars = require("express-handlebars");
const session = require("express-session");
const { protect, admin } = require("./middleware/authMiddleware");
const cookieParser = require("cookie-parser");
const { getBooks } = require("./controllers/bookController");
const { isAdmin } = require("./utils");
const methodOverride = require('method-override');

const Book = require("./models/bookModel");
const Review = require("./models/reviewModel");

dotenv.config();

connectDB();

const app = express();

app.use(cookieParser());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, "/public")));
const hbs = handlebars.create({ extname: ".hbs" });
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

hbs.handlebars.registerHelper("math", function (a, b, operator) {
  switch (operator) {
    case "eq":
      return a === b;
    case "gt":
      return a > b;
    case "gte":
      return a >= b;
    case "lt":
      return a < b;
    case "lte":
      return a <= b;
    case "ne":
      return a !== b;
    case "add":
      return Number(a) + Number(b);
    case "subtract":
      return Number(a) - Number(b);
    default:
      return false;
  }
});

hbs.handlebars.registerHelper("formatDate", function (date) {
  if (!date) return "";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));

app.get("/", (req, res) => {
  if (req.user) {
    return res.redirect("/dashboard");
  }
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/dashboard", protect, (req, res) => {
  const user = req.user.toObject();
  if (!user) return res.redirect("/login");
  res.render("dashboard", { user, isAdmin: isAdmin(user) });
});

app.get("/catalog", protect, getBooks);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
  });
});

app.get("/create-book", protect, admin, (req, res) => {
  const user = req.user.toObject();
  res.render("create-book", { user, isAdmin: isAdmin(user) });
});

app.get("/edit-book/:id", protect, admin, async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).send("Book not found");
  res.render("edit-book", { book: book.toObject() });
});

app.get("/edit-review/:id", protect, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).send("Review not found");
  res.render("edit-review", { review: review.toObject() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
