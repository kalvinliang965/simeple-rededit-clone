import { useState, useEffect, useContext } from "react";
import axios from "axios";
import config from "../../config";
import Timestamps from "../../utils/Timestamps";
import { useNavigation } from "../../utils/navigation";
import { LoginContext } from "../../App";
import { useParams } from "react-router-dom";

export function Button({label, isActive, className, id, onClick, disabled}) {

    const [classes, setClasses] = useState((className)? className: "");

    useEffect(()=> {
        setClasses((className)? className: "");
    },[className]);

    const removeClass = (classToRemove) => {
        setClasses((prevClasses) => {
          if (prevClasses) {
            return prevClasses
              .split(" ")
              .filter((cls) => cls !== classToRemove)
              .join(" ");
          } else {
            return "";
          }
        });
      };
    
    
      const addClass = (classToAdd) => {
        setClasses((prevClasses) => {
          if (!prevClasses) {
            return classToAdd;
          } else {
            const classArray = prevClasses.split(" ");
            if (!classArray.includes(classToAdd)) {
              classArray.push(classToAdd);
            }
            return classArray.join(" ");
          }
        });
      };
    
    // Use useEffect to handle side effects (updating classes) based on isActive prop
    useEffect(() => {
    if (isActive) {
        addClass("active");
    } else {
        removeClass("active");
    }
    }, [isActive]); // Trigger this effect when isActive changes

    //add or remove the "disabled" class based on the prop
    useEffect(()=>{
      if (disabled){
        addClass("disabled")
      } else{
        removeClass("disabled")
      }
    },[disabled]);
    
    return (
        <button id={id} className={classes} onClick={onClick} disabled={disabled}>
            {label}
        </button>
    )    
}



export const LoadingSpinner = () => {
  return (
      <div className="spinner-container">
          <div className="spinner"></div>
      </div>
  );
};


export function ContentPageHeader(props) {
    
  const handleBtnClick = (sortType) => {
      console.log("[INFO] Handle sort btn click");
      console.log(`[INFO] Setting active button to ${sortType}`);
      console.log("[INFO] update post sort order");
      props.updatePostSort(sortType); // call sort function
  }

  return (
      <div className="header">
          <div className="left">
              {props.header}
              {props.children}
          </div>
          <div className="right">
              <Button id = "Newest" label="Newest" isActive={props.sortOrder === "Newest"} onClick={()=>{handleBtnClick("Newest")}}></Button>
              <Button id = "Oldest" label="Oldest" isActive={props.sortOrder === "Oldest"} onClick={()=>{handleBtnClick("Oldest")}}></Button>
              <Button id = "Active" label="Active" isActive={props.sortOrder === "Active"} onClick={()=>{handleBtnClick("Active")}}></Button>
          </div>
      </div>
  )
}

export function Stats({postCount, memberCount}) {
  
  const postText = postCount === 1 ? 'post' : 'posts';
  const memberText = memberCount === 1 ? 'member' : 'members';

  return (
      <div id="stats">
          <span id="postCount">
              {postCount} {postText}
          </span>
          {memberCount !== undefined && (
              <span id="memberCount">
                  {memberCount} {memberText}
              </span>
          )}
      </div>
  );

}

function PostHeaderInfo({header_info}) {
  const { community_name, username, timestamp } = header_info;
  const items = [];

  if (community_name) {
      items.push(
          <span key="community" className="community-name">
              {community_name}
          </span>
      );
  }

  if (username) {
      if (items.length > 0) {
          items.push(<span key="sep1">&middot;</span>);
      }
      items.push(
          <span key="username" className="username">
              {username}
          </span>
      );
  }

  if (timestamp) {
      if (items.length > 0) {
          items.push(<span key="sep2">&middot;</span>);
      }
      items.push(
          <span key="timestamp" className="timestamp">
              {timestamp}
          </span>
      );
  }

  return <div className="p-header">{items}</div>;
}

function PostStats({ view_count = 0, comment_count = 0, upvote_count = 0 }) {
  const viewText = view_count === 1 ? 'view' : 'views';
  const commentText = comment_count === 1 ? 'comment' : 'comments';
  const upvoteText = upvote_count === 1 ? 'upvote' : 'upvotes';
  return (
      <div className="p-footer">
          <span>
              <span className="view-count">{view_count}</span> {viewText}
          </span>
          <span>
              <span className="comment-count">{comment_count}</span> {commentText}
          </span>
          <span>
              <span className="postview-upvote">{upvote_count}</span> {upvoteText}
          </span>
      </div>
  );
}

