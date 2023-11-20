const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { verifyJWT } = require('./auth');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/cookapi?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  confirmpassword: String,
});

const User = mongoose.model('User', userSchema);

// User registration route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, confirmpassword } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Validate the password and confirm password
    if (password !== confirmpassword) {
        return res.status(400).json({ message: "Passwords don't match" });
      }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      confirmpassword: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, 'shdfhksesfsetffsf', { expiresIn: '2h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user', verifyJWT, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if(!user) throw new Error('User not found');
    const { _id: id, name, email } = user;
    res.status(200).json({
      id,
      name,
      email,
    })
    next();
  } catch (error) {
    next(error);
  }
});

app.listen(5001, () => {
  console.log('Server running on port 5001');
});