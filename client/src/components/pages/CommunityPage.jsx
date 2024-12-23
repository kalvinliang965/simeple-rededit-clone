// CommunityPage.jsx

import config from '../../config.js';
import axios from 'axios';
import { useState, useEffect, useContext } from "react";
import Timestamps from "../../utils/Timestamps.js";
import { ContentPageHeader, Stats, PostPreview, CommunityDescription, LoadingSpinner, Button } from "./PageCreater.jsx";
import { useParams } from 'react-router-dom';
import { useNavigation } from '../../utils/navigation.js';
import { LoginContext } from '../../App.js';

// community page view
function CommunityPage() {

    const { communityId } = useParams();
    const { navigateToErrorPage } = useNavigation();

    const [posts, setPosts] = useState([]);
    const [community, setCommunity] = useState({
        header: null,
        description: null,
        timestamp: null,
        memberCount: null,
        creator: null,
        userIsMember: false,
        owner: null,
    });
    const [sortOrder, setSortOrder] = useState("Newest");
    const [loading, setLoading] = useState(true);
    
    const { currentUser, isGuest, incrementUserDataVersion } = useContext(LoginContext);

    useEffect(() => {
        async function fetchPostData() {
            setLoading(true);
            console.log(`[INFO] Fetching post data for communityID ${communityId}`);
            try {
                const communityPromise = axios.get(`${config.api_base_url}/communities/${communityId}`);
                const postsPromise = axios.get(`${config.api_base_url}/communities/${communityId}/posts`, {
                    params: {sortOrder: sortOrder}
                });
                const [community_res, posts_res] = await Promise.all([communityPromise, postsPromise]);

                const community_data = community_res.data;
                setCommunity({
                    header: community_data.name,
                    description: community_data.description,
                    startDate: Timestamps(new Date(community_data.startDate)),
                    memberCount: community_data.memberCount,
                    creator: community_data.creator,
                    userIsMember: isGuest || community_data.members.includes(currentUser.displayName),
                    owner: community_data.owner,
                });
                setPosts(posts_res.data);
            } catch (err) {
                console.error("[ERROR] Error in fetching community data");
                console.error(`[ERROR] Message: ${err.message}`);
                navigateToErrorPage("Error Fetching Community data", err.message);
            }
            setLoading(false);
        }
        fetchPostData();
    }, [communityId, sortOrder]);

    function updatePostSort(sortType) {
        console.log(`[INFO] Setting posts order to be sort by ${sortType}`);
        setSortOrder(sortType);
    }

    async function removeMemberFromCommunity() {
        try {
            console.log('[INFO] Removing user from community');
            const community_res = await axios.delete(`${config.api_base_url}/communities/${communityId}/delete-members/members/${currentUser._id}`, { 
                withCredentials: true
            });
            const community_data = community_res.data;
            setCommunity({
                header: community_data.name,
                description: community_data.description,
                startDate: Timestamps(new Date(community_data.startDate)),
                memberCount: community_data.memberCount,
                creator: community_data.creator,
                userIsMember: isGuest || community_data.members.includes(currentUser.displayName),
            });
            incrementUserDataVersion();
        } catch (error) {
            navigateToErrorPage("User does not exist in the community", error.message);
        }
    }

    async function addMemberToCommunity() {
        try {
            console.log('[INFO] Adding user to community');
            const community_res = await axios.put(`${config.api_base_url}/communities/${communityId}/add-members/members`, {
                userId: currentUser._id,
            }, { 
                withCredentials: true
            });
            const community_data = community_res.data;
            setCommunity({
                header: community_data.name,
                description: community_data.description,
                startDate: Timestamps(new Date(community_data.startDate)),
                memberCount: community_data.memberCount,
                creator: community_data.creator,
                userIsMember: isGuest || community_data.members.includes(currentUser.displayName),
            });
            incrementUserDataVersion()
        } catch (error) {
            navigateToErrorPage("User already exist in the community", error.message);
        }
    }

    if (loading)
        return (<LoadingSpinner/>);

    return (
        <div>
            <ContentPageHeader 
                header={community.header} 
                updatePostSort={updatePostSort}
                sortOrder={sortOrder}>
            </ContentPageHeader>
            <div className="content-container">
                <div className="left">
                    <Stats postCount={posts.length} memberCount={community.memberCount}></Stats>
                    <div id="post-list">
                        {
                            posts.map(post => {
                                return (
                                    <PostPreview 
                                        key={post._id} 
                                        post={post}
                                        showCommunity={false}
                                    />); 
                            })
                        }
                    </div>
                </div>
             
                <CommunityDescription
                    header={community.header}
                    description={community.description}
                    timestamp={community.startDate}
                    creator={community.creator}
                    owner={community.owner}
                    className="right"
                >
                </CommunityDescription>
            </div>
            {!isGuest && (
                community.userIsMember? (
                    <Button 
                        label={"Leave"} 
                        isActive={false} 
                        id="community-leave-btn" 
                        onClick={() => removeMemberFromCommunity()}
                    />
                ) : (
                    <Button 
                        label={"Join"} 
                        isActive={false} 
                        id="community-join-btn" 
                        onClick={() => addMemberToCommunity()}
                    />
                )
            )}
        </div>
    );
}

export default CommunityPage;