// pass the community if you want to include community data in this preview
export function PostPreview(props) {

  console.log(`[INFO] Rendering post preview`);
  const [linkFlair, setLinkFlair] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nreplies, setNReplies] = useState(0);
  const [community, setCommunity] = useState(null);

  const post = props.post;

  const { navigateToErrorPage, navigateToPostPage } = useNavigation();
  
  useEffect(() => {
      async function fetchData() {
          setLoading(true);
          try {
              const linkFlairPromise = (post.linkFlairID)? axios.get(`${config.api_base_url}/linkflairs/${post.linkFlairID}`): Promise.resolve(null);
              const nrepliesPromise = axios.get(`${config.api_base_url}/posts/${post._id}/nreplies`);
              const communityPromise = (props.showCommunity)? axios.get(`${config.api_base_url}/posts/${post._id}/community`): Promise.resolve(null);
              const [linkFlair_res, nreplies_res, community_res] = await Promise.all([linkFlairPromise, nrepliesPromise, communityPromise]);
  
              // Update state with fetched data
              setLinkFlair((linkFlair_res)? linkFlair_res.data: null);
              setCommunity((community_res)? community_res.data: null);
              setNReplies(nreplies_res.data);
          } catch (err) {
              console.error("[ERROR] Error in fetching post data");
              console.error(`[ERROR] postID: ${post._id}`);
              console.error(`[ERROR] Message: ${err.message}`);
              navigateToErrorPage("Error in Fetching post data", err.message);
          }
          setLoading(false);
      }
      fetchData();
  }, [post]);
  
  

  if (loading)
      return (<LoadingSpinner/>);

  const header_info = {    
      community_name: (community)? community["name"]: undefined,
      username: post["postedBy"],
      timestamp: Timestamps(new Date(post.postedDate)),
  }
  const comment_count = nreplies;
  return (
      <div 
          className="p-item" 
          onClick={() => {
              navigateToPostPage(post._id);
          }}>
          <PostHeaderInfo header_info={header_info}></PostHeaderInfo>
          <div className="p-title">{post.title}</div>
          {
              linkFlair && (<div className="p-linkflair">{linkFlair.content}</div>)
          }
          <div className="p-content">
              {(post.content.length <= 80)? post.content : post.content.substring(0, 80) + "..."}
          </div>
          <PostStats view_count={post.views} comment_count={comment_count} upvote_count={post.upvote}></PostStats>
      </div>
  )
}

export function CommunityDescription({header, description, timestamp, className, creator, owner}) {
    return (
        <div className={"description-container " + className}>
            <div className="header">
                {header}
            </div>

            <div className="description">
                {description}
            </div>

            <div className="community-timestamp-container">
                <strong>Created:</strong>&nbsp;<span className="timestamp">{timestamp}</span>
            </div>
            <div className="community-owner-container">
                <strong>Owned By:</strong>&nbsp;<span>{owner}</span>
            </div>
            <div className="community-owner-container">
                <strong>Created By:</strong>&nbsp;<span>{creator}</span>
            </div>
        </div>
    );
}



