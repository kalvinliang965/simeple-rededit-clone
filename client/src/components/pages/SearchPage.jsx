// SearchPage.jsx


import config from '../../config.js';
import axios from 'axios';

import {useState, useEffect, useContext } from "react";
import { ContentPageHeader, Stats, PostPreview, LoadingSpinner } from "./PageCreater.jsx";
import { useParams } from 'react-router-dom';
import { useNavigation } from '../../utils/navigation.js';
import { LoginContext } from '../../App.js';

// search page view
function SearchPage() {

    const [allPosts, setAllPosts] = useState([]); // all posts
    const [userPosts, setUserPosts] = useState([]); // related posts from user's community
    const [sortOrder, setSortOrder] = useState("Newest");
    const [loading, setLoading] = useState(true);
    const { navigateToErrorPage } = useNavigation();
    const { searchString } = useParams();
    const { isGuest } = useContext(LoginContext);

    useEffect(() => {
        console.log("[INFO] Toggling page to search page view");
        async function fetchPostData() {
            setLoading(true);
            console.log("[INFO] Fetching post data in search page view");
            console.log(`[INFO] searchString: ${searchString}`);
            try {
                
                const allPosts_res = await axios.get(`${config.api_base_url}/posts/search/`, {
                    params: {sortOrder: sortOrder, searchString: searchString},
                    timeout: 10000, // Timeout after 10 seconds

                });
                setAllPosts(allPosts_res.data);
                if (!isGuest) {
                    console.log(`[INFO] Getting user post`);
                    const userPosts_res = await axios.get(`${config.api_base_url}/users/posts/search/`, {
                        params: {sortOrder: sortOrder, searchString: searchString},
                        timeout: 10000, // Timeout after 10 seconds
                        withCredentials: true,
                    });
                    setUserPosts(userPosts_res.data);
                    const userPostIds = new Set(userPosts_res.data.map(post => post._id.toString())); 
                    const uniqueAllPosts = allPosts_res.data.filter(post => !userPostIds.has(post._id.toString()));
                    
                    console.log(userPosts_res.data);
                    console.log(uniqueAllPosts);

                    setAllPosts(uniqueAllPosts);
                }
            } catch (err) {
                console.error("[ERROR] Error in fetching search data");
                console.error(`[ERROR] Message: ${err.message}`);
                navigateToErrorPage("Error in fetching search data", err.message);
            }
            setLoading(false);
        }
        fetchPostData();
    }, [searchString, sortOrder]);
    
    function updatePostSort(sortType) {
        console.log(`[INFO] Setting posts order on search page view to be sort by ${sortType}`);
        setSortOrder(sortType);
    }

    if (loading)
        return (<LoadingSpinner/>);


    const postNum = allPosts.length + userPosts.length;
    
    return (
        <div>
            <ContentPageHeader
                header={((postNum == 0)? "No result found for: ": "Result for: ")}
                updatePostSort={updatePostSort}
                sortOrder={sortOrder}
            >
                {
                    <span id="search-string" style={{ fontSize: "1rem", fontStyle: "italic" }}>
                        { searchString }
                    </span>
                }
            </ContentPageHeader>
            <Stats postCount={postNum}></Stats>
            <div id="post-list">
                { (userPosts.length + allPosts.length == 0) ? (
                    <img 
                        src={`${config.base_url}/images/sumtingwong.jpg`} 
                        alt="Sum Ting went Wong!!!" 
                        width="100%" 
                        height="auto"
                    />
                ) : (
                    <>
                        <h2>{isGuest? "" : "User's Community Posts:"}</h2>
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
                        
                        <h2>{isGuest? "" : "Other Posts:"} </h2>
                        
                        { allPosts.length > 0 && (
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
                    </>
                )}
            </div>
        </div>
    )
}

export default SearchPage;