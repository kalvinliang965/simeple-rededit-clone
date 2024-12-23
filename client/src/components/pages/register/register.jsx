import React from "react";
import {useState, useContext} from "react";

import styles from "./register.module.css"; // this is for module styling
import {useNavigation} from "../../../utils/navigation.js";
import axios from "axios";
import config from "../../../config.js";
import { LoginContext } from "../../../App.js";
import { LoadingSpinner } from "../PageCreater";

function Register() {

    const { navigateToWelcomePage, navigateToHomePage, navigateToErrorPageFull }= useNavigation();

    const { manageUserSession, currentUser, isGuest } = useContext(LoginContext);

    const [signupData, setSigupData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        displayName: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState({
        email: "",
        firstName: "",
        lastName: "",
        displayName: "",
        password: "",
        confirmPassword: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    function handleTextChange(field, value) {
        setSigupData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // clear previous error 

        setError({
            email: "",
            firstName: "",
            lastName: "",
            displayName: "",
            password: "",
            confirmPassword: "",
        });

        const { email, firstName, lastName, displayName, password, confirmPassword } = signupData;

        // client side validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) {
            setError(prevError => ({
                ...prevError,
                email: "Please enter an email address."
            }));
            return;
        }

        if (!firstName) {
            setError((prevError) => ({
                ...prevError,
                firstName: "Please enter your first name.",
              }));
            return;
        }

        if (!lastName) {
            setError((prevError) => ({
                ...prevError,
                lastName: "Please enter your last name.",
              }));
            return;
        }

        if (!displayName) {
            setError((prevError) => ({
              ...prevError,
              displayName: "Please enter a display name.",
            }));
            return;
        }

        if (displayName.length > 15) {
            setError((prevError) => ({
                ...prevError,
                displayName: "Display name cannot exceed 15.",
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

        const normalizedPassword = password.trim().normalize('NFC').toLowerCase();
        const normalizedFirstName = firstName.trim().normalize('NFC').toLowerCase();
        const normalizedLastName = lastName.trim().normalize('NFC').toLowerCase();
        const normalizedDisplayName = displayName.trim().normalize('NFC').toLowerCase();

        if (
            normalizedPassword.includes(normalizedFirstName) ||
            normalizedPassword.includes(normalizedLastName) ||
            normalizedPassword.includes(normalizedDisplayName)
        ) {
            setError(prevError => ({
            ...prevError,
            password: "For enhanced security, your password should not include your first name, last name, or display name. Consider using a mix of letters, numbers, and symbols."
            }));
            return;
        }
          


        if (!confirmPassword) {
            setError(prevError => ({
                ...prevError,
                confirmPassword: "Please enter a password."
            }));
            return;
        }

        if (password !== confirmPassword) {
            setError(prevError => ({
                ...prevError,
                confirmPassword: "Password not match!"
            }));
            return;
        }

        setIsLoading(true);
        try {
            const newUser = {
                email,
                firstName,
                lastName,
                displayName,
                password,
                admin: false,
            }
            const response = await axios.post(`${config.api_base_url}/users/register`, {
                newUser,
            });
            console.log("[INFO] User registered successfully:", response.data);
            navigateToWelcomePage();
        } catch (err) {
            console.error("[ERROR] Registration failed:", err.response?.data || err.message);

            if (err.response?.data?.field) {
                // Set specific field error
                setError((prevError) => ({
                    ...prevError,
                    [err.response.data.field]: err.response.data.error,
                }));
            } else if (err.response?.data?.error) {
                // Set general error message
                setError((prevError) => ({
                    ...prevError,
                    general: err.response.data.error,
                }));
            } else {
                navigateToErrorPageFull("Registration failed", err.message);
            }
            
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return <LoadingSpinner/>
    }

    return (
        error.general ||
        <div id={styles.registerContainer}>
            <h1>Signup</h1>
            <br/>
            <form onSubmit={handleSubmit} id={styles.registerFormContainer}>
                <div className={styles.registerFormGroup}>
                    <input 
                        type="text" 
                        id="register-email"
                        value={signupData.email}
                        placeholder="Email"
                        onChange={(e) => handleTextChange("email", e.target.value)}
                    />
                </div>

                <div className={styles.registerErrorMsg}>{error.email}</div>

                <div className={styles.registerFormGroup}>
                    <input 
                        type="text" 
                        id="register-firstName"
                        value={signupData.firstName}
                        placeholder="First Name"
                        onChange={(e) => handleTextChange("firstName", e.target.value)}
                    />
                </div>

                <div className={styles.registerErrorMsg}>{error.firstName}</div>

                <div className={styles.registerFormGroup}>
                    <input 
                        type="text" 
                        id="register-lastName"
                        value={signupData.lastName}
                        placeholder="Last Name"
                        onChange={(e) => handleTextChange("lastName", e.target.value)}
                    />
                </div>

                <div className={styles.registerErrorMsg}>{error.lastName}</div>
                

                <div className={styles.registerFormGroup}>
                    <input 
                        type="text" 
                        id="register-displayName"
                        value={signupData.displayName}
                        placeholder="Display Name"
                        onChange={(e) => handleTextChange("displayName", e.target.value)}
                    />
                </div>

                <div className={styles.registerErrorMsg}>{error.displayName}</div>
                
                <div className={styles.registerFormGroup}>
                    <input 
                        type="text" 
                        id="register-password"
                        placeholder="Create Password"
                        value={signupData.password}
                        onChange={(e) => handleTextChange("password", e.target.value)
                    }/>
                </div>
                
                <div className={styles.registerErrorMsg}>{error.password}</div>

                <div className={styles.registerFormGroup}>
                    <input 
                        type="text" 
                        id="register-confirmPassword"
                        placeholder="Confirm Password"
                        value={signupData.confirmPassword}
                        onChange={(e) => handleTextChange("confirmPassword", e.target.value)
                    }/>
                </div>

                <div className={styles.registerErrorMsg}>{error.confirmPassword}</div>

                <div className={styles.registerFormGroup}>
                    <button className={styles.registerButton} type="submit">
                        Signup
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
                        className={styles.registerButton} type="button">
                        Continue as Guest
                    </button>
                </div>
                    
                
                <div>Already have an account? <a href="/login">Login</a></div>    

            </form>
        </div>
    )
}

export default Register;
