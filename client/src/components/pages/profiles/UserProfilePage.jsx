// UserProfilePage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { LoginContext } from '../../../App';
import './UserProfilePage.css';
import { useNavigation } from '../../../utils/navigation';
import config from "../../../config";
import axios from "axios"; 
import Timestamps from '../../../utils/Timestamps';
import { LoadingSpinner } from '../PageCreater';
import { useParams } from "react-router-dom";

const UserProfilePage = () => {
  
  const { userId, adminView } = useParams();
  const { currentUser, isGuest, incrementUserDataVersion } = useContext(LoginContext);

  const { 
    navigateToErrorPage,
    navigateToCommunityEditPage,
    navigateToPostEditPage, 
    navigateToCommentEditPage,
    navigateToProfilePage } = useNavigation(); 

  const [currentTab, setCurrentTab] = useState("");

  const [userData, setUserData] = useState({
    displayName: "",
    email: "",
    memberSince: "",
    reputation: "",
    admin: false,

    users: [],
    ownedCommunities: [],
    posts: [],
    comments: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [deleteData, setDeleteData] = useState({
    type: null, // "ownedCommunities", "post", "comment"
    id: null, // “communityId", "postId", "commentId"
    showDeleteDialog: false, 
  });

  const resetDeleteData = () => {
    setDeleteData({
        type: null,
        id: null,
        showDeleteDialog: false,
    });
  };

  const [commentAndPostTitleMap, setCommentAndPostTitleMap] = useState({});

  useEffect(() => {

    async function getPostTitle(commentId) {
      setLoading(true);
      try {
          const { data: post } = await axios.get(`${config.api_base_url}/posts/by-comment/${commentId}`);
          return post.title; // Return the title if successful
      } catch (error) {
          navigateToErrorPage("Error getting post title for comment", error.message);
          return false;
      } finally {
          setLoading(false); 
      }
    }
    
    const fetchUserProfile = async () => {
     
      if (isGuest) return;
  
      console.log("Fetching User data");
      try {
          setLoading(true);
     
          // return false when session not exist
          if (!isGuest) {

            
            const { data: user } = await axios.get(`${config.api_base_url}/users/userId/${userId}`, {
              params: {
                throwOnNotFound: true,
              }
            });

            // Set user data synchronously for non-async fields
            setUserData({
              displayName: user.displayName,
              email: user.email,
              memberSince: user.createdDate
                  ? Timestamps(new Date(user.createdDate))
                  : "Unknown",
              reputation: user.reputation,
              admin: user.admin,
              comments: user.comments,
              posts: user.posts,
              ownedCommunities: user.ownedCommunities,
              users: [],
            });

            // Fetch users asynchronously if the user is an admin
            if (user.admin) {
              setCurrentTab("users");
              (async () => {
                  try {
                      const { data: users } = await axios.get(`${config.api_base_url}/users/allNonAdminUsers`);
                      setUserData((prevData) => ({
                          ...prevData,
                          users: users, // Update with fetched data
                      }));
                  } catch (error) {
                      console.error("[ERROR] Failed to fetch users:", error);
                  }
              })();
            } else {
              setCurrentTab("posts")
            }

            const comments = user.comments;
            if (comments.length > 0) {
                (async () => {
                    try {
                    const entries = await Promise.all(
                        comments.map(async (comment) => {
                            const title = await getPostTitle(comment._id);
                            return [comment._id, title || "Unknown Post Title"];
                        })
                    );
                    const map = Object.fromEntries(entries);
                    setCommentAndPostTitleMap(map);
                    } catch (error) {
                    navigateToErrorPage("Error fetching post titles for comments", error.message);
                    }
                })();
              }
          } else {
              console.log(`[INFO] Session cookies does not exist`);
              navigateToErrorPage("Fetching non loggin user data", error.message);
          }
      } catch (error) {
          navigateToErrorPage("Error in fetching user data", error.message);
      } finally {
          setLoading(false);
      }
        
      
    };

    if (!isGuest) {
      fetchUserProfile();
    }
    
  }, [userId]);


  const handleTabSwitch = (tab) => {
    setCurrentTab(tab);
    setError(null);
  };

  /* Navigate to edit page form */
  const handleEditCommunity = (communityId) => {
    navigateToCommunityEditPage(communityId);
  };

  const handleEditPost = (postId) => {
    navigateToPostEditPage(postId);
  };

  
  const handleEditComment = (commentId) => {
    navigateToCommentEditPage("", commentId);
  };


  /* Prepare delete data */
  const handleDeleteCommunity = async (communityId) => {
    setDeleteData({
        type: "ownedCommunity",
        id: communityId,
        showDeleteDialog: true,
    });
  };

  const handleDeleteUser = async (userId) => {
    setDeleteData({
      type: "user",
      id: userId,
      showDeleteDialog: true,
    });
  }
  
  const handleDeletePost = async (postId) => {
    setDeleteData({
        type: "post",
        id: postId,
        showDeleteDialog: true,
    });
  };

  const handleDeleteComment = async (commentId) => {
    setDeleteData({
        type: "comment",
        id: commentId,
        showDeleteDialog: true,
    });
  };

  /* Does the actual deletion in backend */
  const confirmDeletion = async () => {

    setLoading(true);

    try {
      const { type, id } = deleteData;

      if (userData[type] <= 1) {
        setError(`No ${type} created yet.`);
        return;
      }
        
      // Determine API endpoint and key for updating user data
      const endpoints = {
        ownedCommunity: `/users/communities/${id}`,
        post: `/users/posts/${id}`,
        comment: `/users/comments/${id}`,
        user: `/users/userId/${id}`,
      };

      const keys = {
        ownedCommunity: "ownedCommunities",
        post: "posts",
        comment: "comments",
        user: "users",
      };

      if (!endpoints[type] || !keys[type]) {
        navigateToErrorPage("Invalid DELETE Type!");
        return;
      }

      // Perform the deletion
      await axios.delete(`${config.api_base_url}${endpoints[type]}`, {
          withCredentials: true,
      });
    } catch (error) {
      console.error(`[ERROR] Failed to delete ${deleteData.type} in the backend`);
      console.error(error.stack);
      navigateToErrorPage(`Failed to delete ${deleteData.type}`, error.message);
    } finally {
      setLoading(false);
      resetDeleteData();

      
      incrementUserDataVersion();
      
    }
  };

  if (isGuest) {
    return (
      <div className="userProfileContainer">
        <div className="userProfileHeader">
          <h2>You are not logged in.</h2>
        </div>
      </div>
    );
  }

  const {ownedCommunities, posts, comments, users } = userData;
  const { showDeleteDialog, type } = deleteData;    

  return (
    <div className="userProfileContainer">
      <div className="userProfileHeader">
        <h1>{userData.admin? "Admin's" : "User's"} Profile</h1>
        {loading && <LoadingSpinner/>}
        {error && <div className="userProfileError">{error}</div>}
      </div>

      <div className="userProfileInfo">
        <div className="userProfileRow"><strong>Display Name:</strong> {userData.displayName}</div>
        <div className="userProfileRow"><strong>Email:</strong> {userData.email}</div>
        <div className="userProfileRow"><strong>Member since:</strong> {userData.memberSince}</div>
        <div className="userProfileRow"><strong>Reputation:</strong> {userData.reputation}</div>
      </div>

      <div className="userProfileTabs">
        
        {/* Display user list if it is admin */}
        {userData.admin &&
          <button
            className={`userProfileTabBtn ${currentTab === 'users' ? 'userProfileTabActive' : ''}`}
            onClick={() => handleTabSwitch('users')}
          >
            Users
          </button>
        }
        
        <button
          className={`userProfileTabBtn ${currentTab === 'ownedCommunities' ? 'userProfileTabActive' : ''}`}
          onClick={() => handleTabSwitch('ownedCommunities')}
        >
          Owned Communities
        </button>
        <button
          className={`userProfileTabBtn ${currentTab === 'posts' ? 'userProfileTabActive' : ''}`}
          onClick={() => handleTabSwitch('posts')}
        >
          Posts
        </button>
        <button
          className={`userProfileTabBtn ${currentTab === 'comments' ? 'userProfileTabActive' : ''}`}
          onClick={() => handleTabSwitch('comments')}
        >
          Comments
        </button>
      </div>

      <div className="userProfileListing">

      {userData.admin && currentTab === "users" && (
        
          <ul className="userProfileList">
            {(users.length > 0)? (
              users.map((user) => (
                  <li 
                    key={user._id} 
                    className="userProfileListItem verticalLayout" 
                    onClick={() => {
                      navigateToProfilePage(user._id, true);
                    }}>
                      <div className="userProfileItemName">{user.displayName}</div>
                      <div className="userProfileItemName">{user.email}</div>
                      <div className="userProfileItemName">{user.reputation}</div>
                      <button
                          className="userProfileDeleteBtn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user._id)
                          }}
                      >
                          Delete
                      </button>
                  </li>
              ))): (
                <li className="userProfileListItem verticalLayout" >
                  <div className="userProfileItemName">No User Account exist</div>
                </li>
              )}
          </ul>
        )}


        {currentTab === "ownedCommunities" && (
          <ul className="userProfileList">
            {ownedCommunities.map((c) => (
              <li key={c._id} className="userProfileListItem">
                <span className="userProfileItemName" onClick={() => handleEditCommunity(c._id)}>
                  {c.name}
                </span>
                <button className="userProfileDeleteBtn" onClick={() => handleDeleteCommunity(c._id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}

        {currentTab === "posts" && (
          <ul className="userProfileList">
            {posts.map((p) => (
              <li key={p._id} className="userProfileListItem">
                <span className="userProfileItemName" onClick={() => handleEditPost(p._id)}>
                  {p.title}
                </span>
                <button className="userProfileDeleteBtn" onClick={() => handleDeletePost(p._id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}

        {currentTab === "comments" && (
          <ul className="userProfileList">
            {comments.map((c) => (
              <li key={c._id} className="userProfileListItem">
                <span className="userProfileItemName" onClick={() => handleEditComment(c._id)}>
                  {commentAndPostTitleMap[c._id]} - "{c.content.slice(0, 20)}"
                </span>
                <button className="userProfileDeleteBtn" onClick={() => handleDeleteComment(c._id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <br/>

      {adminView === "true" && (
        <button className="userProfileBackBtn" onClick={() => {navigateToProfilePage(currentUser._id, false)}}>return</button>
      )}
      
      {showDeleteDialog && (
        <div className="userProfileModalOverlay">
          <div className="userProfileModal">
            <p>Are you sure you want to delete this {type}?</p>
            <div className="userProfileModalActions">
              <button className="userProfileConfirmBtn" onClick={confirmDeletion}>Yes, Delete</button>
              <button className="userProfileCancelBtn" onClick={resetDeleteData}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;