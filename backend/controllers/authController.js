const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate token
const generateToken = (user) => {
  return user.generateJWT(); // method from User model
};


exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const allowedRoles = ['user', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      message: 'Login successful',
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('enrolledCourses.course', 'title thumbnail'); 

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      enrolledCourses: user.enrolledCourses 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
