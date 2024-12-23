// userUtils.js


const communityUtils = require("../utils/communityUtils");
const postUtils = require("../utils/postUtils");
const commentUtils = require("../utils/commentUtils");
const mongoUtils = require("./mongoUtils");
const User = require("../models/users");
const bcrypt = require("bcrypt");

/**
 * Creates a new user.
 * @param {Object} userObj - The user object containing user details.
 * @returns {Object} The created user document.
 * @throws Will throw an error if the user is an admin and an admin already exists, or if the password is not provided.
 */
async function createUser(userObj) {
    console.log(`[INFO] Executing createUser`);
    try {
        // Check if creating a new admin
        if (userObj.admin) {
            const admin = await User.findOne({displayName: "admin"});
            if (admin) {
                console.error(`[ERROR] Admin already exists`);
                const error = new Error("Admin already exists");
                error.code = 400; // Bad request
                error.field = "admin";
                throw error;
            } 
        }

        // check if displayName and email already exist
        const [existingDisplayName, existingEmail] = await Promise.all([
            User.findOne({displayName: userObj.displayName}),
            User.findOne({email: userObj.email}),
        ]);
        
        if (existingEmail) {
            console.log(`[INFO] Email already exists: ${existingEmail.email}`);
            const error = new Error("Email already exists");
            error.code = 400; // Bad Request
            error.field = "email";
            throw error;
        }

        if (existingDisplayName) {
            console.log(`[INFO] Display Name already exists: ${existingDisplayName.displayName}`);
            const error = new Error("Display name already exists");
            error.code = 400;
            error.field = "displayName";
            throw error;
        }

        
        
        // Ensure password is provided
        const password = userObj.password;
        if (!password) {
            console.error(`[ERROR] Password not provided`);
            const error = new Error("User password not provided");
            error.status = 400; // Bad Request
            error.field = "password";
            throw error;
        }

        // Hash the password
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        userObj.password = passwordHash;

        // Create the user
        const user = await mongoUtils.createDocument(User, userObj);
        console.log(`[INFO] User created successfully: ${user.displayName}`);
        return user
    } catch (error) {
        console.error(`[ERROR] Failed to create user:`, error);
        throw error;
    }
}


/**
 * Updates a user by ID.
 * @param {string} id - The ID of the user to update.
 * @param {Object} fieldsToUpdate - The fields to update in the user document.
 * @param {Object} [options={ new: true, runValidators: true }] - Update options.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the user is not found.
 * @returns {Object|null} The updated user document, or null if not found.
 * @throws Will throw an error if attempting to modify the admin status.
 */
async function updateUserById(id, fieldsToUpdate, options = { new: true, runValidators: true }, throwOnNotFound = false) {
    console.log(`[INFO] Executing updateUserById`);
    try {
        if (fieldsToUpdate.admin) {
            console.error(`[CRITICAL] Unauthorized attempt to modify admin identity detected`);
            throw new Error("Attempting to modify admin identity detected");
        }

        const user = await mongoUtils.updateById(User, id, fieldsToUpdate, options, throwOnNotFound);
        return user;
    } catch (error) {
        console.error(`[ERROR] Failed to update User with ID: ${id}`, error);
        throw error;
    }
}


/**
 * Deletes a user by ID.
 * @param {string} id - The ID of the user to delete.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the user is not found.
 * @returns {Object|null} The deleted user document, or null if not found.
 * @throws Will throw an error if attempting to delete an admin.
 */
async function deleteUserById(id, throwOnNotFound = false) {
    console.log(`[INFO] Executing deleteUserById`);
    try {
        const user = await mongoUtils.findById(User, id, throwOnNotFound);
        if (user.admin) {
            console.error(`[CRITICAL] Attempt to delete admin account: Operation blocked.`);
            throw new Error("Attempting to delete the admin account is strictly prohibited.");
        }
        const deletedUser = await mongoUtils.deleteById(User, id, throwOnNotFound);
        return deletedUser;
    } catch (error) {
        console.error(`[ERROR] Failed to delete user with ID: ${id}`, error);
        throw error;
    }
}


async function authenticateUser(userObj) {
    console.log(`[INFO] Authenticating user`);
    
    try {

        // each user have unique display and email
        const {email, password} = userObj;

        if (!email || !password) {
            const error = new Error("Email and password are required");
            error.code = 400;
            error.field = !email ? "email" : "password";
            throw error;
        }

        const existingUser = await User.findOne({ email: email });

        if (!existingUser) {
            console.log(`[INFO] User does not exist: ${email}`);
            const error = new Error("User with given email does not exists");
            error.code = 400;
            error.field = "email";
            throw error;
        }

        const verdict = await bcrypt.compare(password, existingUser.password);
        
        if (verdict) {
            console.log(`[INFO] User found: ${existingUser.displayName}`);
            return existingUser;
        } else {
            console.error(`[ERROR] Password does not match`);
            const error = new Error("Password does not match");
            error.code = 400;
            error.field = "password";
            console.error(`[ERROR] ${password}`);
            throw error;
        }
    } catch (error) {
        console.error(`[ERROR] Failed to create user:`, error);
        throw error;
    }
    
}

