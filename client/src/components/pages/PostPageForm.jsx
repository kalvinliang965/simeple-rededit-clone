// NewPostPage.jsx

import config from "../../config.js";
import axios from 'axios';
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { LoginContext } from "../../App.js";
import { useNavigation } from "../../utils/navigation.js";
import { LoadingSpinner } from "./PageCreater.jsx";
import { useImmer } from "use-immer";
import { useMainSectionBtn } from "../phreddit.js";
import MainSectionBtnEnum from "../MainSectionBtnEnum.js";

function PostPageForm() {
    
    const { currentUser, incrementUserDataVersion } = useContext(LoginContext);
    const { postId, mode } = useParams();

    const { navigateToHomePage, navigateToErrorPage, navigateBack } = useNavigation();

    const [loading, setLoading] = useState(true);
    const [communities, setCommunities] = useState([]);
    const [linkFlairs, setLinkFlairs] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const { activeMainSectionBtn, setActiveMainSectionBtn } = useMainSectionBtn();

    const [postInfo, updatePostInfo] = useImmer({
        communityID: "",
        title: "",
        content: "",
        linkFlairContent: "",
        newFlairContent: "",
    });

    const [errorMsg, updateErrorMsg] = useImmer({
        selectCommunity: "",
        title: "",
        linkFlair: "",
        content: "",
    });

    

    // Fetch communities and link flairs
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {

                const { data: allCommunities} = await axios.get(`${config.api_base_url}/communities`);
                const linkFlairsRes = await axios.get(`${config.api_base_url}/linkflairs`);

                const userCommunities = currentUser?.communities || [];

                const nonUserCommunities = allCommunities.filter(community => {
                    return !userCommunities.some((userCommunity) => userCommunity._id === community._id);
                });

                

                setCommunities([...userCommunities, ...nonUserCommunities]);
                setLinkFlairs(linkFlairsRes.data);

                
                if (mode === "edit") {
                    setIsEditMode(true);
                    const postRes = await axios.get(`${config.api_base_url}/posts/${postId}`);
                    updatePostInfo(draft => {
                        draft.communityID = postRes.data.communityID;
                        draft.title = postRes.data.title;
                        draft.content = postRes.data.content;
                        draft.linkFlairContent = "";
                        draft.newFlairContent = "";
                    });
                }

                console.log("TEST");
            } catch (error) {
                console.error("[ERROR] Error fetching data:", error.message);
                console.error("[ERROR] Error stack:", error.stack);
                navigateToErrorPage("Error fetching data", error.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [mode]);

    // Form submission handler
    async function handleSubmit(event) {
        event.preventDefault();

        // Reset errors
        updateErrorMsg(draft => {
            draft.selectCommunity = "";
            draft.title = "";
            draft.linkFlair = "";
            draft.content = "";
        });

        // Validation
        let isValid = true;
        
        if (!isEditMode && !postInfo.communityID) {
            updateErrorMsg(draft => {
                draft.selectCommunity = "Please select a community."
            });
            isValid = false;
        }

        if (!postInfo.title) {
            updateErrorMsg(draft => {
                draft.title = "Title is required."
            });
            isValid = false;
        } else if (postInfo.title.length > 100) {
            updateErrorMsg(draft => {
                draft.title = "Title cannot exceed 100 characters."
            });
            isValid = false;
        }
        
        if (postInfo.linkFlairContent && postInfo.newFlairContent) {
            updateErrorMsg(draft => {
                draft.linkFlair = "Choose either an existing flair or create a new one, not both."
            });
            isValid = false;
        } else if (postInfo.newFlairContent && postInfo.newFlairContent.length > 30) {
            updateErrorMsg(draft => {
                draft.linkFlair = "New flair cannot exceed 30 characters."
            });
            isValid = false;
        }

        if (!postInfo.content) {
            updateErrorMsg(draft => {
                draft.content = "Content is required."
            });
            isValid = false;
        }

        if (!isValid) {
            console.log("[INFO] Validation failed.");
            return;
        }

        

        try {
            const linkFlairContent = postInfo.linkFlairContent || postInfo.newFlairContent;

            let linkFlairID;

            if (linkFlairContent) {
                // getting linkflairId by content
                const res = await axios.get(`${config.api_base_url}/linkflairs/content/`, {
                    params: {
                        linkFlairContent: linkFlairContent,
                    }
                });
                linkFlairID = res.data;
            } else {
                linkFlairID = null;
            }
            
            
            // Create new post object
            const newPost = {
                title: postInfo.title,
                content: postInfo.content,
                postedBy: currentUser.displayName, 
                postedDate: new Date(),
                commentIDs: [],
                views: 0,
                linkFlairID: linkFlairID,
            };
            
            if (isEditMode) {
                console.log("[INFO] Updating post...");
                // need to create new linkflair (new linkflair ID!)

                await axios.put(`${config.api_base_url}/posts/${postId}`, newPost);
                navigateBack();
            } else {
                console.log("[INFO] Submitting new post to backend.");
                console.log("[DEBUG] communityID:", postInfo.communityID);
                console.log("newpost is ",newPost)
                const res = await axios.post(`${config.api_base_url}/posts`, {
                    post: newPost,
                    communityID: postInfo.communityID,
                });
                console.log("[INFO] New post created:", res.data);
                navigateToHomePage();
                setActiveMainSectionBtn(MainSectionBtnEnum.HOME);
            }
            incrementUserDataVersion();
        } catch (error) {
            console.error("[ERROR] Error creating post:", error.message);
            navigateToErrorPage("Error creating post", error.message);
        }
    }

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <h1>{isEditMode ? "Edit Post" : "Create a New Post"}</h1>
            <form id="new-post-form" onSubmit={handleSubmit}>
                <label htmlFor="new-communities">Community:</label>
                <select
                    id="new-communities"
                    name="new-communities"
                    value={postInfo.communityID}
                    onChange={(e) => updatePostInfo(draft => {
                        draft.communityID = e.target.value
                    })}
                    disabled={isEditMode}
                >
                    <option value="">Select a community</option>
                    {communities.map((community) => (
                        <option key={community._id} value={community._id}>
                            {community.name}
                        </option>
                    ))}
                </select>
                
                <div className="error-message">{errorMsg.selectCommunity}</div>

                <label htmlFor="new-title">Title (max 100 characters):</label>
                <input
                    id="new-title"
                    type="text"
                    name="new-title" 
                    value={postInfo.title}
                    onChange={(e) => updatePostInfo(draft => {
                        draft.title = e.target.value
                    })}
                />
                <div className="error-message" id = "postTitle">{errorMsg.title}</div>

                <label htmlFor="linkFlair">Link Flair (optional):</label>
                <select
                    id="linkFlair"
                    name="linkFlair"
                    value={postInfo.linkFlairContent}
                    onChange={(e) => updatePostInfo(draft => {
                        draft.linkFlairContent = e.target.value
                    })}
                >
                    <option value="">Select a link flair</option>
                    {linkFlairs.map((flair) => (
                        <option key={flair._id} value={flair.content}>
                            {flair.content}
                        </option>
                    ))}
                </select>

                <label htmlFor="newFlair">Or create new flair (max 30 characters):</label>
                <input
                    id="newFlair"
                    type="text"
                    name="newFlair"
                    value={postInfo.newFlairContent}
                    onChange={(e) => updatePostInfo(draft => {
                        draft.newFlairContent = e.target.value
                    })}
                />
                <div className="error-message" id = "postNewFlair">{errorMsg.linkFlair}</div>

                <label htmlFor="content">Content:</label>
                <textarea
                    id="content"
                    name="content"
                    value={postInfo.content}
                    onChange={(e) => updatePostInfo(draft => {
                        draft.content = e.target.value
                    })}
                ></textarea>
                <div className="error-message" id = "postContent">{errorMsg.content}</div>

                <button id="submitButton"type="submit">{isEditMode ? "Save Changes" : "Submit Post"}</button>
            </form>
        </>
    );
}

export default PostPageForm;
