// PostPage.jsx

import axios from "axios";
import { useContext, useEffect, useState } from "react";
import config from "../../config";
import { useParams } from "react-router-dom";
import { 
    LoadingSpinner, 
    PostDetail, 
    AddCommentToPost, 
    CommentSection
} from "./PageCreater";
import { LoginContext } from "../../App";


function PostPage() {
    
    const [loading, setLoading] = useState(true);

    const { postId } = useParams();

    const {isGuest} = useContext(LoginContext);

    // update post view count every time we toggle to this post page
    useEffect(()=>{
        async function fetchData() {
            let post;

            console.log(`[INFO] Incrementing post page view count`);
            setLoading(true);

            console.log(`[INFO] Fetching post data from the database`);
            const retrieve_post_res = await axios.get(`${config.api_base_url}/posts/${postId}`);
            console.log(`[INFO] Post data is retrieved successfully`);

            post = retrieve_post_res.data;
            // console.log(post);

            console.log(`[INFO] Updating post data from the database`);
            const update_post_res = await axios.put(`${config.api_base_url}/posts/${postId}`, {views: post.views + 1});
            console.log(`[INFO] Post data is updated successfully`);
            

            post = update_post_res.data;
            // console.log(post);

            setLoading(false);
        }
        fetchData();
    }, [postId]);


    if (loading)
        return <LoadingSpinner/>

    return (
        <div id="post-view">
            <PostDetail />
            {!isGuest && (
                <AddCommentToPost />
            )}
            <CommentSection />
        </div>
    )

}

export default PostPage;