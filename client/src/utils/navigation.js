// navigation.js

// Custom hook providing navigation helper functions for different views.

import { useNavigate } from 'react-router-dom';
import { 
    getWelcomePath, 
    getHomePath, 
    getCommunityPath, 
    getPostPath, 
    getLoginPath, 
    getRegisterPath, 
    getErrorPath,
    getSearchPath,
    getProfilePath,
    getCommunityFormPath,
    getPostFormPath,
    getCommentFormPath,
    getErrorPathFull
} from '../routes/pathGenerators';

export const useNavigation = () => {
  const navigate = useNavigate();

  const navigateToCommunityPage = (id) => {
    console.log(`[INFO] Navigating to community page`);
    if (!id) throw new Error('Community ID is required for navigation');
    navigate(getCommunityPath(id));
  };

  const navigateToPostPage = (id) => {
    console.log(`[INFO] Navigating to post page`);
    if (!id) throw new Error('Post ID is required for navigation');
    navigate(getPostPath(id));
  };

  const navigateToHomePage = () => {
    console.log(`[INFO] Navigating to home page`);
    navigate(getHomePath());
  };

  const navigateToLoginPage = () => {
    console.log(`[INFO] Navigating to login page`);
    navigate(getLoginPath());
  }

  const navigateToRegisterPage = () => {
    console.log(`[INFO] Navigating to register page`);
    navigate(getRegisterPath());
  }

  const navigateToWelcomePage = () => {
    console.log(`[INFO] Navigating to welcome page`);
    navigate(getWelcomePath());
  }

  const navigateToErrorPage = (msg, status) => {
    console.log(`[INFO] Navigating to error page`);
    console.log(`[INFO] Message: ${msg}`);
    console.log(`[INFO] Status: ${status}`);
    navigate(getErrorPath(msg, status));
  }

  const navigateToSearchPage = (searchString) => {
    console.log(`[INFO] Navigating to search page: ${searchString}`);
    navigate(getSearchPath(searchString));
  }
  const navigateToProfilePage = (userId, adminView) => {
    console.log(`[INFO] Navigating to profile page: `);
    navigate(getProfilePath(userId, adminView));
  }

  /* Forms navigation */


  // Creating
  const navigateToNewCommunityPage = () => {
    console.log(`[INFO] Navigating to create community page`);
    navigate(getCommunityFormPath("", "create"));
  };

  const navigateToNewPostFormPage = () => {
    console.log(`[INFO] Navigating to create post page`);
    navigate(getPostFormPath("", "create"));
  };
  
  const navigateToNewCommentPage = (postId, commentId = null) => {
    console.log(`[INFO] Navigating to create comment page`);
    const mode = "create";
    if (commentId) {
      navigate(getCommentFormPath(postId, commentId, mode));
    } else {
      navigate(getCommentFormPath(postId, "", mode));
    }
  };
  

  // Editing
  const navigateToCommunityEditPage = (communityId) => {
    console.log(`[INFO] Navigating to edit community page for ID: ${communityId}`);
    if (!communityId) throw new Error('Community ID is required for navigation');
    navigate(getCommunityFormPath(communityId, "edit"));
  };
  

  const navigateToPostEditPage = (postId) => {
    console.log(`[INFO] Navigating to edit post page`);
    navigate(getPostFormPath(postId, "edit"));
  };

  const navigateToCommentEditPage = (postId, commentId) => {
    console.log(`[INFO] Navigating to edit comment page`);
    if (!commentId) throw new Error('Comment ID is required for navigation');
    navigate(getCommentFormPath(postId, commentId, "edit"));
  };
  
  const navigateBack = () => {
    console.log(`[INFO] Navigating back to previous page`);
    navigate(-1);
  }
  // ... Add more navigation functions as needed


  const navigateToErrorPageFull = (msg, status) => {
    console.log(`[INFO] Navigating to error page`);
    console.log(`[INFO] Message: ${msg}`);
    console.log(`[INFO] Status: ${status}`);
    navigate(getErrorPathFull(msg, status));
  }


  return {
    navigateToCommunityPage,
    navigateToNewCommunityPage,
    navigateToPostPage,
    navigateToHomePage,
    navigateToLoginPage,
    navigateToRegisterPage,
    navigateToWelcomePage,
    navigateToErrorPage,
    navigateToSearchPage,
    navigateToProfilePage,
    navigateToNewPostFormPage,
    navigateToNewCommentPage,
    navigateToCommunityEditPage,
    navigateToPostEditPage,
    navigateToCommentEditPage,
    navigateBack,
    navigateToErrorPageFull,
    // ... other functions
  };
};