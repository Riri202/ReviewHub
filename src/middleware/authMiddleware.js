const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { isAdmin } = require("../utils");

const protect = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");
  {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id)
        .select("-password")
        .populate("readingList");
      req.user = user;

      next();
    } catch (error) {
      res.status(401).send({ message: "Not authorized, token failed" });
    }
  }
};

const admin = (req, res, next) => {
  if (req.user && isAdmin(req.user)) {
    next();
  } else {
    res.status(403).send({ message: "Not authorized as an admin" });
  }
};

module.exports = { protect, admin };
