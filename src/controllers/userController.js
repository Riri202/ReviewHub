const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const generateToken = (id, res) => {
  const token = jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 3600000, // 1 hour
  });

  return token;
};


const registerUser = async (req, res) => {
  const { name, email, password, role = "user" } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      // req.session.user = {
      //   _id: user._id,
      //   name: user.name,
      //   email: user.email,
      //   role: user.role,
      // };

      generateToken(user._id, res);

      res.redirect("/dashboard");
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // req.session.user = {
      //   _id: user._id,
      //   name: user.name,
      //   email: user.email,
      //   role: user.role,
      // };

      generateToken(user._id, res);

      res.redirect("/dashboard");
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};


const logout = (req, res) => {
  res.clearCookie('token');
  req.session.user = null;
  res.redirect("/login");
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("readingList");

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        readingList: user.readingList,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const addToReadingList = async (req, res) => {
  const { bookId } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).send({ message: "User not found" });
    }

    if (user.readingList.includes(bookId)) {
      res.status(400).send({ message: "Book already in reading list" });
    }

    user.readingList.push(bookId);
    await user.save();

    // res.json({
    //   message: "Book added to reading list",
    //   readingList: user.readingList,
    // });
    res.redirect(`/api/books/${bookId}`)
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeFromReadingList = async (req, res) => {
  const { bookId } = req.body;

  if (!bookId) {
    return res.status(400).send({ message: "bookId is required" });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const index = user.readingList.findIndex(
      id => id.toString() === bookId.toString()
    );

    if (index < 0) {
      return res.status(400).send({ message: "Book not found in reading list" });
    }

    user.readingList.splice(index, 1);
    await user.save();

    res.redirect(`/api/books/${bookId}`);
  } catch (error) {
    console.error("Failed to remove book from reading list:", error);
    res.status(400).json({ message: error.message });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  addToReadingList,
  logout,
  removeFromReadingList
};
