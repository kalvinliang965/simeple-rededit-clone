// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import Phreddit from './components/phreddit.js'
import Register from './components/pages/register/register.jsx';
import Login from './components/pages/login/login.jsx';
import Welcome from './components/pages/welcome/welcome.jsx';
import ErrorPage from './components/pages/error/error.jsx';

import { 
  createContext, 
  useState, 
  useCallback, 
  useMemo, 
} from 'react';
import { BrowserRouter as 
Router, 
Routes, 
Route, } from "react-router-dom";

import { ROUTES } from "./routes/routes.js"

import axios from 'axios';
import config from './config.js';
import { useNavigation } from './utils/navigation.js';

export const LoginContext = createContext(null);

function App() {

  return (
      <Router>
        <AppRoutes/>
      </Router>
  )
}

function AppRoutes() {

  // if current user is null => logout or guest
  const [currentUser, setCurrentUser] = useState(null);

  const [userDataVersion, setUserDataVersion] = useState(0);
  

  const { navigateToWelcomePage } = useNavigation();

  // login/logout
  const manageUserSession = useCallback(async (action, user) => {
    if (action === "login") {
      try {
        const response = await axios.post(`${config.api_base_url}/users/login`, 
            { user }, 
            { withCredentials: true }
        );
        console.log("[INFO] User data retrieve successfully:", response.data.displayName);
        setCurrentUser(response.data);
      } catch (error) {
        throw error;
      }
      
    } else if (action === "logout") {
      try {
        const response = await axios.post(`${config.api_base_url}/users/logout`, 
            { user }, 
            { withCredentials: true }
        );
        console.log("[INFO] User logged out successfully:", response.data.displayName);
        setCurrentUser(null);
        navigateToWelcomePage();
      } catch (error) {
        throw error
      }
    }
  }, [navigateToWelcomePage]);

  // When we modify user data on server we call `incrementUserDataVersion()`
  const incrementUserDataVersion = useCallback(() => {
    console.log("Incrementing userDataVersion");
    setUserDataVersion((prev) => {
      console.log("Previous version:", prev);
      return prev + 1;
    });
  }, []);
  
  
  const loginContexts = useMemo(()=> ({
    currentUser,
    manageUserSession,
    setCurrentUser,
    isGuest: !currentUser,
    userDataVersion, // might be useful when debugging
    incrementUserDataVersion,
  }), [currentUser, manageUserSession, userDataVersion, incrementUserDataVersion]);

  
  return (
    <LoginContext.Provider value={loginContexts}>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login/>}/>
        <Route path={ROUTES.REGISTER} element={<Register/>}/>
        <Route path={ROUTES.WELCOME} element={<Welcome/>}/>
        <Route path={ROUTES.ERROR} element={<ErrorPage/> } />
        <Route
          path={`${ROUTES.APP_BASE}/*`}
          element={
            <section className="phreddit">
              <Phreddit />
            </section>
          }/>
      </Routes>
    </LoginContext.Provider>
      
  );
}

export default App;
