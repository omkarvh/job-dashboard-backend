import jwt from 'jsonwebtoken';

export const generateToken = (adminId) => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};
