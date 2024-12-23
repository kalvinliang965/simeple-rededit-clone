// createFullPath.js

// Utility to construct full paths relative to the Phreddit base path.

import { APP_ROOT } from './basePath';

// remove extra back slash: '/phreddit//community/:id' -> '/phreddit/community/:id'
export const createFullPath = (subPath) =>
    `${APP_ROOT}${subPath}`.replace(/\/{2,}/g, '/');
  
