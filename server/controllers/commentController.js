// commentController.js


// const mongoose = require("mongoose");

// const Comment = require("../models/comments.js");


const postUtils = require("../utils/postUtils.js");

const commentUtils = require("../utils/commentUtils");
const {findUserByDisplayName} = require("../utils/userUtils.js");

async function getCommentById(req, res) {
    console.log("\n[INFO] getCommentByID");
    try {
        const id = req.params.commentId;
        const comment = await commentUtils.findCommentById(id, true);    
        res.json(comment);
    } catch (error) {
        res.status(404).json({error: error.message});
    }
}


async function getRepliesByCommentId(req, res) {
    console.log("\n[INFO] getCommentByID");
    try {
        const id = req.params.id;
        const comment = await commentUtils.findCommentById(id, true);    
        await comment.populate("commentIDs");
        const replies = comment.commentIDs || [];
        console.log(`[INFO] Successfully fetched ${replies.length} replies for comment ID: ${id}`);
        res.json(replies);
    } catch (error) {
        console.error(`[ERROR] Failed to fetch replies for comment ID: ${req.params.id}`, error.message);
        res.status(404).json({error: error.message});
    }
}

// async function getAllComments(req, res) {
//     console.log("\n[INFO] getAllComments");
//     try {
//         console.log("[INFO] Fetching all comments from the database");
//         console.log(Comment);
//         const comments = await Comment.find();
//         console.log(`[INFO] Retrieved ${comments.length} comments`);
//         console.log(comments);
//         res.json(comments);
//         console.log(`[INFO] Successfully send comments data to the client`);
//     } catch (err) {
//         console.error("[ERROR] Failed to fetch comments from the database");
//         console.error(`[ERROR] Message: ${err.message}`);
//         res.status(500).json({ message: err.message });
//     }
// };





// // creating comment for a post
// async function addComment(req, res) {
//     console.log("\n[INFO] createComment");

//     let savedComment = null;
//     try {
//         const { newComment, commentID, postID } = req.body;
//         savedComment = await commentUtils._createComment(newComment);
        
//         // Adding comment to another comment
//         if (commentID) {
//             console.log(`[INFO] Fetching comment data ${commentID}`);
//             const comment = await commentUtils._findCommentByID(commentID);
//             const updatedCommentIDs = [...comment.commentIDs, savedComment._id];
//             await commentUtils._updateCommentById(comment._id, { commentIDs: updatedCommentIDs });
//             console.log(`[INFO] Comment is added to be comment of another comment ${commentID}`);
//         } 
        
//         // Adding comment to a post
//         else if (postID) {
//             console.log(`[INFO] Fetching post data ${postID}`);
//             const post = await postUtils._findPostByID(postID);
//             const updatedCommentIDs = [...post.commentIDs, savedComment._id];
//             await postUtils._updatePostById(post._id, { commentIDs: updatedCommentIDs });
//             console.log(`[INFO] Comment is added to be comment of post ${postID}`);
//         } 
        
//         // Missing both `postID` and `commentID`
//         else {
//             console.error("[ERROR] Adding a new comment requires either a postID or commentID.");
//             res.status(STATUS.HTTP_STATUS_BAD_REQUEST)
//                .json({message: "Adding new comment without postID or commentID"});
//             return;
//         }

//         console.log(`[INFO] New comment created successfully and sent to client`);
//         res.json(savedComment);
//     } catch (error) {
//         // Attempt to delete the comment if it was created before the error occurred
//         if (savedComment) {
//             try {
//                 console.log(`[INFO] Rolling back: Deleting created comment due to error`);
//                 await commentUtils._deleteCommentById(savedComment._id);
//             } catch (deleteError) {
//                 console.error("[ERROR] Failed to delete comment after error:", deleteError);
//             }
//         }
//         console.error("[ERROR] Failed to add new comment to the database");
//         console.error(`[ERROR] Message: ${error.message}`);
//         res.status(500).json({ message: error.message });
//     }
// }

async function addComment(req, res) {
    console.log("\n[INFO] addComment");

    try {
        const { newComment, commentID, postID } = req.body;
        console.log('[INFO] Request Body:', req.body);
        // Retrieve the user by displayName
        const user = await findUserByDisplayName(newComment.commentedBy, true);
        if (!user) {
            return res.status(404).json({ error: "Creator user not found" });
        }

        
        if (!commentID && !postID) {
            console.error("[ERROR] Both commentID and postID are missing. Cannot associate the comment.");
            return res.status(400).json({ message: "Either postID or commentID must be provided." });
        }
        
        // Validate required fields
        if (!newComment || !newComment.content) {
            return res.status(400).json({ error: "Comment content is required." });
        }

        // Create the new comment
        const savedComment = await commentUtils.createComment(newComment);

        if (commentID) {
            // Adding the comment as a reply to another comment
            console.log(`[INFO] Adding comment as a reply to comment ID: ${commentID}`);
            const parentComment = await commentUtils.findCommentById(commentID);
            if (!parentComment) {
                return res.status(404).json({ error: "Parent comment not found." });
            }
            parentComment.commentIDs.push(savedComment._id);
            await parentComment.save();
            console.log(`[INFO] Reply successfully added to comment ID: ${commentID}`);
        } else if (postID) {
            // Adding the comment to a post
            console.log(`[INFO] Adding comment to post ID: ${postID}`);
            const post = await postUtils.findPostById(postID);
            if (!post) {
                return res.status(404).json({ error: "Post not found." });
            }
            post.commentIDs.push(savedComment._id);
            await post.save();
            console.log(`[INFO] Comment successfully added to post ID: ${postID}`);
        } else {
            console.log(`[INFO] Comment's postID or commentID does not provided`)
            return res.status(400).json({ error: "Either postID or commentID must be provided." });
        }
        // Update the user's posts fields
        user.comments.push(savedComment._id);
        await user.save();

        console.log(`[INFO] New community created and user updated successfully`);
        
        res.status(201).json(savedComment);
    } catch (error) {
        console.error("[ERROR] Failed to add comment:", error.message);
        res.status(500).json({ error: "Internal server error." });
    }
}

async function updateCommentInfo(req, res) {

    const { commentId } = req.params;
    const updates = req.body;
    try {
        const updatedComment = await commentUtils.updateCommentById(commentId, updates, {new: true});
        
        if (!updatedComment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        
        res.status(200).json(updatedComment);
    } catch (error) {
        console.error("[ERROR] Error updating comment:", error.message);
        res.status(500).json({ error: error.message });
    }
}



module.exports = {
    getCommentById,
    getRepliesByCommentId,
    updateCommentInfo,
    // getAllComments,
    addComment,
}
