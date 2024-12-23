
//communityController.js
const Community = require("../models/communities.js");
const{
    findCommunityById,
    createCommunity,
    updateCommunityById,
    deleteCommunityById,
    findCommunityByPostId,
} = require("../utils/communityUtils.js");

const {
    findUserById,
    updateUserById,
    findUserByDisplayName,
} = require("../utils/userUtils.js");
const postSorter = require("../utils/postSorter.js");

async function getCommunityById(req, res){
    try {
        console.log("[DEBUG] Community ID received:", req.params.id);
        const community = await findCommunityById(req.params.id, true);
        res.status(200).json(community);
    } catch (error){
        res.status(404).json({error: error.message});
    }
}

async function getAllCommunities(req, res){
    try {
        const communities = await Community.find({}).sort({startDate: -1});
        console.log(communities);
        res.status(200).json(communities);
    } catch (error){
        res.status(500).json({error: error.message});
    }
}

async function checkCommunityNameExists(req, res) {
    try {
        const { communityName } = req.query;
        console.log("Received communityName:", communityName);

        if (!communityName) {
            return res.status(400).json({ error: "communityName is required" });
        }

        // Find the community by its name from the query parameter
        const community = await Community.findOne({ name: communityName });

        // Respond based on whether the community exists
        if (community) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }

    } catch (error) {
        console.error(`[ERROR] Failed to check community name: ${error.message}`, error);
        res.status(500).json({ error: error.message });
    }
}


// Get all posts related to this community
async function getPosts(req, res) {
    console.log(`[INFO] getPosts`);
    try {
        console.log("[INFO] Fetching all Posts from the database");

        const { sortOrder } = req.query;
        const communityID = req.params.id;

        // Fetch the community and populate its posts
        const community = await findCommunityById(communityID);
        await community.populate('postIDs'); 

        const posts = community.postIDs.map(post => post.toObject());

        console.log(`[INFO] Retrieved ${posts.length} posts`);

        console.log(`[DEBUG] sortOrder: ${sortOrder}`);
        const sorter = await postSorter.initializePostSorter(posts, sortOrder);
        posts.sort(sorter);
        console.log(posts);
        res.json(posts);
        console.log(`[INFO] Successfully sent posts data to the client`);
    } catch (err) {
        console.error("[ERROR] Failed to fetch posts data from the database");
        console.error(`[ERROR] Message: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
}

async function createNewCommunity (req, res){
    console.log("[INFO] Request body:", req.body); 
    const {newCommunity} = req.body;

    try {
        // Retrieve the user by displayName
        const user = await findUserByDisplayName(newCommunity.creator, true);
        if (!user) {
            return res.status(404).json({ error: "Creator user not found" });
        }
        const community = await createCommunity (newCommunity);

        // Update the user's communities and ownedCommunities fields
        user.communities.push(community._id);
        user.ownedCommunities.push(community._id);
        await user.save();

        console.log(`[INFO] New community created and user updated successfully`);

        res.status(201).json(community);
    } catch (error){
        res.status(400).json({error: error.message});
    }
}

async function updateCommunityInfo(req, res){
    const { communityId } = req.params;
    const updates = req.body;

    try {
        const updatedCommunity = await updateCommunityById(communityId, updates, {new: true});
        res.status(200).json(updatedCommunity);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

async function deleteCommunity (req, res){
    const {id} = req.params;
    try {
        const deleteCommunity = await deleteCommunityById(id, true);
        res.status(200).json({message: 'Community deleted', data: deleteCommunity});
    } catch (error){
        res.status(400).json({error:error.message});
    }
}


async function removeMemberFromCommunity(req, res) {
    console.log("\n[INFO] removeUserFromCommunity");

    const { communityId, userId } = req.params;

    try {
        
        // Ensure IDs are provided
        if (!communityId) {
            return res.status(400).json({ error: "communityId not provided" });
        }
        if (!userId) {
            return res.status(400).json({error: "userId is not provided"});
        }

        // Fetch Community and User
        const community = await findCommunityById(communityId);
        if (!community) {
            return res.status(404).json({error: "Community not found"});
        }
        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({error: "user not found"});
        }

        // Ensure user is in the community
        const communityMembers = community.members || [];
        const userCommunitiesId = user?.communities.map(community => community._id) || [];

        if (!communityMembers.includes(user.displayName) || !userCommunitiesId.some((cid) => cid.equals(communityId))) {
            return res.status(404).json({ error: "User is not a member of the community" });
        }

        const updatedMembers = communityMembers.filter(member => member !== user.displayName);
        const updatedCommunitiesId = userCommunitiesId.filter(id => !id.equals(communityId));
        const [updatedCommunity] = await Promise.all([
            updateCommunityById(communityId, { members: updatedMembers }),
            updateUserById(userId, { communities: updatedCommunitiesId })
        ]);

        return res.status(200).json(updatedCommunity);
    } catch (error) {
        console.error("[ERROR] Failed to remove user from community", error);
        res.status(500).json({ error: "Internal server error" });
    }

}


async function addMemberToCommunity(req, res) {
    console.log("\n[INFO] addUserToCommunity");

    const { communityId } = req.params;
    const { userId } = req.body;

    try {
        
        if (!communityId) {
            return res.status(400).json({ error: "communityId not provided" });
        }
        if (!userId) {
            return res.status(400).json({error: "userId is not provided"});
        }

        const community = await findCommunityById(communityId);
        if (!community) {
            return res.status(404).json({error: "Community not found"});
        }

        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }

        // Ensure user is not already in the community
        const communityMembers = community.members || [];
        const userCommunitiesId = user?.communities.map(community => community._id) || [];

        if (userCommunitiesId.some((cid) => cid.equals(communityId)) || communityMembers.includes(user.displayName)) {
            return res.status(400).json({error: "User is already in the community"});
        }

        communityMembers.push(user.displayName);
        userCommunitiesId.push(communityId);

        // Update Community and User concurrently
        const [updatedCommunity] = await Promise.all([
            updateCommunityById(communityId, { members: communityMembers }),
            updateUserById(userId, { communities: userCommunitiesId })
        ]);
        
        return res.status(200).json(updatedCommunity);
    } catch (error) {
        console.error("[ERROR] Failed to add user to community", error);
        res.status(500).json({ error: "Internal server error" });
    }
}



module.exports = {
    getCommunityById,
    getAllCommunities,
    createNewCommunity,
    updateCommunityInfo,
    deleteCommunity,
    getPosts,
    removeMemberFromCommunity,
    addMemberToCommunity,
    checkCommunityNameExists,
};