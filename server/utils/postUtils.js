// postUtils.js

const Post = require("../models/posts.js");
const mongoose = require("mongoose");
const mongoUtils = require("./mongoUtils.js");

/**
 * Finds a post by ID.
 * @param {string} id - The ID of the post to find.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the post is not found.
 * @returns {Object|null} The found post, or null if not found.
 */
async function findPostById(id, throwOnNotFound = false) {
    console.log(`[INFO] Executing findPostById`);
    try {
        const post = await mongoUtils.findById(Post, id, throwOnNotFound);
        return post;
    } catch (error) {
        console.error(`[ERROR] Failed to find post with id: ${id}`, error);
        throw error;
    }
}

/**
 * Retrieves all posts.
 * @returns {Array} An array of all posts.
 */
async function findAllPosts() {
    console.log(`[INFO] Executing findAllPosts`);

    try {
        const posts = await Post.find();
        console.log(`[INFO] Retrieved ${posts.length} posts`);
        return posts;
    } catch (error) {
        console.error(`[ERROR] Failed to get all posts: `, error);
        throw error;
    }
}

/**
 * Updates a post by ID.
 * @param {string} id - The ID of the post to update.
 * @param {Object} fieldsToUpdate - The fields to update in the post.
 * @param {Object} [options={ new: true, runValidators: true }] - Update options.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the post is not found.
 * @returns {Object|null} The updated post, or null if not found.
 */
async function updatePostById(id, fieldsToUpdate, options = { new: true, runValidators: true }, throwOnNotFound = false) {
    console.log(`[INFO] Executing updatePostById`);
    try {
        const post = await mongoUtils.updateById(Post, id, fieldsToUpdate, options, throwOnNotFound);
        return post;
    } catch (error) {
        console.error(`[ERROR] Failed to update post with ID: ${id}`, error);
        throw error;
    }
}

/**
 * Creates a new post.
 * @param {Object} postObj - The data for the new post.
 * @returns {Object} The created post.
 */
async function createPost(postObj) {
    console.log(`[INFO] Executing createPost`);
    try {
        const post = await mongoUtils.createDocument(Post, postObj);
        return post;
    } catch (error) {
        console.error(`[ERROR] Failed to create new post: `, error);
        throw error;
    }
}


/**
 * Deletes a post by ID.
 * @param {string} id - The ID of the post to delete.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the post is not found.
 * @returns {Object|null} The deleted post, or null if not found.
 */
async function deletePostById(id, throwOnNotFound) {
    console.log(`[INFO] Executing deletePostById`);
    try {
        const post = await mongoUtils.deleteById(Post, id, throwOnNotFound);
        return post;
    } catch (error) {
        console.error(`[ERROR] Failed to delete post with ID: ${id}`, error);
        throw error;
    }
}



async function findById(model, id, throwOnNotFound = false) {
    console.log("[INFO] findByID");
    console.log(`[INFO] Searching ${model.modelName} with ID: ${id}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error("[ERROR] Invalid id:", id);
        return res.status(400).json({ error: "Invalid id" });
    }

    // if not found, it will return null
    const document = await model.findById(id);

    // Handle the case where no document is found
    if (!document) {
        console.log(`[INFO] ${model.modelName} not found.`);
        if (throwOnNotFound) {
            throw new Error(`${model.modelName} not found`);
        }
    } else {
        console.log(`[INFO] ${model.modelName} found:`, document);    
    }
    
    return document;
}

module.exports = {
    findPostById,
    findAllPosts,
    updatePostById,
    createPost,
    deletePostById,
};