import Post from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Tạo post mới (chỉ tutor)
const createPost = async (req, res) => {
  try {
    console.log("createPost called with user:", req.user);
    const { title, content, images, tags } = req.body;
    const author = req.user.id; // Từ JWT middleware

    if (req.user.role !== "tutor") {
      return res.status(403).json({ message: "Only tutors can create posts" });
    }

    const newPost = new Post({
      title,
      content,
      author,
      images: images || [],
      tags: tags || [],
    });

    console.log("Saving post:", newPost);
    await newPost.save();
    console.log("Post saved successfully");
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy tất cả posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "_id firstName lastName")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy post theo ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Populate author safely
    let populatedPost = post;
    try {
      populatedPost = await Post.findById(req.params.id).populate(
        "author",
        "_id firstName lastName"
      );
    } catch (populateError) {
      console.warn("Failed to populate author:", populateError.message);
      // Return post without author if populate fails
    }

    res.json(populatedPost || post);
  } catch (error) {
    console.error("Error in getPostById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cập nhật post (chỉ author)
const updatePost = async (req, res) => {
  try {
    const { title, content, images, tags } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.images = images || post.images;
    post.tags = tags || post.tags;
    post.updatedAt = Date.now();

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Upload ảnh
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary from buffer
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "posts" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

export { createPost, getPosts, getPostById, updatePost, uploadImage };
