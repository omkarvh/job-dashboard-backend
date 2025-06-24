import express from 'express';
import { registerAdmin, loginAdmin } from '../controllers/authController.js';
import jwt from "jsonwebtoken";

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

router.get("/check", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ loggedIn: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ loggedIn: true, admin: decoded });
  } catch (err) {
    res.status(401).json({ loggedIn: false });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None"
  });
  res.json({ message: "Logged out successfully" });
});



export default router;
