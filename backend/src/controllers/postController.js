import Post from "../models/Post.js";

// Tạo post mới (chỉ tutor)
const createPost = async (req, res) => {
  try {
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

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy tất cả posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "firstName lastName")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy post theo ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "firstName lastName"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
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

// Xóa post (chỉ author)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.remove();
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { createPost, getPosts, getPostById, updatePost, deletePost };
