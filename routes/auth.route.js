// server/routes/auth.route.js

import express from 'express';
import { google, signin, signup } from '../controllers/auth.controller.js'; // Ensure the path is correct and includes .js

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google',google)

export default router;
