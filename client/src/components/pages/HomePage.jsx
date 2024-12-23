// HomePage.jsx

import config from "../../config.js";
import axios from 'axios';
import {useState, useEffect, useContext } from "react";

import { LoadingSpinner, ContentPageHeader, Stats, PostPreview } from "./PageCreater.jsx";
import { useNavigation } from "../../utils/navigation.js";

import { LoginContext } from "../../App.js";

// home page view
function HomePage() {

    const [allPosts, setAllPosts] = useState([]);
    const [userPosts, setUserPosts] = useState([]);
    const [sortOrder, setSortOrder] = useState("Newest");
    const [loading, setLoading] = useState(true);
    
    const { navigateToErrorPage } = useNavigation();

    const { isGuest } = useContext(LoginContext);

    useEffect(() => {
        console.log("[INFO] Toggling page to Home page view");
        
        async function fetchPostData() {
            setLoading(true);
            console.log("[INFO] Fetching post data");
            try {
                const allPost_res = await axios.get(`${config.api_base_url}/posts`, {
                    params: {sortOrder: sortOrder},
                    timeout: 10000, 
                });
                setAllPosts(allPost_res.data);

                if (!isGuest) {
                    console.log(`[INFO] Getting user post`);
                    const userPosts_res = await axios.get(`${config.api_base_url}/users/posts`, {
                        params: {sortOrder: sortOrder},
                        timeout: 10000, // Timeout after 10 seconds
                        withCredentials: true,
                    });
                    setUserPosts(userPosts_res.data);
                    const userPostIds = new Set(userPosts_res.data.map(post => post._id.toString())); 
                    const uniqueAllPosts = allPost_res.data.filter(post => !userPostIds.has(post._id.toString()));
                    setAllPosts(uniqueAllPosts);
                }
            
            } catch (err) {
                console.error("[ERROR] Error in fetching post data");
                console.error(`[ERROR] Message: ${err.message}`);
                navigateToErrorPage(`Error in fetching post data`, `${err.message}`);
            }
            setLoading(false);
        }


        fetchPostData();
    }, [sortOrder]);
    
    function updatePostSort(sortType) {
        console.log(`[INFO] Setting posts order to be sort by ${sortType}`);
        setSortOrder(sortType);
    }

    if (loading)
        return (<LoadingSpinner/>);

    return (
        <div>
            <ContentPageHeader 
                header="All Post" 
                updatePostSort={updatePostSort}
                sortOrder={sortOrder}/>
            <Stats postCount={allPosts.length + userPosts.length}/>
            <div id="post-list">
                <h2>{isGuest? "": "User's Community Posts:"}</h2>
                {userPosts.length > 0 && (
                    <>
                        <br/>
                        {userPosts.map((post) => (
                            <PostPreview
                                key={post._id}
                                post={post}
                                showCommunity={true}
                            />
                        ))}
                    </>
                )}
                {!isGuest && <hr style={{ margin: "20px 0", border: "1px solid #ccc" }} /> }
                <h2>{isGuest? "" : "Other Posts: "}</h2>
                {allPosts.length > 0 && (
                    <>
                        <br/>
                        {allPosts.map((post) => (
                            <PostPreview
                                key={post._id}
                                post={post}
                                showCommunity={true}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

export default HomePage;