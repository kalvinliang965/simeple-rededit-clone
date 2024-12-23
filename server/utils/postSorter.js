
const { findLatestComment } = require('./commentPostUtils.js');

// should not be use in router
async function initializePostSorter(posts, sortOrder) {

    if (!posts || !Array.isArray(posts)) {
        throw new Error("Invalid posts array");
    }

    if (sortOrder === "Newest") {
        return ((a, b) => b.postedDate - a.postedDate);
    } else if (sortOrder === "Oldest") {
        return ((a, b) => a.postedDate - b.postedDate);
    } else if (sortOrder === "Active") {
        // Fetch latest activity date for each post
        try {
            await Promise.all(
                posts.map(async (post) => {
                const latestComment = await findLatestComment(post._id);
                post.latestComment = latestComment;
            }));
        } catch (error) {
            console.error(`[ERROR] Failed to fetch latest comments: ${error.message}`);
            throw error;
        }
        

        // Sort posts based on latest activity date
        return ((a, b) => {
            const a_recent_comment_date = a.latestComment ? a.latestComment.commentedDate : null;
            const b_recent_comment_date = b.latestComment ? b.latestComment.commentedDate : null;
        
            if (a_recent_comment_date && b_recent_comment_date) {
                // Both posts have comments - sort by most recent comment date
                if (a_recent_comment_date !== b_recent_comment_date) {
                    return b_recent_comment_date - a_recent_comment_date;
                }
                // Tie-breaker: If same comment date, sort by most recent post date
                return b.postedDate - a.postedDate;
            }
            
            if (a_recent_comment_date) return -1; // 'a' has a recent comment, 'b' does not
            if (b_recent_comment_date) return 1;  // 'b' has a recent comment, 'a' does not
            
            // Neither have comments - no specific order needed, can return 0
            return 0;
        });
    } else {
        console.error(`[ERROR] Invalid sort type ${sortOrder}`);
        throw new Error(`Invalid sort type ${sortOrder}`);
    }
}


module.exports = {
    initializePostSorter
}