export function PostDetail() {

    const [post, setPost] = useState(null);
    const [community, setCommunity] = useState(null);
    const [nreplies, setNReplies] = useState(0);
    const [linkFlair, setLinkFlair] = useState(null);
    const [loading, setLoading] = useState(false);
    const { postId } = useParams();
    const { isGuest, currentUser, incrementUserDataVersion } = useContext(LoginContext);

    const { navigateToErrorPage } = useNavigation();

    useEffect(()=>{
        async function fetchData() {
            setLoading(true);
            try {
                console.log("[INFO] Rendering PostDetail for POST PAGE VIEW");
                console.log(`[INFO] Post ID: ${postId}`);
                const postPromise = axios.get(`${config.api_base_url}/posts/${postId}`);
                
                console.log("[INFO] Fetching number of replies");
                const nrepliesPromise = axios.get(`${config.api_base_url}/posts/${postId}/nreplies`);
                
                console.log("[INFO] Fetching associated community");
                const communityPromise = axios.get(`${config.api_base_url}/posts/${postId}/community`);
    
                const [post_res, nreplies_res, community_res] = await Promise.all([postPromise, nrepliesPromise, communityPromise]); 
                setCommunity(community_res.data);
                setPost(post_res.data);
                setNReplies(nreplies_res.data);

                console.log(post_res.data);

                if (post_res.data.linkFlairID) {
                    console.log(`[INFO] Post contains linkflair`);
                    console.log("[INFO] Fetching linkFlair data for post page view");
                    const linkFlair_res = await axios.get(`${config.api_base_url}/linkFlairs/${post_res.data.linkFlairID}`);
                    setLinkFlair(linkFlair_res.data);
                } else {
                    console.log(`[INFO] Post doesn't have linkFlairID`);
                }
                
            } catch(err) {
                console.error("[ERROR] Error in fetching post data");
                console.error(`[ERROR] Message: ${err.message}`);
                navigateToErrorPage("PostDetail: Error in fetching post data for post page view", err.message);
            }
            setLoading(false);
        }
        fetchData();
    }, [postId]);

    if (loading) return <LoadingSpinner />;

    // null checks
    if (!post || !community) return null;

    const header_info = {
        community_name: community.name,
        timestamp: Timestamps(new Date(post.postedDate)),
    };

    // Handle upvote/downvote
    async function voteCountHandler(value) {
        try {
            if (!post) {
                navigateToErrorPage("Error in updating comment data", "comment data is not fetch");
                return;
            }

            if (currentUser.reputation >= 50) {
                const { data: postCreator } = await axios.get(`${config.api_base_url}/users/${post.postedBy}`, 
                    { params: { throwOnNotFound: true } }
                );
                
                // Calculate reputation change
                const reputationChange = value > 0 ? 5 : -10;

                // Update postCreator reputation
                await axios.put(`${config.api_base_url}/users/${postCreator._id}`, {
                    reputation: postCreator.reputation + reputationChange,
                });

                // Update post upvote/downvote count
                const { data: updatedPost } = await axios.put(`${config.api_base_url}/posts/${postId}`, {
                    upvote: post.upvote + value,
                });

                // Update local state
                setPost(updatedPost);
                incrementUserDataVersion();
            }
        } catch (error) {
            console.error("[ERROR] Error updating vote count:", error.message);
            navigateToErrorPage("Error updating vote count", error.message);
        }
    }

    console.log(linkFlair);

    return (
            <div id="post">
                <PostHeaderInfo header_info={header_info}></PostHeaderInfo>
                <div className="p-username">Post by <span style={{color: "#52525b", fontWeight: "bold"}}>{post.postedBy}</span></div>
                <div className="p-title">{post.title}</div>
                {linkFlair && <div className="p-linkflair">{linkFlair.content}</div>}
                <div className="p-content">{post.content}</div>
                <PostStats view_count={post.views} comment_count={nreplies} upvote_count={post.upvote}/>
                {!isGuest && (
                    <div className="postVoteAction">
                    <button onClick={() => voteCountHandler(1)}>upvote</button>
                    <button onClick={() => voteCountHandler(-1)}>downvote</button>
                    </div>
                )}
            </div>
    )
}

export function AddCommentToPost() {

    const { navigateToNewCommentPage } = useNavigation();
    const { postId } = useParams();

    return (
        <div id ="add-comment-container">
            <button 
                id="add-comment" 
                onClick={() => navigateToNewCommentPage(postId) }>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>plus</title>
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              Add Comment
            </button>
        </div>
    )
}



function CommentReply({ replyIds, postId }) {

    if (!replyIds, replyIds.length === 0)
        return null;

    return (
        <div className="c-children">
            {replyIds.map((replyId) => (
                <Comment
                    key={replyId}
                    commentId={replyId}
                    postId={postId}
                />
            ))}
        </div>
    );
  }

