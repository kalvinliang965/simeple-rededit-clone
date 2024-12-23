// NewCommentPage.jsx

import config from "../../config.js";
import axios from 'axios';
import { useState, useContext, useEffect } from "react";
import { useNavigation } from "../../utils/navigation.js";
import { LoginContext } from "../../App.js";
import {LoadingSpinner} from "./PageCreater.jsx";
import { useParams } from "react-router-dom";

function CommentPageForm() {
    const { currentUser, incrementUserDataVersion } = useContext(LoginContext);
    const { navigateToPostPage, navigateToErrorPage, navigateBack } = useNavigation();

    const [loading, setLoading] = useState(false);

    const { postId, commentId, mode } = useParams();   

    const [error, setError] = useState("");
    const [commentContent, setCommentContent] = useState("");

    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        
        if (mode === "edit") {
            setIsEditMode(true);
            
            (async function fetchCommentData() {
                setLoading(true);
                try {
                    const res = await axios.get(`${config.api_base_url}/comments/${commentId}`);
                    setCommentContent(res.data.content);
                } catch (error) {
                    console.error("[ERROR] Error fetching content of comment in comment form edit mode: ", error.message);
                    navigateToErrorPage("Error fetching content of comment in comment form edit mode", error.message);
                } finally {
                    setLoading(false);
                }
            })();
        } else
            setIsEditMode(false);
    }, [mode])

    async function handleCommentSubmit(event) {
        event.preventDefault();

        let isValid = true;

        // Reset errors
        setError("");

        // Validate comment content
        if (!commentContent) {
            setError("Comment is required.");
            isValid = false;
        } else if (commentContent.length > 500) {
            setError("Comment cannot exceed 500 characters.");
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        const newComment = {
            content: commentContent,
            commentedBy: currentUser.displayName, // Use logged-in user ID
            commentedDate: new Date(),
            commentIDs: [],
        };
        console.log("create comment currentuser",currentUser)

        setLoading(true);
        try {

            if (isEditMode) {
                await axios.put(`${config.api_base_url}/comments/${commentId}`, {
                    content: commentContent,
                }, { 
                    withCredentials: true 
                });
                navigateBack();
            } else {
                const body = {
                    newComment,
                    // commentID: commentId || null, // Explicitly include commentID, even if null
                    // postID: postId || null, 
                    ...(commentId && { commentID: commentId }), // Include commentID if it exists
                    ...(postId && { postID: postId })
                };

                console.log("[INFO] Requesting to create a new comment");
                const res = await axios.post(`${config.api_base_url}/comments`, body, { withCredentials: true });
                    // Debugging the status and data
                console.log("[DEBUG] Response status:", res.status);
                console.log("[DEBUG] Response data:", res.data);

                if (res.status === 201) {
                    console.log("[INFO] Comment successfully created:", res.data);
                    navigateToPostPage(postId);
                } else {
                    console.error("[ERROR] Unexpected response from server:", res);
                    navigateToErrorPage("Unexpected server response", `Status: ${res.status}`);
                }
                console.log("[INFO] New comment is created", res.data);
                navigateToPostPage(postId);

            }
            incrementUserDataVersion();
        } catch (err) {
            console.error("[ERROR] Error in creating comment", err.message);
            navigateToErrorPage("Error creating comment", err.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <h2>{isEditMode? "Edit Comment" : "Add New Comment"}</h2>
            <form id="newCommentForm" onSubmit={handleCommentSubmit}>
                <label htmlFor="commentContent">Comment:</label>
                
                <br/>
                
                <textarea
                    id="commentContent"
                    name="commentContent"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                ></textarea>
                <div className="error-message" id="commentContentError">
                    {error}
                </div>
                <br />
                <button type="submit">Submit Comment</button>
            </form>
        </>
    );
}

export default CommentPageForm;