async function findAllUsers() {
    console.log("[INFO] Executing findUserByID");
    try {   
        const users = await User.find()
                            .populate('posts')
                            .populate('communities')
                            .populate('comments')
                            .populate("ownedCommunities");

        console.log(`[INFO] Retrieved ${users.length} users`);
        return users;
    } catch (error) {
        console.error(`Internal Server error`, error);
        throw error;
    }
}

async function findUserById(id, throwOnNotFound = false) {
    console.log("[INFO] Executing findUserByID");
    try {   
        const user = await mongoUtils.findById(User, id, throwOnNotFound);

        if (!user) {
            return null;
        }
        await user.populate("comments");
        await user.populate("posts");
        await user.populate("communities");
        await user.populate("ownedCommunities");

        return user;
    } catch (error) {
        console.error(`[ERROR] Failed to find user with ID: ${id}`, error);
        throw error;
    }
}


async function findUserByDisplayName(displayName, throwOnNotFound = false) {
    console.log(`[INFO] Searching for user with displayName: ${displayName}`);

    try {   
        if (!displayName) {
            throw new Error("DisplayName is required but was not provided");
        }

        const user = await User.findOne({ displayName });

        if (!user) {
            if (throwOnNotFound) {
                const error = new Error("User not found");
                error.code = 404;
                console.error(`[ERROR] ${password}`);
                throw error;
            }
            return null;
        }
        await user.populate("comments");
        await user.populate("posts");
        await user.populate("communities");
        await user.populate("ownedCommunities")

        if (!user && throwOnNotFound) {
            throw new Error(`User with displayName '${displayName}' not found`);
        }

        return user;
    } catch (error) {
        console.error(`[ERROR] Failed to find user with displayName: ${displayName}`, error.message);
        throw error; 
    }
}


/**
 * Recursively deletes a comment and all its replies by ID.
 * @param {string} commentId - The ID of the comment to delete.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the comment is not found.
 * @returns {Promise<void>} Resolves if successful.
 * @throws Will throw an error if the deletion fails.
 */
async function deleteCommentWithReplies(commentId, throwOnNotFound = false) {
    console.log(`[INFO] Starting recursive deletion for comment ID: ${commentId}`);
    try {

       // Find the comment
       const comment = await commentUtils.findCommentById(commentId, throwOnNotFound);

       const replyIDs = comment.commentIDs;

       // Recursively delete replies
       await Promise.all(replyIDs.map(replyID => deleteCommentWithReplies(replyID, throwOnNotFound)));

       // Delete the comment and update references
       await deleteCommentAndCleanupReferences(commentId, throwOnNotFound);
    } catch (error) {
        console.error(`[ERROR] Failed to delete comment with ID: ${commentId}`, error);
        throw error;
    }
}


/**
 * Deletes a comment by ID and updates all associated references.
 * @param {string} commentId - The ID of the comment to delete.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the comment is not found.
 * @returns {Promise<void>} Resolves if successful.
 * @throws Will throw an error if the deletion fails.
 */
async function deleteCommentAndCleanupReferences(commentId, throwOnNotFound = false) {
    console.log(`[INFO] Deleting comment ID: ${commentId} and cleaning up references`);
    try {
        
        await commentUtils.deleteCommentById(commentId, throwOnNotFound);

        // remove the comment it is replying to
        const allComments = await commentUtils.findAllComments();
        await Promise.all(allComments.map(async (cm) => {
            if (cm.commentIDs.includes(commentId)) {
                const updatedCommentIDs = cm.commentIDs.filter((cid) => !cid.equals(commentId));
                await commentUtils.updateCommentById(cm._id, { commentIDs: updatedCommentIDs });
            }
        }));
        
        // Remove references from posts
        const allPosts = await postUtils.findAllPosts();
        await Promise.all(allPosts.map(async (post) => {
            if (post.commentIDs.includes(commentId)) {
                const updatedCommentIDs = post.commentIDs.filter((cid) => !cid.equals(commentId));
                await postUtils.updatePostById(post._id, { commentIDs: updatedCommentIDs });
            }
        }));
        
        // Remove references from users
        const allUsers = await findAllUsers();
        await Promise.all(allUsers.map(async (user) => {
            const updatedCommentIDs = user.comments.filter((comment) => !comment._id.equals(commentId));
            await updateUserById(user._id, { comments: updatedCommentIDs.map(c => c._id) });
        }));

    } catch (error) {
        console.error(`[ERROR] Failed to delete comment with ID: ${commentId}`, error);
        throw error;
    }
}

/**
 * Deletes a post by ID, including all its associated comments.
 * @param {string} postId - The ID of the post to delete.
 * @throws Will throw an error if the deletion fails.
 */
