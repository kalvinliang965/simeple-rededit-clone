// postRoutes.js, handle post-related routes

const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController.js");


// Get search post
router.get("/search/", postController.getSearchPosts);

router.get("/", postController.getAllPosts);

// get number of replies of post id
router.get("/:id/nreplies", postController.getnreplies);

// get community associated with this post
router.get("/:id/community", postController.getCommunity);

// get post after recursively referencing all comment at all depth.
router.get("/:id/dereferenceComments", postController.getPostWithComments);

router.get('/:id', postController.getPostByID);


// // add new post, which internally also update the community
router.post("/", postController.createNewPost);

// update specific post
router.put("/:postId", postController.updatePostInfo);


// get post by comment
router.get('/by-comment/:commentId', postController.getPostByComment);

module.exports = router;

//do we need a for create post validation?