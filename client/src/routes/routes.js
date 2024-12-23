// routes.js

// Static route paths for React Router's `path` attribute.

// react router uses relative path

export const ROUTES = {
  APP_BASE: "/phreddit",  
  
  /* take up full page */
  WELCOME: "/", // welcome default route
  LOGIN: "/login",
  REGISTER: "/register",

  HOME: '/',
  COMMUNITY: '/communities/:communityId',
  POST: '/posts/:postId',
  ERROR: '/error/:msg/:status',
  SEARCH: '/posts/search/:searchString?',
  PROFILE: '/profile/userId/:userId/adminView/:adminView?',
  
  // mode:
  //  -create: create new post/comment/community
  //  - edit: edit existing post/comment/community
  COMMUNITY_FORM: '/communities/:communityId?/mode/:mode',
  POST_FORM: '/posts/:postId?/mode/:mode',
  COMMENT_FORM: '/posts/:postId?/comments/:commentId?/mode/:mode',

  // ... other routes
};
