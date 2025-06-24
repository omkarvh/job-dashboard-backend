import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { generateToken } from '../utils/generateToken.js';

export const registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO admins (username, password) VALUES ($1, $2) RETURNING id, username',
    [username, hashedPassword]
  );

  res.status(201).json({ message: 'Admin registered', admin: result.rows[0] });
};

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
  const admin = result.rows[0];
  if (!admin) return res.status(401).json({ message: 'Invalid username' });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(401).json({ message: 'Wrong password' });

  const token = generateToken(admin.id);

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true, // set true in production
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ message: 'Login successful' });
};
