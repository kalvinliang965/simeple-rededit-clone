const mongoose = require("mongoose");
const initializeDB = require("./utils/dbInitializer");
const userUtils = require("./utils/userUtils");
const communityUtils = require("./utils/communityUtils");
const postUtils = require("./utils/postUtils");
const commentUtils = require("./utils/commentUtils");
const mongodb_addr = "mongodb://127.0.0.1:27017/phreddit_test";

const adminCredentials = {
    displayName: "HoiFung",
    firstName: "Hoi",
    lastName: "Fung",
    email: "zoiye@gmail.com",
    password: "do_work!",
    createdDate: new Date("May 1, 200 09:32:00"),
}

let mongodb;

beforeAll(async () => {
    await mongoose.connect(mongodb_addr, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    mongodb = mongoose.connection;
    
        
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe("Post Deletion", () => {
    it("should remove all posts and its comments from the db", async () => {
        
        await mongodb.dropDatabase();
        await initializeDB(adminCredentials);

        const posts = await postUtils.findAllPosts();

        for (const post of posts) {
            const postId = post._id;
            const postedBy = post.postedBy;
            const commentIDs = post.commentIDs;

            // Delete the post and its comments
            await userUtils.deletePostWithComments(postId);

            // Check that all comments associated with this post are deleted
            for (const commentId of commentIDs) {
                const comment = await commentUtils.findCommentById(commentId, false);
                expect(comment).toBeNull(); 
            }

            // Ensure post owner dont have this post any more
            const user = await userUtils.findUserByDisplayName(postedBy, false);
            expect(user).not.toBeNull();
            expect(user.posts).not.toContainEqual(expect.objectContaining({ _id: postId }));
        }

        // Ensure no posts remain in the database
        const remainingPosts = await postUtils.findAllPosts();
        expect(remainingPosts.length).toBe(0);

    });

    it("should not affect users with no posts", async () => {
        await mongodb.dropDatabase();
        await initializeDB(adminCredentials);

        // Find a user with no posts
        const users = await userUtils.findAllUsers();
        const userWithNoPosts = users.find((user) => user.posts.length === 0);

        expect(userWithNoPosts).not.toBeNull();

        // Ensure the user's data remains intact
        const fetchedUser = await userUtils.findUserById(userWithNoPosts._id, false);
        expect(fetchedUser).not.toBeNull();
        expect(fetchedUser.posts.length).toBe(0);
    });
});

describe("User Deletion", () => {
    it("should delete a user and all their associations", async () => {
        // Reset database and initialize test data
        await mongodb.dropDatabase();
        await initializeDB(adminCredentials);

        // Retrieve all users, excluding admin
        const allUsers = await userUtils.findAllUsers();
        const nonAdminUsers = allUsers.filter((user) => !user.admin);

        // Get display names of non-admin users
        const userDisplayNameList = nonAdminUsers.map((user) => user.displayName);

        for (const userDisplayName of userDisplayNameList) {
            // Fetch user details by display name
            const user = await userUtils.findUserByDisplayName(userDisplayName);
            const userId = user._id;

            // Extract user associations with default fallbacks
            const userComments = user.comments || [];
            const userOwnedCommunities = user.ownedCommunities || [];
            const userCommunities = user.communities || [];
            const userPosts = user.posts || [];

            // Delete the user and their associations
            await userUtils.deleteUserAndAssociations(userId);

            // Helper function for verifying deletions
            const verifyDeletions = async (items, findByIdFn, itemType) => {
                for (const item of items) {
                    const foundItem = await findByIdFn(item._id, false);
                    expect(foundItem).toBeNull(); // Item should be deleted
                }
            };

            // Verify all associated data is deleted
            await verifyDeletions(userComments, commentUtils.findCommentById, "comment");
            await verifyDeletions(userPosts, postUtils.findPostById, "post");
            await verifyDeletions(userOwnedCommunities, communityUtils.findCommunityById, "owned community");

            // Verify other communities still exist
            const otherCommunities = userCommunities.filter(
                (community) =>
                    !userOwnedCommunities.some(
                        (ownedCommunity) => ownedCommunity._id.toString() === community._id.toString()
                    )
            );

            for (const otherCommunity of otherCommunities) {
                const foundCommunity = await communityUtils.findCommunityById(otherCommunity._id, false);
                expect(foundCommunity).not.toBeNull(); // Other communities should remain
            }
        }

        // Verify all non-admin users are deleted
        const remainingUsers = await Promise.all(
            nonAdminUsers.map((user) => userUtils.findUserById(user._id, false))
        );

        remainingUsers.forEach((user) => {
            expect(user).toBeNull(); // Non-admin users should be deleted
        });

        // Additional Verifications for Admin-Created Data
        const adminUser = allUsers.find((user) => user.admin);
        if (!adminUser) throw new Error("Admin user not found.");

        // Verify admin data still exists
        const verifyExistence = async (items, findByIdFn, itemType) => {
            for (const item of items) {
                const foundItem = await findByIdFn(item._id, false);
                expect(foundItem).not.toBeNull(); // Admin-created items should remain
            }
        };

        await verifyExistence(adminUser.posts || [], postUtils.findPostById, "admin post");
        await verifyExistence(adminUser.comments || [], commentUtils.findCommentById, "admin comment");
        await verifyExistence(adminUser.ownedCommunities || [], communityUtils.findCommunityById, "admin-owned community");
    });
});




describe("Community Deletion", () => {
    it("should remove all communities, their posts, and comments from the database", async () => {
        
        await mongodb.dropDatabase();
        await initializeDB(adminCredentials);

        // Retrieve all communities
        const communities = await communityUtils.findAllCommunities();

        for (const community of communities) {
            const communityId = community._id;
            const ownerName = community.owner;

            

            const postIDs = community.postIDs;
   
            // Delete the community and its posts
            await userUtils.deleteCommunityWithPosts(communityId);

            // Verify all posts associated with this community are deleted
            for (const postId of postIDs) {
                const post = await postUtils.findPostById(postId, false);
                expect(post).toBeNull(); 
            }

            // Verify the owner no longer has this community in their records
            const owner = await userUtils.findUserByDisplayName(ownerName, false);
            expect(owner).not.toBeNull(); // Owner should still exist
            expect(owner.ownedCommunities).not.toContainEqual(expect.objectContaining({ _id: communityId })); // Ensure not in ownedCommunities
            expect(owner.communities).not.toContainEqual(expect.objectContaining({ _id: communityId })); // Ensure not in communities
        }


        // Verify all communities are deleted
        const remainingCommunities = await Promise.all(
            communities.map(async (community) => 
                await communityUtils.findCommunityById(community._id, false)
            )
        );

        remainingCommunities.forEach((community) => {
            expect(community).toBeNull();
        });
    });
});



describe("Comment Deletion", () => {
    it("should remove all comments and its replies", async () => {
        
        await mongodb.dropDatabase();
        await initializeDB(adminCredentials);

        // Retrieve all communities
        const comments = await commentUtils.findAllComments();

        for (const comment of comments) {
            const commentId = comment._id;
            const commentedBy = comment.commentedBy;

   
            // Delete the community and its posts
            await userUtils.deleteCommentWithReplies(commentId);

            // Verify the commenter no longer has this comment in their records
            const owner = await userUtils.findUserByDisplayName(commentedBy, false);
            expect(owner).not.toBeNull(); 
            expect(owner.comments).not.toContainEqual(expect.objectContaining({ _id: commentId })); // Ensure not in ownedCommunities
        }


        // Verify all comments are deleted
        const remainingComments = await Promise.all(
            comments.map(async (comment) => 
                await commentUtils.findCommentById(comment._id, false)
            )
        );

        remainingComments.forEach((comment) => {
            expect(comment).toBeNull();
        });

        const communities = await communityUtils.findAllCommunities();
        expect(communities).not.toBeNull();
        expect(
            communities.commentIDs === null ||
            communities.commentIDs === undefined ||
            (Array.isArray(communities.commentIDs) && communities.commentIDs.length === 0)
        ).toBe(true);

        
        const posts = await postUtils.findAllPosts();
        expect(posts).not.toBeNull();
        expect(
            posts.commentIDs === null ||
            posts.commentIDs === undefined ||
            (Array.isArray(posts.commentIDs) && posts.commentIDs.length === 0)
        ).toBe(true);
    });
});