// communityRoutes.js

const express = require('express');
const {
  getCommunityById,
  getAllCommunities,
  createNewCommunity,
  updateCommunityInfo,
  deleteCommunity,
  getPosts,
  addMemberToCommunity,
  removeMemberFromCommunity,
  checkCommunityNameExists,
} = require('../controllers/communityController');

const router = express.Router();

// Fetch all communities
router.get('/', getAllCommunities);

// Check if community name exists
router.get('/name/', checkCommunityNameExists)

// Given community, find all its post
router.get('/:id/posts', getPosts);

// Note: 
// we put existing resource in endpoint 
// new resource in param

// adding a new member to the community
// user id is inside params
router.put("/:communityId/add-members/members", addMemberToCommunity);

// deleting a member from the community
router.delete("/:communityId/delete-members/members/:userId", removeMemberFromCommunity);


// Fetch a specific community by ID
router.get('/:id', getCommunityById);



// Create a new community
router.post('/', createNewCommunity);

// Update a community by ID
router.put('/:communityId', updateCommunityInfo);

// Delete a community by ID
router.delete('/:id', deleteCommunity);




module.exports = router;
