import jwt from 'jsonwebtoken';

export const generateAcessToken = (user) => {
      console.log("Generating token for user:", user);
  console.log("JWT_SECRET in token fn:", process.env.JWT_SECRET);
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role || (user.isAdmin ? 'admin' : 'user'), // fallback if role missing
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1h' } // default 1h if not set
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' } // default 7d if not set
  );
};
