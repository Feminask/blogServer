  
import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import e from "express";

// export const create = async (req, res, next) => {
//   if (!req.body.title || !req.body.content ) {
//     return next(errorHandler(400, 'Please provide all required fields'));
//   }

//   const slug = req.body.title
//     .split(' ')
//     .join('-')
//     .toLowerCase()
//     .replace(/[^a-zA-Z0-9-]/g, '');

//   const newPost = new Post({
//     ...req.body,
//     slug,
//     userId: req.user.id,
//   });

//   try {
//     const savedPost = await newPost.save();
//     res.status(201).json(savedPost);
//   } catch (error) {
//     next(error);
//   }
// };

export const create = async (req, res, next) => {
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }

  if (!req.user) {
    return next(errorHandler(401, 'User not authenticated'));
  }

  console.log('User object:', req.user); // Log the user object for debugging

  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');

  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user._id || req.user.id, // Try both _id and id
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error saving post:', error); // Log the full error
    next(error);
  }
};

// export const getposts = async (req, res, next) => {
//   try {
//     const startIndex = parseInt(req.query.startIndex) || 0;
//     const limit = parseInt(req.query.limit) || 9;
//     const sortDirection = req.query.order === 'asc' ? 1 : -1;
    
//     const queryOptions = {
//       ...(req.query.userId && { userId: req.query.userId }),
//       ...(req.query.category && { category: req.query.category }),
//       ...(req.query.slug && { slug: req.query.slug }),
//       ...(req.query.postId && { _id: req.query.postId }),
//       ...(req.query.searchTerm && {
//         $or: [
//           { title: { $regex: req.query.searchTerm, $options: 'i' } },
//           { content: { $regex: req.query.searchTerm, $options: 'i' } },
//         ],
//       }),
//     };

//     const posts = await Post.find(queryOptions)
//       .sort({ updatedAt: sortDirection })
//       .skip(startIndex)
//       .limit(limit)
//       .populate({
//         path: 'userId',
//         select: 'username', // Only retrieve the 'username' field
//       });

//     const totalPosts = await Post.countDocuments(queryOptions);

//     res.status(200).json({
//       posts,
//       totalPosts,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// Assuming you are using Express.js


export const getposts = async (req, res, next) => {
  try {
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    
    const queryOptions = {
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    };

    // Only apply admin filter if user is admin
    if (req.isAdmin) {
      delete queryOptions.userId; // Remove user ID filter for admins
    }

    const posts = await Post.find(queryOptions)
      .sort({ updatedAt: sortDirection })
      .populate({
        path: 'userId',
        select: 'username', // Only retrieve the 'username' field
      });

    const totalPosts = await Post.countDocuments(queryOptions);

    res.status(200).json({
      posts,
      totalPosts,
    });
  } catch (error) {
    next(error);
  }
};



// export const deletepost = async (req, res, next) => {
//   if (!req.user.isAdmin || req.user.id !== req.params.userId) {
//     return next(errorHandler(403, 'You are not allowed to delete this post'));
//   }
//   try {
//     await Post.findByIdAndDelete(req.params.postId);
//     res.status(200).json('The post has been deleted');
//   } catch (error) {
//     next(error);
//   }
// };


export const deletepost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    // Check if the current user is an admin or the creator of the post
    if (req.user.isAdmin || req.user.id === post.userId.toString()) {
      await Post.findByIdAndDelete(req.params.postId);
      res.status(200).json('The post has been deleted');
    } else {
      return next(errorHandler(403, 'You are not allowed to delete this post'));
    }
  } catch (error) {
    next(error);
  }
};

export const updatepost = async (req, res, next) => {
  try {
    // Fetch the post to get the user ID of the original poster
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }
    
    // Check if the user is either an admin or the original poster
    if (!req.user.isAdmin && req.user.id !== post.userId.toString()) {
      return next(errorHandler(403, 'You are not allowed to update this post'));
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
        },
      },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

export const getPostOwner = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ userId: post.userId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

