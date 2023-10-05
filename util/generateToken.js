const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '20d',
    });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  } catch (error) {

    console.error('Token generation error:', error);
    
  }
};

module.exports = generateToken;