async function deletePostWithComments(postId) {
    console.log(`[INFO] Deleting post ID: ${postId} and its associated comments`);
    try {
        const post = await postUtils.findPostById(postId, true);
        const postedBy = post.postedBy;
        const user = await findUserByDisplayName(postedBy, false);
        if (!user) {
            console.error(`[ERROR] Post creator does not exist`);
            const error = new Error(`Creator for postID: ${postId} not found`);
            error.status = 404;
            throw error;
        }

        const commentIds = post.commentIDs;

        await Promise.all(commentIds.map(commentId => deleteCommentWithReplies(commentId, true)));

        // Delete the post from post schema
        await postUtils.deletePostById(post._id, true);

        // update its community
        const community = await communityUtils.findCommunityByPostId(post._id, true);
        const updatedCommunityPostIDs = community.postIDs.filter((postId) => !postId.equals(post._id));
        await communityUtils.updateCommunityById(community._id, {postIDs: updatedCommunityPostIDs});

        // Remove the post reference from the user's posts
        const allUsers = await findAllUsers();
        await Promise.all(allUsers.map(async user => {
            const userPosts = user.posts;
            const updatedUserPosts = userPosts.filter(post => !post._id.equals(postId));
            await updateUserById(user._id, {posts: updatedUserPosts});
        }));
        

    } catch (error) {
        console.error(`[ERROR] Failed to delete post with ID: ${postId}`, error);
        throw error;
    }
}


/**
 * Deletes a community and all its associated posts (and their comments).
 * @param {string} communityId - The ID of the community to delete.
 * @throws Will throw an error if the deletion fails.
 */
async function deleteCommunityWithPosts(communityId) {
    console.log(`[INFO] Deleting community ID: ${communityId} and its associated posts`);
    try {
        // Find the community and its associated posts
        const community = await communityUtils.findCommunityById(communityId, true);
        const postIds = community.postIDs; 
        const owner = community.owner;
        const user = await findUserByDisplayName(owner);
        if (!user) {
            console.warn(`[WARN] Community owner does not exist`);
            const error = new Error(`Owner for communityID: ${communityId} not found`);
            error.status = 404;
            throw error;
        }

        // Delete all posts and their associated comments
        await Promise.all(postIds.map(postId => deletePostWithComments(postId)));

        // Delete the community from community schema
        await communityUtils.deleteCommunityById(communityId, true);

        // Remove the community reference from the user's communities and owned communities
        const allUsers = await findAllUsers();
        await Promise.all(allUsers.map(async (user) => {
            const userCommunity = user.communities;
            const userOwnedCommunity = user.ownedCommunities;
            const updatedUserCommunity = userCommunity.filter(community => !community._id.equals(communityId));
            const updatedUserOwnedCommunity = userOwnedCommunity.filter(community => !community._id.equals(communityId));
            await updateUserById(user._id, {
                communities: updatedUserCommunity, 
                ownedCommunities: updatedUserOwnedCommunity
            });
        }));        
    } catch (error) {
        console.error(`[ERROR] Failed to delete community with ID: ${communityId}`, error);
        throw error;
    }
}

/**
 * Removes all associations related to a user (e.g., posts, comments, communities).
 * @param {string} userId - The ID of the user whose associations need to be removed.
 * @returns {Promise<void>} Resolves if the operation succeeds, throws an error otherwise.
 */
async function deleteUserAndAssociations(userId) {
    try {
        
        const user = await findUserById(userId, true);

        const ownedCommunities = user.ownedCommunities;
        const communities = user.communities;
        const posts = user.posts;
        const comments = user.comments;
        
        await Promise.all(comments.map(async (comment) => {
            await deleteCommentWithReplies(comment._id);
        }));

        await Promise.all(posts.map(async (post) => {
            await deletePostWithComments(post._id);
        }));

        await Promise.all(ownedCommunities.map(async (community) => {
            await deleteCommunityWithPosts(community._id);
        }));


        const otherCommunities = communities.filter((community) => {
            return !ownedCommunities.some(ownedCommunity => ownedCommunity._id.equals(community._id));
        })
        await Promise.all(otherCommunities.map(async (community) => {
            const updatedMembers = community.members.filter((member) => member !== user.displayName);
            const updatedPosts = community.postIDs.filter((postId) => {
                return !posts.some(userPost => userPost._id.equals(postId));
            });
            await communityUtils.updateCommunityById(community._id, {
                members: updatedMembers,
                postIDs: updatedPosts,
            });
        }));


        await deleteUserById(user._id, true);

    } catch (error) {
        console.error(`[ERROR] Failed to remove associations for user ID: ${userId}`, error);
        throw error;
    }
}

module.exports = {
    createUser,
    updateUserById,
    deleteUserById,
    authenticateUser,
    findUserById,
    findUserByDisplayName,
    findAllUsers,
    deleteCommentWithReplies,
    deletePostWithComments,
    deleteCommunityWithPosts,
    deleteUserAndAssociations,
};


