// postController.js

const postUtils = require ("../utils/postUtils.js");
const postSorter = require("../utils/postSorter.js");
const commentUtils = require("../utils/commentUtils.js");
const communityUtils = require("../utils/communityUtils.js");
const commentPostUtils = require("../utils/commentPostUtils.js");
const userUtils = require("../utils/userUtils.js");
const  linkFlairUtils = require('../utils/linkFlairUtils');
const {findUserByDisplayName} = require("../utils/userUtils.js");
const mongoose = require("mongoose");


async function updatePostInfo(req, res) {
    const updates = req.body;
    const { postId } = req.params;
    try {
        // update post
        const updatedPost = await postUtils.updatePostById(postId, updates);
        console.log(`[INFO] updated post is successfully send to client`);
        res.json(updatedPost);
    } catch (error) {
        console.error("[ERROR] Failed to update post data to the database");
        console.error(`[ERROR] Message: ${error.message}`);
        res.status(500).json({ message: error.message });
    } 
}


async function createNewPost(req, res) {
    console.log("\n[INFO] createNewPost");

    const { post, communityID } = req.body;
    const createdPost = await postUtils.createPost(post);

    try {
        // Validate community existence
        console.log(`[INFO] Verifying community with ID: ${communityID}`);
        const community = await communityUtils.findCommunityById(communityID);
        if (!community) {
            console.error("[ERROR] Community not found");
            return res.status(404).json({ error: "Community not found" });
        }

        // adding to community
        const updatedPostIDs = [...community.postIDs, createdPost._id];
        await communityUtils.updateCommunityById(community._id, {postIDs: updatedPostIDs});
        
        // update user data
        const user = await findUserByDisplayName(post.postedBy, true);
        if (!user) {
            return res.status(404).json({ error: "Creator user not found" });
        }

        await userUtils.updateUserById(user._id, {posts: [...user.posts, createdPost]});

        res.status(201).json(createdPost);
    } catch (error) {
        console.error("[ERROR] Failed to create new post:", error.message);
        res.status(500).json({ error: error.message });
    }
}


async function getPostByID(req, res) {
    console.log("\n[INFO] getPostByID");
    try {
        const id = req.params.id;
        const post = await postUtils.findPostById(id, true);    
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({error: error.message});
    }
}

async function getAllPosts(req, res) {
    console.log("\n[INFO] getAllPosts");
    try {
        const { sortOrder } = req.query;
        console.log(`[DEBUG] ${sortOrder}`);
        const posts = await postUtils.findAllPosts();
        const sorter = await postSorter.initializePostSorter(posts, sortOrder);
        posts.sort(sorter);
        res.json(posts);
        console.log(`[INFO] Successfully sent posts data to the client`);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

// Function to get the number of replies for a post
async function getnreplies(req, res) {
    console.log("\n[INFO] getnreplies");
    try {
        const id = req.params.id;
        const post = await postUtils.findPostById(id);
        const count = await get_comment_count(post);
        console.log(`[INFO] Total number of comments: ${count}`);
        res.json(count);
        console.log(`[INFO] commentCount is send to the client`);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}


// Recursive helper function to count comments
async function get_comment_count_helper(commentID) {
    if (!mongoose.Types.ObjectId.isValid(commentID)) {
        return 0;
    }
    const comment = await commentUtils.findCommentById(commentID);
    if (!comment) {
        return 0;
    }
    let acc = 1; // Count the current comment
    for (let childCommentID of comment.commentIDs) {
        acc += await get_comment_count_helper(childCommentID);
    }
    return acc;
}

// Function to get the total comment count for a post
async function get_comment_count(post) {
    let acc = 0;
    for (let commentID of post.commentIDs) {
        acc += await get_comment_count_helper(commentID);
    }
    return acc;
}

// find community of current post
async function getCommunity(req, res) {
    console.log("\n[INFO] getCommunity");
    try {
        const postID = req.params.id;  
        console.log(`[INFO] Recieved postID: ${postID}`);

        if (!mongoose.Types.ObjectId.isValid(postID)) {
            console.error(`[ERROR] Invalid post ID: ${postID}`);
            res.status(STATUS.HTTP_STATUS_BAD_REQUEST).json({message: ERROR_POST_ID});
            return;
        }

        console.log(`[INFO] Finding community containing post ID ${postID}`);
        const community = await communityUtils.findCommunityByPostId(postID);
        if (!community) {
            console.error(`[ERROR] Community not found for post ID: ${postID}`);
            res.status(STATUS.HTTP_STATUS_NOT_FOUND).json({ message: communityUtils.ERROR_NOT_FOUND });
            return;
        }
        console.log("[INFO] community found");
        console.log(community);
        res.json(community);
    } catch (error) {
        res.status(404).json({error: error.message});
    }
}

// filter posts who's title, content, comment contains
// the tokens
async function getSearchPosts(req, res) {
    console.log(`[INFO] searchPost`);
    try {
        
        const { searchString, sortOrder } = req.query;
        
        if (searchString === undefined || searchString.length == 0) {
            console.log(`[INFO] No posts found for search string: ${searchString}`);
            res.json([]); // no result found
            return; 
        }

        console.log(`[INFO] searchString: ${searchString}`);
        const matchingPosts = await commentPostUtils.findPostsByTerms(searchString);
        
        const sorter = await postSorter.initializePostSorter(matchingPosts, sortOrder);
        matchingPosts.sort(sorter);
        console.log(`[INFO] Successfully sent posts data to the client`);
        res.json(matchingPosts);
    } catch (err) {
        console.error(`[ERROR] Failed to get post data: ${err}`);
        res.status(500).json({ error: err.message });
    }
}

// get post after recursive deference each commentIDs
// and map to a comments field
async function getPostWithComments(req, res) {
    console.log(`[INFO] getPostWithComments`);
    try {
        const id = req.params.id;
        const post = await commentPostUtils.getPostWithComments(id);
        res.json(post);
    } catch (err) {
        console.error(`[ERROR] Failed to get post data: ${err}`);
        res.status(500).json({ message: err.message });
    }
}


function containComment(commentId, comments) {
    if (!comments || comments.length === 0)
        return false;

    // Check if any top-level comment matches the commentId
    const foundAtCurrentLevel = comments.some((comment) => {
        return comment._id.toString() === commentId;
    });

    if (foundAtCurrentLevel) return true;

    // If not found at current level, recursively check children (commentIDs of each comment)
    for (let comment of comments) {
        if (containComment(commentId, comment.commentIDs)) {
            return true;
        }
    }

    return false;
}

async function getPostByComment(req, res) {
    const { commentId } = req.params;

    try {

        // retrieve all posts
        const posts = await postUtils.findAllPosts();

        // Dereference comments for all posts
        const dereferencedPosts = await Promise.all(
            posts.map(async (post) => await commentPostUtils.getPostWithComments(post._id))
        );

        // Check each post's comments to find if it contains the given commentId
        for (let post of dereferencedPosts) {
            const comments = post.commentIDs; 
            if (containComment(commentId, comments)) {
                return res.status(200).json(post);
            }
        }

        return res.status(404).json("Cannot find post associated with this comment");
        // // There are no post associated with this comment
        // return res.status(200).json(null);
    } catch (error) {
        console.error(`[ERROR] Unknown issue in finding post by given comment: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getAllPosts,
    getnreplies,
    getCommunity,
    getPostByID,
    getSearchPosts,
    updatePostInfo,
    getPostWithComments,
    getPostByComment,
    createNewPost,
};
