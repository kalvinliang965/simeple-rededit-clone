// commentPostUtils.js

// this module contain helper function that needs helper function from 
// commentUtils and postUtils, which eliminate circular dependency.

const commentUtils = require("./commentUtils");
const postUtils = require("./postUtils");

// Should not be used in router
async function findLatestComment(postId) {
    async function helper(commentID) {
        const comment = await commentUtils.findCommentById(commentID);
        let ret = comment;
        for (let childCommentID of comment.commentIDs) {
            const recentComment = await helper(childCommentID);
            if (recentComment && recentComment.commentedDate > ret.commentedDate) {
                ret = recentComment;
            }
        }
        return ret;
    }
    console.log(`[INFO] Finding latest comment of post ${postId}`);
    const post = await postUtils.findPostById(postId);
    let ret = null;
    const commentIDs = post.commentIDs;
    for (let commentID of commentIDs) {
        const recentComment = await helper(commentID);
        if (!ret || (recentComment && recentComment.commentedDate > ret.commentedDate)) {
            ret = recentComment;
        }
    }
    return ret;
}

// expect single search string
async function findPostsByTerms(searchString) {
    console.log(`[INFO] findPostsByTerms`);

    if (!searchString) {
        throw new Error("search string is empty");
    }
    const searchTerms = searchString.split(" "); // get list of search terms
    console.log(`[INFO] Recieved terms "${searchTerms}"`);
    console.log(searchTerms);
    const posts = await postUtils.findAllPosts();
    const matchingPosts = []

    let found_match;
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        for (let j = 0; j < searchTerms.length; j++) {
            const term = searchTerms[j];
            found_match = await partial_match_helper(post, term);
            if (found_match) {
                matchingPosts.push(post);
                posts.splice(i, 1); //removes the element
                i--; // Adjust index after removal
                break; // exit inner loop we know this post matches
            }
        }
    }

    console.log(`\n[INFO] Found ${matchingPosts.length} matching post`);
    console.log(matchingPosts);
    return matchingPosts;
}

async function partial_match_helper(post, term) {
    term = term.toLowerCase();
    // check post title and post content
    if (post.title.toLowerCase().includes(term) || post.content.toLowerCase().includes(term)) return true;
    // check comments recursively
    const commentIDs = post.commentIDs;
    let found_match;
    for (let i = 0; i < commentIDs.length; ++i) {
        const id = commentIDs[i];
        const comment = await commentUtils.findCommentById(id);
        found_match = await search_comment_for_term(comment, term);
        if (found_match) return true;
    }
    return false;
}


async function search_comment_for_term(comment, term) {
    if (comment.content.toLowerCase().includes(term)) return true;
    let found_match;
    for (let commentID of comment.commentIDs) {
        const childComment = await commentUtils.findCommentById(commentID);
        found_match = await search_comment_for_term(childComment, term);
        if (found_match) 
            return true;
    }
    return false;
}


// Recursive function to populate comments
async function populateComments(comments) {
    if (!comments || comments.length === 0) return;

    await Promise.all(comments.map(async (comment) => {
        await comment.populate('commentIDs');

        comment.commentIDs.sort((a, b) => 
            b.commentedDate - a.commentedDate); 
        await populateComments(comment.commentIDs);
    }));
}

// Function to get a post with all comments populated recursively
async function getPostWithComments(postId) {
    
    const post = await postUtils.findPostById(postId);
    console.log(`[INFO] populating post comments`);
    await post.populate('commentIDs');

    post.commentIDs.sort((a, b) => 
                            b.commentedDate - a.commentedDate); 
    console.log(post);

    console.log(`[INFO] populating comments of comment`);
    await populateComments(post.commentIDs);
    console.log(post);
    return post;
}

module.exports = {
    findLatestComment,
    findPostsByTerms,
    getPostWithComments,
    populateComments,
}