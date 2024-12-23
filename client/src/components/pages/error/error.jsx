// error.jsx

import React from "react";
import { useNavigation } from "../../../utils/navigation.js";
import { useParams } from "react-router-dom"; 
import styles from "./error.module.css"; 

function ErrorPage() {
  const { navigateToWelcomePage } = useNavigation();
  const { msg, status } = useParams();

  return (
    <div id={styles.errorContainer}>
      <h1 className={styles.errorHeader}>Error</h1>
      <br/>
      <p className={styles.errorMessage}>{msg || "An unexpected error occurred."}</p>
      <p className={styles.errorMessage}>{status || ""}</p>
      <button
        className={styles.errorButton}
        onClick={() => navigateToWelcomePage()}
      >
        Go Back to Welcome Page
      </button>
    </div>
  );
}

export default ErrorPage;
