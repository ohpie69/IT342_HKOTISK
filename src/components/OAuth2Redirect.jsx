import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuth2Redirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    const name = params.get("name");
    const role = params.get("role");
    const error = params.get("error");

    if (error) {
      console.error("OAuth2 Error:", error);
      navigate("/dashboard");
      return;
    }

    if (token) {
      // Store token, role, and user info
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("Authorization", `Bearer ${token}`);
      sessionStorage.setItem("role", JSON.stringify(role || "staff"));

      if (email) {
        sessionStorage.setItem("userEmail", JSON.stringify(email));
      }
      if (name) {
        sessionStorage.setItem("userName", JSON.stringify(name));
      }

      // Navigate to dashboard
      navigate("/dashboard");
    } else {
      // If no token is found, redirect to the dashboard or login page
      navigate("/dashboard");
    }
  }, [navigate]);

  return <div>Processing login...</div>;
};

export default OAuth2Redirect;