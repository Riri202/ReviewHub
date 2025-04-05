const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const registerUser = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({message: 'User already exists'});
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({message: 'Invalid user data'});
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
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({message: 'Invalid email or password'});
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('readingList');
    
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        readingList: user.readingList,
      });
    } else {
      res.status(404).json({message: 'User not found'});
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
      res.status(404).send({message: 'User not found'});
    }
    
    if (user.readingList.includes(bookId)) {
      res.status(400).send({message: 'Book already in reading list'});
    }
    
    user.readingList.push(bookId);
    await user.save();
    
    res.json({ message: 'Book added to reading list', readingList: user.readingList });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  addToReadingList,
};