const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  const idToken = req.headers.authorization?.split(' ')[1];

  if (!idToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, name, email, picture } = decoded;

    let user = await User.findOne({ uid });

    if (!user) {
      user = await User.create({
        uid,
        name: name || email.split('@')[0], // fallback if displayName is missing
        email,
        photoURL: picture,
      });
      console.log(`🆕 New user created: ${user.email}`);
    } else {
      console.log(`👤 Existing user logged in: ${user.email}`);
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("❌ Error verifying Firebase token:", err.message);
    res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
});

module.exports = router;
