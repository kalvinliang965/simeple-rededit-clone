// CommunityPageForm.jsx

import config from "../../config.js";
import axios from 'axios';
import { useState, useContext,useEffect } from "react";
import { LoginContext } from "../../App.js";
import { useNavigation } from "../../utils/navigation.js";
import { useParams, useLocation } from "react-router-dom";
import { useImmer } from "use-immer";

function CommunityPageForm(){
    const { currentUser, incrementUserDataVersion } = useContext(LoginContext);
    const { communityId, mode } = useParams();
    const { navigateToCommunityPage, navigateToErrorPage, navigateBack } = useNavigation();

    const [communityFormState, updateCommunityFormState] = useImmer({
        communityName: "",
        communityDescription: "",
        isEdit: null,     // create | edit
        prevName: null,   // if edit mode, community name before modified
    });
    

    const [errorData, updateErrorData] = useImmer({
        nameError: "",
        descriptionError:""
    });

    // Get community Data if it is in edit mode
    useEffect(() => {

        if (mode === "edit") {

            updateCommunityFormState(draft => {
                draft.isEdit = true;
            });

            if (!communityId) {
                navigateToErrorPage("Community Form edit mode error", "CommunityId not provided");
            }

            // Fetch existing community data
            (async () => {
                try {
                    const res = await axios.get(`${config.api_base_url}/communities/${communityId}`);

                    updateCommunityFormState(draft => {
                        draft.communityName = res.data.name;
                        draft.communityDescription = res.data.description;
                        draft.prevName = res.data.name;
                    });
                    
                } catch (err) {
                    console.error("[ERROR] Error fetching community data for editing", err.message);
                    navigateToErrorPage("Error fetching community data", err.message);
                }
            })();
        } 
    }, [communityId, mode]);


    async function handleCommunityFormSubmit (event){
        event.preventDefault();

        let isValid = true;

        updateErrorData(draft => {
            draft.nameError = "";
            draft.descriptionError = "";
        });

        if (!communityFormState.communityName){
            console.error("Create community error: name is not enter");
            updateErrorData(draft => {
                draft.nameError = 'Community name is required.';
            });
            isValid = false;
        } else if (communityFormState.communityName.length > 100) {
            console.error("Create community error: name is too long");
            updateErrorData(draft => {
                draft.nameError = 'Community name cannot exceed 100 characters. ';
            });
            isValid = false;
        }

        if (!communityFormState.communityDescription || communityFormState.communityDescription.length === 0){
            console.error("Create community error: No description");
            updateErrorData(draft => {
                draft.descriptionError = 'Description is required';
            });
            isValid=false;
        } else if (communityFormState.communityDescription.length>500){
            console.error("Create commnity error: Description is too long");
            updateErrorData(draft => {
                draft.descriptionError = 'Description cannot exceed 500 characters';}
            );
            isValid  = false;
        }

        if (!isValid){
            console.error("Stop create form submission");
            return;
        }

        // Check if community name is unique
        try {

            const existingCommunity = await axios.get(`${config.api_base_url}/communities/name`, {
                params: {
                    communityName: communityFormState.communityName,
                },
            });
            
            if (existingCommunity.data.exists &&
                    // if edit mode, make sure communityName save is not its original name 
                    (!communityFormState.isEdit || communityFormState.prevName !== communityFormState.communityName)) {

                updateErrorData(draft => {
                    draft.nameError = 'Community name already exists. Please choose another.'}
                );
                return;
            }
        } catch (err) {
            console.error("[ERROR] Error in checking community name uniqueness");
            console.error(`[ERROR] Message: ${err.message}`);
            navigateToErrorPage("Error in Community Name Validation", err.message);
            return;
        }

        try{
            if (communityFormState.isEdit) {
                // Update existing community
                const updateUrl = `${config.api_base_url}/communities/${communityId}`;
                await axios.put(updateUrl, {
                    name: communityFormState.communityName,
                    description: communityFormState.communityDescription,
                });
                console.log(`[INFO] Community updated successfully`);
                navigateBack();
            } 
            
            // Creating the new community
            else{
                const newCommunity = {
                    name: communityFormState.communityName,
                    description: communityFormState.communityDescription,
                    creator:currentUser.displayName,
                    owner:currentUser.displayName,
                    members: [currentUser.displayName], // The logged-in user is the creator and first member
                    memberCount: 1,
                    postIDs: [],
                    startDate: new Date()
                };
                const postUrl = `${config.api_base_url}/communities`;
                const res = await axios.post(postUrl, {
                    newCommunity
                }, {
                    withCredentials: true
                });
                console.log(`[INFO] New Community is created`);
                console.log(res.data);
                navigateToCommunityPage(res.data._id);
            }

            incrementUserDataVersion();
        } catch (err) {
            console.error("[ERROR] Error in adding community data");
            console.error(`[ERROR] Message: ${err.message}`);
            navigateToErrorPage("Community creation failed", err.message);
        }
    }


    return (
        <>
            <h1>{communityFormState.isEdit ? "Edit Community" : "Create a New Community"}</h1>
            <form 
                id = "createCommunityForm"
                onSubmit={handleCommunityFormSubmit}
            >
                <label htmlFor="communityName">Community Name: (No more than 100 characters)</label>
                <input
                    type="text"
                    id="communityName"
                    value={communityFormState.communityName}
                    onChange={(e) => updateCommunityFormState(draft => {
                        draft.communityName = e.target.value;})}
                />

                <div className="error-message" id="nameError">
                    {errorData.nameError}
                </div>

                <br/>
                
                <label htmlFor="communityDescription">
                    Description: (No more than 500 characters)
                </label>
                
                <textarea 
                    id="communityDescription" 
                    value={communityFormState.communityDescription}
                    onChange={(e) => updateCommunityFormState(draft => {
                        draft.communityDescription = e.target.value})}
                ></textarea>
                
                <div className="error-message" id="descriptionError">
                    {errorData.descriptionError}
                </div>
                
                <br/>
                
                <button 
                    type="submit" 
                    id="newComBtnClicked"
                >
                   {communityFormState.isEdit ? "Save Changes" : "Create Community"}
                </button>
            </form>
        </>
    );
}

export default CommunityPageForm;


//enter the community name problem???
//when I enter the community name, the nav does not show

