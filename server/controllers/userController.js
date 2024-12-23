// userController.js

const userUtils = require("../utils/userUtils");
const postUtils = require ("../utils/postUtils.js");
const postSorter = require("../utils/postSorter.js");
const communityUtils = require("../utils/communityUtils.js");
const commentPostUtils = require("../utils/commentPostUtils.js");

// get user community posts
async function getAllPosts(req, res) {
    console.log("\n[INFO] getAllPosts for user");
    try {

        if (!req.session?.user) {
            return res.status(401).json({ error: 'User is not logged in' });
        }

        const { sortOrder } = req.query;
        
        if (!sortOrder) {
            return res.status(400).json({ error: "Missing 'sortOrder' query parameter" });
        }
        
        // Get user and user communities data
        const user = await userUtils.findUserById(req.session.user._id);
        if (!user) {
            console.error(`[ERROR] User not found`);
            return res.status(404).json({ error: "User not found!" });
        }
        await user.populate("communities");
        const userCommunitiesId = user.communities.map((community) => community._id);

        const allPosts = await postUtils.findAllPosts();

        const postCommunityMap = await Promise.all(
            allPosts.map(async (post) => ({
                postId: post._id,
                community: await communityUtils.findCommunityByPostId(post._id),
            }))
        );

        // filter user community post
        const filteredPosts = allPosts.filter((post) => {
            const community = postCommunityMap.find((entry) => entry.postId.equals(post._id))?.community;
            return community && userCommunitiesId.some((id) => id.equals(community._id)); 
        });


        console.log(`[INFO] Sorting posts by ${sortOrder}`);

        const userPostSorter = await postSorter.initializePostSorter(filteredPosts, sortOrder);
        filteredPosts.sort(userPostSorter);

        return res.json(filteredPosts);
    } catch (err) {
        console.error("[ERROR] Failed to fetch posts data from the database");
        console.error(`[ERROR] Message: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
}


async function registerUser(req, res) {
    console.log("\n[INFO] Registering user");

    try {
        const {newUser} = req.body;
        if (!newUser || typeof newUser !== "object") {
            return res.status(400).json({ error: "Invalid user data" });
        }

        // Call the utility function to create a user
        const savedUser = await userUtils.createUser(newUser);
        // Send success response
        res.status(201).json({ message: "User registered successfully", data: savedUser });
    } catch (err) {
        // Handle expected errors from userUtils
        if (err.field) {
            console.error(`[ERROR] Registration failed: ${err.message}`);
            return res.status(400).json({ field: err.field, error: err.message });
        }

        // Handle unexpected errors
        console.error(`[ERROR] Unexpected error during registration: ${err.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function loginUser(req, res) {
    console.log("\n[INFO] Logging in user");
    try {
        const {user} = req.body;

        // validate request body
        if (!user || typeof user !== "object") {
            return res.status(400).json({ error: "Invalid user data" });
        }

        const authenticatedUser = await userUtils.authenticateUser(user);
        
        await authenticatedUser.populate("posts");
        await authenticatedUser.populate("comments");
        await authenticatedUser.populate("communities");

        req.session.user = authenticatedUser;
        res.status(200).json(authenticatedUser);
    } catch (err) {
        if (err.field) {
            console.error(`[ERROR] Login failed: ${err.message}`);
            return res.status(400).json({ field: err.field, error: err.message });
        }
        console.error(`[ERROR] Unexpected error during Login: ${err.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }    
}

async function logoutUser(req, res) {
    try {

        // Check if user is already logged in
        if (!req.session || !req.session.id) {
            return res.status(400).json({error: "User is already logged out"});
        }

        // clear cookie
        res.clearCookie("connect.sid", {
            path: "/", // Match the path used when setting the cookie
            httpOnly: true,
            secure: true // Ensure this matches the original cookie settings
        });

        await req.session.destroy();

        res.status(204).end();
    } catch (error) {
        console.error(`[ERROR] Unexpected error during logout: ${error.message}`);
        res.status(500).json({error: "Internel Server Error"});
    }
}

// filter posts from user community where its
// title, content, comment contains the tokens 
async function getSearchPosts(req, res) {
    console.log(`[INFO] searchPost`);
    try {
        
        if (!req.session?.user) {
            return res.status(401).json({ error: 'User is not logged in' });
        }

        // Get user data and their communities
        const user = await userUtils.findUserById(req.session.user._id);
        await user.populate("communities");
        const userCommunitiesId = user.communities.map((community) => community._id);

        console.log(userCommunitiesId);

        // Get match posts
        const { searchString, sortOrder = "Newest" } = req.query;
        if (!searchString || !searchString.trim()) {
            console.log(`[INFO] No posts found for search string: "${searchString}"`);
            return res.json([]); // no result found; 
        }

        console.log(`[INFO] searchString: "${searchString}"`);
        const matchingPosts = await commentPostUtils.findPostsByTerms(searchString);
        
        // Fetch communities for all posts
        const postCommunityMap = await Promise.all(
            matchingPosts.map(async (post) => ({
                postId: post._id,
                community: await communityUtils.findCommunityByPostId(post._id),
            }))
        );
        
        // Filter posts by user communities
        const filteredPosts = matchingPosts.filter((post) => {
            const community = postCommunityMap.find((entry) => entry.postId.equals(post._id))?.community;
            return community && userCommunitiesId.some((id) => id.equals(community._id));
        });

        // sort the post
        const sorter = await postSorter.initializePostSorter(filteredPosts, sortOrder);
        filteredPosts.sort(sorter);

        console.log(`[INFO] Successfully sent posts data to the client`);
        res.json(filteredPosts);
    } catch (err) {
        console.error(`[ERROR] Failed to get post data: ${err}`);
        res.status(500).json({ error: err.message });
    }
}


async function updateUserInfo(req, res) {
    const { userId } = req.params;
    const updates = req.body;

    try {
        const updatedUser = await userUtils.updateUserById(userId, updates, {new: true});

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

async function getUserById(req, res) {
    

    const { userId } = req.params;
    const throwOnNotFound = req.query.throwOnNotFound === 'true'; 
    console.log(`[INFO] Getting user by userId ${userId}}`);
    try {
        const foundUser = await userUtils.findUserById(userId, throwOnNotFound);
      
        return res.status(200).json(foundUser);
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

async function getUserByDisplayName(req, res) {
    

    const { displayName } = req.params;
    const throwOnNotFound = req.query.throwOnNotFound === 'true'; 
    console.log(`[INFO] Getting user by displayname ${displayName}}`);
    try {
        const foundUser = await userUtils.findUserByDisplayName(displayName, throwOnNotFound);
      
        return res.status(200).json(foundUser);
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

// This function will search which user the comment belong to
const deleteCommentForUser = async (req, res) => {
    const { commentId } = req.params;
    console.log(`[INFO] Received request to delete comment with ID: ${commentId}`);
    
    try {
        const comment = await userUtils.deleteCommentWithReplies(commentId, true);        
        return res.status(200).end();
    } catch (error) {
        if (error.status === 404) {
            console.error(`[INFO] Comment with ID: ${commentId} not found.`);
            return res.status(404).json({ error: 'Comment not found', details: error.message });
        }

        console.error(`[ERROR] Failed to delete comment with ID: ${commentId}`, error);
        return res.status(500).json({ error: 'An error occurred while deleting the comment', details: error.message });
    }
}

const deletePostForUser = async (req, res) => {
    const { postId } = req.params;
    console.log(`[INFO] Recieveed request to delete post with ID: ${postId}`);
    try {
        await userUtils.deletePostWithComments(postId, true);
        return res.status(200).end();
    } catch (error) {
        if (error.status === 404) {
            console.error(`[INFO] post with ID: ${postId} not found.`);
            return res.status(404).json({ error: 'post not found', details: error.message });
        }
        console.error(`[ERROR] Failed to delete post with ID: ${postId}`, error);
        return res.status(500).json({ error: 'An error occurred while deleting the post', details: error.message });
    }
}

const deleteCommunityForUser = async (req, res) => {
    const { communityId } = req.params;
    console.log(`[INFO] Recieved request to delete communnity with ID: ${communityId}`);

    try {
        await userUtils.deleteCommunityWithPosts(communityId, true);
        return res.status(200).end();
    } catch (error) {
        if (error.status === 404) {
            console.error(`[INFO] community with ID: ${communityId} not found.`);
            return res.status(404).json({ error: 'community not found', details: error.message });
        }
        console.error(`[ERROR] Failed to delete community with ID: ${communityId}`, error);
        return res.status(500).json({ error: 'An error occurred while deleting the post', details: error.message });
    }

}

const getAllNonAdminUsers = async (req, res) => {
    console.log("\n[INFO] getAllUsers");
    try {
        const users = await userUtils.findAllUsers();
        const filteredUsers = users.filter(user => !user.admin);
        return res.status(200).json(filteredUsers);
    } catch (error) {
        console.error(`[ERROR] Failed to get all users`, error);
        return res.status(500).json({ error: 'An error occurred while fetching all users data', details: error.message });
    }

}

const deleteUserFromDB = async (req, res) => {
    console.log("\ndeleteUserFromDB");

    const { userId } = req.params;
    try {
        await userUtils.deleteUserAndAssociations(userId);
        return res.status(200).end();
    } catch (error) {
        if (error.status === 404) {
            console.error(`[INFO] community with ID: ${communityId} not found.`);
            return res.status(404).json({ error: 'community not found', details: error.message });
        }
        console.error(`[ERROR] Failed to remove user`, error);
        return res.status(500).json({ error: 'An error occurred while remove', details: error.message });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getAllPosts,
    logoutUser,
    getSearchPosts,
    updateUserInfo,
    getUserByDisplayName,
    deleteCommentForUser,
    deletePostForUser,
    deleteCommunityForUser,
    getUserById,
    getAllNonAdminUsers,
    deleteUserFromDB,
};