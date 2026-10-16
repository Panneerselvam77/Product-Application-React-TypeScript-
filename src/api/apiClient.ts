// https://dummyjson.com/
import axios from "axios";

const BaseUrl = axios.create({
  baseURL: "https://dummyjson.com/",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

BaseUrl.interceptors.response.use(
  (response) => response.data, // Automatically strip the Axios wrapper and return just the data
  (error) => {
    // Handle specific HTTP status codes globally
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Redirect to login or refresh token
          console.error("Unauthorized! Redirecting to login...");
          //   localStorage.removeItem("user_token");
          //   window.location.href = "/login";
          break;
        case 403:
          console.error("Forbidden: You do not have permission.");
          break;
        case 500:
          console.error("Internal Server Error. Please try again later.");
          break;
        default:
          console.error(`API Error: ${error.response.statusText}`);
      }
    } else if (error.request) {
      console.error("Network Error: No response received from server.");
    } else {
      console.error("Error setting up the request:", error.message);
    }
    return Promise.reject(error);
  },
);

export default BaseUrl;
