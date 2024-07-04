
import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { create, deletepost, getPostOwner, getposts,  updatepost } from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', verifyToken, create);
router.get('/getposts', getposts);

router.delete('/deletepost/:postId/:userId', verifyToken, deletepost)
router.put('/updatepost/:postId/:userId', verifyToken, updatepost)

// Route to get post owner
router.get('/getPostOwner/:postId', getPostOwner);
export default router;
