// communityUtils.js

const Community = require("../models/communities.js");
const mongoUtils = require("./mongoUtils.js");
const mongoose = require("mongoose");

// This module contains utility functions for use in communityController.


/**
 * Retrieves all communities.
 * @returns {Array} An array of all posts.
 */
async function findAllCommunities() {
    console.log(`[INFO] Executing findAllCommunities`);
    try {
        const communities = await Community.find();
        console.log(`[INFO] Retrieved ${communities.length} communities`);
        return communities;
    } catch (error) {
        console.error(`[ERROR] Failed to get all communities: `, error);
        throw error;
    }
}
/**
 * Finds a community by ID.
 * @param {string} id - The ID of the community to find.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the community is not found.
 * @returns {Object|null} The found community, or null if not found.
 * @throws Will throw an error if the community is not found and throwOnNotFound is true.
 */
async function findCommunityById(id, throwOnNotFound) {
    console.log(`[INFO] Executing findCommunityById`);
    try {
        const community = await mongoUtils.findById(Community, id, throwOnNotFound);
        return community;
    } catch (error) {
        console.error(`[ERROR] Failed to find community with ID: `, id);
        throw error;
    }
}

// async function findCommunityByPostId(postId, throwOnNotFound = false) {
//     console.log(`[INFO] Executing findCommunityByPostId for postId: ${postId}`);

//     try {
//         // Fetch all communities
//         const communities = await findAllCommunities();

//         // Find the community containing the given postId
//         const community = communities.find(
//             (community) => community.postIDs?.includes(postId)
//         );

//         if (!community) {
//             if (throwOnNotFound) {
//                 console.error(`[ERROR] Community not found for postId: ${postId}`);
//                 throw new Error("Community not found");
//             }
//             console.warn(`[WARN] No community found for postId: ${postId}`);
//             return null;
//         }

//         console.log(`[INFO] Community found for postId: ${postId}`, community);
//         return community;
//     } catch (error) {
//         console.error(`[ERROR] Failed to find community by postId: ${postId}`);
//         console.error(`[ERROR] Details: ${error.message}`);
//         throw error;
//     }
// }


/**
 * Finds a community by a post ID.
 * @param {string} postId - The ID of the post.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the community is not found.
 * @returns {Object|null} The found community, or null if not found.
 * @throws Will throw an error if the postId is invalid or if the community is not found and throwOnNotFound is true.
 */
async function findCommunityByPostId(postId, throwOnNotFound = false) {
    console.log(`[INFO] Excuting findCommunityByPostId`);
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        console.error(`[ERROR] Invalid postId format: ${postId}`);
        throw new Error(`Invalid postId format: ${postId}`);
    }

    try {
        const community = await Community.findOne({postIDs: postId});
        if (!community) {
            console.log(`[INFO] Community with postID ${postId} not found`);
            if (throwOnNotFound) {
                throw new Error(`Community with postID ${postId} not found`);
            }
        } else {
            console.log(`[INFO] Community with postID ${postId} found`);
        }
        return community;
    } catch (error) {
        console.error(`[ERROR] Failed to find community with post ID: `, postId);
        throw error;
    }
}


/**
 * Creates a new community.
 * @param {Object} communityObj - The data for the new community.
 * @returns {Object} The created community.
 * @throws Will throw an error if the creation fails.
 */
async function createCommunity(communityObj) {
    console.log(`[INFO] Executing createCommunity`);

    try {
        const community = await mongoUtils.createDocument(Community, communityObj);
        return community;
    } catch (error) {
        console.error(`[ERROR] Failed to create new community: `, error);
        throw error;
    }
}


/**
 * Updates a community by ID.
 * @param {string} id - The ID of the community to update.
 * @param {Object} fieldsToUpdate - The fields to update in the community.
 * @param {Object} [options={ new: true, runValidators: true }] - Update options.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the community is not found.
 * @returns {Object|null} The updated community, or null if not found.
 * @throws Will throw an error if the update fails.
 */
async function updateCommunityById(id, fieldsToUpdate, options = { new: true, runValidators: true }, throwOnNotFound = false) {
    console.log(`[INFO] Executing updateCommunityById`);
    try {
        const community = await mongoUtils.updateById(Community, id, fieldsToUpdate, options, throwOnNotFound);
        return community;
    } catch (error) {
        console.error(`[ERROR] Failed to update community with ID: ${id}`, error);
        throw error;
    }
}

/**
 * Deletes a community by ID.
 * @param {string} id - The ID of the community to delete.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the community is not found.
 * @returns {Object|null} The deleted community, or null if not found.
 * @throws Will throw an error if the deletion fails.
 */
async function deleteCommunityById(id, throwOnNotFound = false) {
    console.log(`[INFO] Executing deleteCommunityById`);
    try {
        const community = await mongoUtils.deleteById(Community, id, throwOnNotFound);
        return community;
    } catch (error) {
        console.error(`[ERROR] Failed to delete community with ID: ${id}`, error);
        throw error;
    }
}

module.exports = {
    findCommunityById,
    findCommunityByPostId,
    createCommunity,
    updateCommunityById,
    deleteCommunityById,
    findAllCommunities,
}