function Comment({commentId, postId}) {

    
    const { isGuest,  currentUser, incrementUserDataVersion } = useContext(LoginContext);
    const { navigateToErrorPage,navigateToNewCommentPage } = useNavigation();

    const [commentData, setCommentData] = useState({
        comment: null,
        replyIds: [],
        isLoading: true, 
    });

    useEffect(() => {
        async function fetchCommentData() {
            try {
                const response = await axios.get(`${config.api_base_url}/comments/${commentId}`);
                setCommentData({
                    comment: response.data,
                    replyIds: response.data.commentIDs || [],
                    isLoading: false,
                });
            } catch (error) {
                console.error("[ERROR] Error fetching comment data:", error.message);
                navigateToErrorPage("Error Fetching Comment Data", error.message);
            }
        }
        fetchCommentData();
    }, [commentId, postId]);

    // Handle upvote/downvote
    async function voteCountHandler(value) {
        try {
            
            const { comment } = commentData;
            if (!comment) {
                navigateToErrorPage("Error in updating comment data", "comment data is not fetch");
                return;
            }

            if (currentUser.reputation >= 50) {
                const { data: commenter } = await axios.get(`${config.api_base_url}/users/${comment.commentedBy}`, 
                    { params: { throwOnNotFound: true } }
                );
                
                // Calculate reputation change
                const reputationChange = value > 0 ? 5 : -10;
    
                // Update commenter reputation
                await axios.put(`${config.api_base_url}/users/${commenter._id}`, {
                    reputation: commenter.reputation + reputationChange,
                });
    
                // Update comment upvote/downvote count
                const { data: updatedComment } = await axios.put(`${config.api_base_url}/comments/${commentId}`, {
                    upvote: comment.upvote + value,
                });
    
                // Update local state
                setCommentData((prevData) => ({
                    ...prevData,
                    comment: updatedComment, 
                }));
                incrementUserDataVersion();
            }
            
        } catch (error) {
            console.error("[ERROR] Error updating vote count:", error.message);
            navigateToErrorPage("Error updating vote count", error.message);
        }
    }

    const { comment, replyIds, isLoading } = commentData;
    
    replyIds.reverse();
    
    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="comment-section">
            <div className="c-value-container">
                <div className="c-value">
                    <div className="c-header">
                    <span className="c-username">{comment?.commentedBy}</span>
                    &middot;
                    <span className="c-timestamp">{Timestamps(new Date(comment?.commentedDate))}</span>
                    </div>
                    <div className="c-content">
                        {comment?.content}
                    </div>

                    <div className="c-footer">

                        <div className="c-upvote-count">
                            <span>Upvote Count:</span> <span>{comment?.upvote}</span>
                        </div>

                        {!isGuest && 
                            <div className="c-controller">
                                <button
                                    className="c-reply"
                                    onClick={()=>navigateToNewCommentPage(postId, commentId)}>
                                    Reply
                                </button>
                                <button
                                    className="c-upvote"
                                    onClick={()=>voteCountHandler(1)}>
                                    Upvote
                                </button>
                                
                                <button
                                    className="c-downvote"
                                    onClick={()=>voteCountHandler(-1)}>
                                    Downvote
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
            {
               (replyIds && replyIds.length > 0)?
                (
                    <CommentReply
                        replyIds={replyIds}
                        postId={postId}
                    ></CommentReply>
                ):
                null
            }
        </div>
    )
}

// Post id is needed here because comment is needed to added to the 
// post structure when we are replying to another comment
export function CommentSection() {

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const { navigateToErrorPage } = useNavigation();
    const { postId } = useParams();

    useEffect(()=>{
        console.log("[INFO] Rendering Comment Section");
        async function fetchData() {
            setLoading(true);
            try {
                console.log("[INFO] Fetching post data from database");
                console.log(`[INFO] Post ID: ${postId}`);
                // Note commentIDs now contains list of comment obj instead of commentID
                const post_res = await axios.get(`${config.api_base_url}/posts/${postId}`);
                setPost(post_res.data);
            } catch(err) {
                console.error("[ERROR] Error in fetching post data");
                console.error(`[ERROR] Message: ${err.message}`);
                navigateToErrorPage("Error in fetching post data for comment section", err.message)
            }
            setLoading(false);
        }
        fetchData();
    }, [postId]);

    if (loading) 
        return <LoadingSpinner/>

    const commentIDs = post?.commentIDs || [];
    commentIDs.reverse();
    
    return (
        <div className="comment-section">
            <div className="c-value" id = "c-root">
              Comment Section
            </div>
            <div className="c-children">
                {
                    commentIDs.map((commentId) => (
                          <Comment
                              key={commentId}
                              commentId={commentId}
                              postId={postId}
                          />
                    ))
                }
            </div>
        </div>
    )
}