// commentUtils.js

const Comment = require("../models/comments.js");
const mongoUtils = require("./mongoUtils.js");

// This module contain all the utility function to be use in commentController

/**
 * Finds a comment by ID.
 * @param {string} id - The ID of the comment to find.
 * @param {boolean} throwOnNotFound - Whether to error if the comment is not found.
 * @returns {Object|null} The found comment or null if not found.
 * @throws Will throw an error if the comment is not found and throwOnNotFound is true.
 */
async function findCommentById(id, throwOnNotFound = false) {
    console.log("[INFO] Executing findCommentByID");
    try {   
        const comment = await mongoUtils.findById(Comment, id, throwOnNotFound);
        return comment;
    } catch (error) {
        console.error(`[ERROR] Failed to find comment with ID: ${id}`, error);
        throw error;
    }
    
}


/**
 * Retrieves all comments.
 * @returns {Array} An array of all comments.
 */
async function findAllComments() {
    console.log(`[INFO] Executing findAllComments`);

    try {
        const comments = await Comment.find();
        console.log(`[INFO] Retrieved ${comments.length} comments`);
        return comments;
    } catch (error) {
        console.error(`[ERROR] Failed to get all posts: `, error);
        throw error;
    }
}


/**
 * Creates a new comment.
 * @param {Object} commentObj - The data for the new comment.
 * @returns {Object}  The created element
 * @throws Will throw an error if the creation fails.
 */
async function createComment(commentObj) {
    console.log(`[INFO] Executing createComment`);
    try {
        const comment = await mongoUtils.createDocument(Comment, commentObj);
        return comment
    } catch (error) {
        console.error(`[ERROR] Failed to create comment: `, error);
        throw error;
    }
}


/**
 * Updates a comment by ID.
 * @param {string} id - The ID of the comment to update.
 * @param {Object} fieldsToUpdate - The fields to update in the comment.
 * @param {Object} [options={ new: true, runValidators: true }] - Update options.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the comment is not found.
 * @returns {Object|null} The updated comment, or null if not found.
 * @throws Will throw an error if the update fails.
 */
async function updateCommentById(id, fieldsToUpdate, options = { new: true, runValidators: true }, throwOnNotFound = false) {
    console.log(`[INFO] Executing updateCommentById`);
    try {
        const comment = await mongoUtils.updateById(Comment, id, fieldsToUpdate, options, throwOnNotFound);
        return comment;
    } catch (error) {
        console.error(`[ERROR] Failed to update comment with ID: ${id}`, error);
        throw error;
    }
}


/**
 * Deletes a comment by ID.
 * @param {string} id - The ID of the comment to delete.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the comment is not found.
 * @returns {Object|null} The deleted comment, or null if not found.
 * @throws Will throw an error if the deletion fails.
 */
async function deleteCommentById(id, throwOnNotFound = false) {
    console.log(`[INFO] Executing deleteCommentById`);
    try {
        const comment = await mongoUtils.deleteById(Comment, id, throwOnNotFound);
        return comment;
    } catch (error) {
        console.error(`[ERROR] Failed to delete comment with ID: ${id}`, error);
        throw error;
    }
}

module.exports = {
    findCommentById,
    createComment,
    updateCommentById,
    findAllComments,
    deleteCommentById,
}