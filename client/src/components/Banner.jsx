
import {Button} from "./pages/PageCreater.jsx";
import React from "react";

import { useContext } from "react";

import { LoginContext } from "../App.js";

import { useNavigation } from '../utils/navigation.js';

import { useMainSectionBtn } from "./phreddit.js";

import MainSectionBtnEnum from "./MainSectionBtnEnum.js";

function Banner() {

    const { manageUserSession, currentUser, isGuest } = useContext(LoginContext);

    const { 
        navigateToWelcomePage, 
        navigateToSearchPage, 
        navigateToNewPostFormPage, 
        navigateToProfilePage,
        navigateToErrorPage, 
    } = useNavigation();
    const { activeMainSectionBtn, setActiveMainSectionBtn } = useMainSectionBtn();

    const userDisplayName = isGuest? "Guest" : currentUser.displayName;
    console.log("currentUser is ",currentUser)
    console.log("username is "+userDisplayName)

    return (
        <div id="banner">
            <button 
                className="left"
                onClick={() => {
                    navigateToWelcomePage();
                }}>
                <svg className = "logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#FF4500"/>
                    <circle cx="9" cy="10" r="1.5" fill="#FFFFFF"/>
                    <circle cx="15" cy="10" r="1.5" fill="#FFFFFF"/>
                    <path d="M9 14c1 1.5 3 1.5 4 0" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
                    <path d="M12 4c-4.418 0-8 3.582-8 8s3.582 8 8 8s8-3.582 8-8s-3.582-8-8-8zm0 14c-3.3137 0-6-2.6863-6-6s2.6863-6 6-6s6 2.6863 6 6s-2.6863 6-6 6z" fill="#FFFFFF"/>
                </svg>

                <div id="company-name">
                    Phreddit
                </div>
            </button>

            <button className="middle">
                <input 
                    type="search" 
                    placeholder="Search Phreddit" 
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            setActiveMainSectionBtn(MainSectionBtnEnum.SEARCH);
                            navigateToSearchPage(e.target.value);
                        }
                        
                    }}
                    />
            </button>

            <div className="right-buttons" >
                <Button 
                    id="create-post-btn"
                    className="create-post" 
                    label="Create Post" 
                    disabled={isGuest} 
                    isActive={activeMainSectionBtn === MainSectionBtnEnum.CREATE_POST}
                    onClick={()=>{
                        if (!isGuest){
                            setActiveMainSectionBtn(MainSectionBtnEnum.CREATE_POST);
                            navigateToNewPostFormPage();
                        }
                    }}
                >
                </Button>
                {/* User Profile Button */}
                <Button
                    id="user-profile-btn"
                    className="profile-btn"
                    label={isGuest ? "Guest" : userDisplayName}
                    disabled={isGuest} 
                    isActive={activeMainSectionBtn === MainSectionBtnEnum.PROFILE}
                    onClick={()=>{
                        if(!isGuest){
                            setActiveMainSectionBtn(MainSectionBtnEnum.PROFILE);
                            navigateToProfilePage(currentUser._id, false);
                        }
                    }}
                >
                {isGuest ? 'Guest' : userDisplayName}
                
                </Button>

                {/* Logout Button */}
                
                {!isGuest &&(
                    <Button
                    id = "logout-btn"
                    className="logout_btn"
                    label="Logout"
                    onClick={async () =>{
                        try {
                            await manageUserSession("logout", currentUser);
                        } catch (error) {
                            navigateToErrorPage("Failed to Logout", error);
                        }
                        
                    }}
                    >
                    </Button>
                )}
            

            </div>
        </div>
    );
};

export default Banner;
