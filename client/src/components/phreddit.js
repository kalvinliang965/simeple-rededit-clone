import { 
  useEffect,
  useState,
  useContext,
  createContext,
} from 'react';

import { Routes, Route } from "react-router-dom";

import axios from "axios";
import { LoadingSpinner } from "./pages/PageCreater.jsx";
import Banner from './Banner.jsx';
import Nav from './Nav.jsx';
import { LoginContext } from "../App.js";
import config from "../config.js";

import HomePage from "./pages/HomePage.jsx";
import CommunityPage from './pages/CommunityPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import PostPage from './pages/PostPage.jsx';
import CommunityPageForm from "./pages/CommunityPageForm.jsx";
import PostPageForm from './pages/PostPageForm.jsx';
import CommentPageForm from './pages/CommentPageForm.jsx';

import ErrorPage from "./pages/error/error.jsx";
import { ROUTES } from "../routes/routes.js";
import MainSectionBtnEnum from './MainSectionBtnEnum.js';
import UserProfilePage from './pages/profiles/UserProfilePage.jsx';

import Cookies from 'js-cookie';

// Contain button that modify the main content component
export const MainSectionBtnContext = createContext();

export const useMainSectionBtn = () => {
  return useContext(MainSectionBtnContext);
}

export default function Phreddit() {  
  
  const { setCurrentUser, userDataVersion } = useContext(LoginContext);
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeMainSectionBtn, setActiveMainSectionBtn] = useState(MainSectionBtnEnum.HOME);
  // only check on intiali render
  useEffect(() => {
    async function startSession() {
      try {
        setIsLoading(true);
        const res = await axios.get(`${config.api_base_url}/users`, {withCredentials: true});

        // return false when session not exist
        if (res.data) {
          console.log(`[INFO] User login before`);
          setCurrentUser(res.data);
        } else {
          console.log(`[INFO] Session cookies does not exist`);
          console.log("[INFO] Continue as Guest");
          setCurrentUser(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    startSession();

    console.log(Cookies.get("name"));
  }, [userDataVersion, setCurrentUser]);

  if (isLoading) {
    return <LoadingSpinner/>
  }

  return (
   <>
    <MainSectionBtnContext.Provider value={{activeMainSectionBtn, setActiveMainSectionBtn}}>
      <Banner />
      <Nav /> 
      {/* Our content section*/}
      <div id='main'>
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />}/>
          <Route path={ROUTES.ERROR} element={<ErrorPage />}/>
          <Route path={ROUTES.COMMUNITY} element={<CommunityPage />} />
          <Route path={ROUTES.SEARCH} element={<SearchPage/>}/>
          <Route path={ROUTES.POST} element={<PostPage/>}/>
          <Route path={ROUTES.PROFILE} element={<UserProfilePage/>} />
          <Route path={ROUTES.COMMUNITY_FORM} element={<CommunityPageForm />} />
          <Route path={ROUTES.POST_FORM} element={<PostPageForm />} /> 
          <Route path={ROUTES.COMMENT_FORM} element={<CommentPageForm />} />
        </Routes>
      </div>
    </MainSectionBtnContext.Provider>
   </>
   
  );
}

