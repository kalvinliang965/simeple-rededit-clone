
import { useState, useEffect, useContext } from "react";
import {Button} from "./pages/PageCreater.jsx";
import config from "../config.js";
import axios from 'axios';
import { useNavigation } from "../utils/navigation.js";

import MainSectionBtnEnum from "./MainSectionBtnEnum.js";
import { useMainSectionBtn } from "./phreddit.js";
import { LoginContext } from "../App.js";

function Community({community}) {
    const {navigateToCommunityPage} = useNavigation();

    const { activeMainSectionBtn, setActiveMainSectionBtn } = useMainSectionBtn();

    return ( 
        <li>
            <Button 
                label={community.name} 
                id={community._id} 
                isActive={activeMainSectionBtn === community._id} 
                onClick={() => {
                    navigateToCommunityPage(community._id);
                    setActiveMainSectionBtn(community._id);
                }}>    
            </Button>
        </li>
    )
}

function Nav() {
    
    const { navigateToHomePage, navigateToNewCommunityPage } = useNavigation();

    const [ communities, setCommunities ] = useState([]);

    const { activeMainSectionBtn, setActiveMainSectionBtn } = useMainSectionBtn();
    const { isGuest, currentUser,  } = useContext(LoginContext);

    const { navigateToErrorPage } = useNavigation();

    // if page change and update community list accordingly
    useEffect(() => {
        // these function will be pass down to components
        async function fetchCommunityData() {
            console.log("[INFO] Fetching community data");
            try {
                const { data: allCommunities } = await axios.get(`${config.api_base_url}/communities`);
                
                if (!isGuest) {
                    const userCommunity = currentUser.communities;
                    const nonUserCommunities = allCommunities.filter(community => 
                        !userCommunity.some((userCommunity) => userCommunity._id === community._id)
                    );
                    setCommunities([...userCommunity, ...nonUserCommunities]);
                } else {
                    setCommunities(allCommunities);
                }
            
            } catch (err) {
                console.error("[ERROR] Error in fetching community data");
                console.error(`[ERROR] Message: ${err.message}`);
                navigateToErrorPage("Error fetching community data in navbar", err.message);
            }
        }
        fetchCommunityData();
    },[]); 

    return (
        <div id="nav">

            <Button
                id="home-btn"
                label={<a href="#">Home</a>}
                onClick={() => {
                    setActiveMainSectionBtn(MainSectionBtnEnum.HOME);
                    navigateToHomePage();
                }}
                isActive={activeMainSectionBtn === MainSectionBtnEnum.HOME}
            />
            <hr id="home-com-border"/>
            <Button
                id="create-community-btn"
                label="Create Community"
                disabled={isGuest}
                isActive={activeMainSectionBtn === MainSectionBtnEnum.CREATE_COMMUNITY}
                onClick={()=>{
                    setActiveMainSectionBtn(MainSectionBtnEnum.CREATE_COMMUNITY);
                    navigateToNewCommunityPage();
                }}
            />
            <div id="communities-container">
                <div className="header">
                    Communities
                </div>

                <ol id="communities-list">
                    {communities.map((community) =>{
                        return (
                        <Community 
                            key={community._id} 
                            community={community}
                        />
                    )
                    })}
                </ol>
            </div>

        </div>
    )
}

export default Nav;
