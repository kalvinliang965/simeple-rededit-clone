// login.jsx

import React from "react";
import { useState, useContext } from "react";
import styles from "./login.module.css"; // this is for module styling
import { LoginContext } from "../../../App";
import { LoadingSpinner } from "../PageCreater";
import { useNavigation } from "../../../utils/navigation.js";

function Login() {
    
    const { manageUserSession, currentUser, isGuest } = useContext(LoginContext);

    const {navigateToHomePage, navigateToErrorPageFull } = useNavigation();

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState({
        email: "",
        password: "",
    });

    function handleTextChange(field, value) {
        setLoginData((prevData) => ({
          ...prevData,
          [field]: value,
        }));
      }

    const [isLoading, setIsLoading] = useState(false);

    async function login(e) {
        e.preventDefault();

        // clear previous error 

        setError({
            email: "",
            password: "",
        });

        const { email, password } = loginData;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) {
            setError(prevError => ({
                ...prevError,
                email: "Please enter an email address."
            }));
            return;
        }

        if (!password) {
            setError(prevError => ({
                ...prevError,
                password: "Please enter a password."
            }));
            return;
        }

        setIsLoading(true);
        try {

            // if user is already login, logout first
            if (!isGuest) {
                console.log(`[INFO] Logging out current user: ${currentUser.displayName}`);
                await manageUserSession("logout", currentUser);
            }
            const user = {
                email,
                password,
            }
            await manageUserSession("login", user);
            navigateToHomePage();
        } catch (err) {
            console.error("[ERROR] Logined failed:", err.response?.data || err.message);
            if (err.response?.data?.field) {
                setError((prevError) => ({
                    ...prevError,
                    [err.response.data.field]: err.response.data.error,
                }));
            } else if (err.response?.data?.error) {
                setError((prevError) => ({
                    ...prevError,
                    general: err.response.data.error,
                }));
            } else {
                navigateToErrorPageFull("Logined failed", err.message);
            }
            
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return <LoadingSpinner/>
    }
    
    return (
        <div id={styles.loginContainer}>
            <h1>Login</h1>
            <br/>
            <form onSubmit={login} id={styles.loginFormContainer}>
                <div className={styles.loginFormGroup}>
                    <input 
                        type="text" 
                        id="email"
                        value={loginData.email}
                        placeholder="Email"
                        onChange={(e) => handleTextChange("email", e.target.value)}
                    />
                </div>

                <div className={styles.loginErrorMsg}>{error.email}</div>
                

                <div className={styles.loginFormGroup}>
                    <input 
                        type="text" 
                        id="password"
                        placeholder="Password"
                        value={loginData.password}
                        onChange={(e) => handleTextChange("password", e.target.value)
                    }/>
                </div>

                <div className={styles.loginErrorMsg}>{error.password}</div>

                <div className={styles.loginFormGroup}>
                    <button className={styles.loginButton} type="submit">
                        Login
                    </button>

                    <button 
                        onClick={async () => {
                            if (isGuest) {
                                navigateToHomePage();
                            } else {
                                await manageUserSession("logout", currentUser);
                                navigateToHomePage();
                            }
                        }} 
                        className={styles.loginButton} type="button">
                        Continue as Guest
                    </button>
                </div>

                <div>Don't have an account? <a href="/register">Signup</a></div>    

            </form>
        </div>
    )
}

export default Login;
