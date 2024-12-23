// pathGenerators.js

// Path generators for navigation to specific views in the application.

import { createFullPath } from './createFullPath';

export const getHomePath = () => createFullPath('/');

export const getCommunityPath = (id) => createFullPath(`/communities/${id}`);

export const getPostPath = (id) => createFullPath(`/posts/${id}`);

export const getErrorPath = (msg, status) => createFullPath(`/error/${msg}/${status}`);

export const getSearchPath = (searchString) => createFullPath(`/posts/search/${searchString}`);

export const getProfilePath = (userId, adminView) => createFullPath(`/profile/userId/${userId}/adminView/${adminView}`);

/* Forms */

// Open form for modifying/adding community
export const getCommunityFormPath = (communityId, mode) => 
    communityId
    ? createFullPath(`/communities/${communityId}/mode/${mode}`)
    : createFullPath(`/communities/mode/${mode}`);

// Open form for modifying/adding posts
export const getPostFormPath = (postId = "", mode = "create") =>
    postId 
      ? createFullPath(`/posts/${postId}/mode/${mode}`) 
      : createFullPath(`/posts/mode/${mode}`);

// Open form for modifying/adding comment for the post
export const getCommentFormPath = (postId = "", commentId = "", mode = "create") => {
    const basePath = postId ? `/posts/${postId}` : `/posts`;
    const commentPart = commentId ? `/comments/${commentId}` : `/comments`;
    return createFullPath(`${basePath}${commentPart}/mode/${mode}`);
};

/* Welcome page related */

// Standalone paths (not relative to APP_ROOT).
export const getLoginPath = () => "/login";
export const getRegisterPath = () => "/register";
export const getWelcomePath = () => "/";
export const  getErrorPathFull = (msg, status) => `/error/${msg}/${status}`;

// ... other path generators