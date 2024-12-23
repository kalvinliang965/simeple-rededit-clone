const express = require("express");
const router = express.Router(); 
const userController = require("../controllers/userController.js");



function isAuthenticated(req, res, next) {
    console.log("Is Auth Session ID: ", req.session.id);
    console.log("Is Auth Session user: ", req.session.user);
    console.log("Session: ", req.session);
    if (req.session && req.session.user) {
      //Run next middle ware in chain
      next();
    } else {
      console.log(`[INFO] User not login yet`);
      //They are not authenticated but no errors, therefore a guest
      res.send(null);
    }
}

router.get("/allNonAdminUsers", userController.getAllNonAdminUsers);

// create new user
router.post("/register/", userController.registerUser);

// login user
router.post("/login/", userController.loginUser);

// logout user
router.post("/logout/", userController.logoutUser);

// get posts in communities user is in
router.get("/posts/",userController.getAllPosts);

// get user search posts
router.get("/posts/search", userController.getSearchPosts);

router.get("/userId/:userId", userController.getUserById);

// update specific user
router.put("/:userId", userController.updateUserInfo);

router.get('/:displayName', userController.getUserByDisplayName);


// delete comment for user
router.delete("/comments/:commentId", userController.deleteCommentForUser);
// delete post for user
router.delete("/posts/:postId", userController.deletePostForUser);
// delete community for user
router.delete("/communities/:communityId", userController.deleteCommunityForUser);
// delete user from database
router.delete("/userId/:userId", userController.deleteUserFromDB);

const userUtils = require("../utils/userUtils.js");

// get user info
router.get("/", isAuthenticated, async (req, res) => {
    console.log(`[INFO] User login`);

    try {
        // Retrieve the user by displayName
        const sessionUser = req.session.user;
        const user = await userUtils.findUserById(sessionUser._id, true);
        // update session user if they are different
        
        console.log(user);
        console.log("[INFO] Updating Session user");
        if (JSON.stringify(req.session.user) !== JSON.stringify(user)) {
          req.session.user = user;
        }
        
    } catch (error){

        if (error?.status === 404) {
            console.error(`[INFO] user with ID: ${req.session.user?._id || "unknown"} not found.`);
            return res.status(404).json({ error: 'User not found', details: error.message });
        }

        console.error(`[ERROR] Failed to update req.session.user: ${error.message}`);
        return res.status(500).json("Internal server error");
    }

    return res.send(req.session.user);
});

module.exports = router;

