// comment.js, handle comment-related routes

const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");


// route to get replies of comment
router.get('/:commentId/replies', commentController.getRepliesByCommentId);

// route to get a comment by id
router.get('/:commentId', commentController.getCommentById);

// // get all the comments
// router.get('/', commentController.getAllComments);

 // add new comment
router.post("/", commentController.addComment);

// update specific user
router.put("/:commentId", commentController.updateCommentInfo);

module.exports = router;