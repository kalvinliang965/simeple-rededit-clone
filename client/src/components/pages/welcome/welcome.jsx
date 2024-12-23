// welcome.jsx

import React, { useContext } from "react";
import styles from "./welcome.module.css";
import { useNavigation } from "../../../utils/navigation";
import { LoginContext } from "../../../App";

function Welcome() {
    
    const { navigateToLoginPage, 
            navigateToRegisterPage,
            navigateToHomePage } = useNavigation();

    const { isGuest, currentUser, manageUserSession } = useContext(LoginContext);

    return (
        <div className={styles.welcomeContainer}>
            <h1>Welcome</h1>
            <br/>
            <br/>
            <div className={styles.buttonGroup}>
                <button
                    className={styles.welcomeButton}
                    onClick={() => navigateToLoginPage()}
                >
                    Login
                </button>
                <button
                    className={styles.welcomeButton}
                    onClick={() => navigateToRegisterPage()}
                >
                    Register
                </button>
                <button
                    className={styles.welcomeButton}
                    onClick={async () => {
                        if (!isGuest) {
                            console.log(`[INFO] Logging out current user ${currentUser.displayName}`);
                            await manageUserSession("logout", currentUser);
                        }
                        navigateToHomePage();
                    }}
                >
                    Continue as Guest
                </button>
            </div>
        </div>
    );
}

export default Welcome;
