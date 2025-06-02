"use client";
import { useEffect, useState } from "react";
import useAxiosPublic from "@/app/hooks/useAxiosPublic";
import Loading from "@/app/components/shared/Loading/Loading";
import SetupForm from "@/app/components/layout/AccountSetup/SetupForm";
import AccessVerificationFailed from "@/app/components/layout/AccountSetup/AccessVerificationFailed";

export default function SetupPage() {
  const [isValidToken, setIsValidToken] = useState(null); // State to store token validation status
  const [errorMessage, setErrorMessage] = useState(""); // For displaying error message
  const axiosPublic = useAxiosPublic();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(null);

  // Get the token from URL only once
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenFromURL = searchParams.get("token");
    if (tokenFromURL) {
      setToken(tokenFromURL);
    } else {
      setIsValidToken(false);
      setErrorMessage("Token is required. Please provide a valid token.");
    }
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;

      try {
        const response = await axiosPublic.post("/validate-token", { token });

        if (response.status === 200 && response.data.message === "Access verified successfully." && response.data.email) {
          setIsValidToken(true); // Token is valid
          setEmail(response.data.email);
        } else {

          setIsValidToken(false);
          setErrorMessage(response.data.message || "Invalid token");

        }
      } catch (error) {
        setIsValidToken(false);

        // Extract the server's error response message
        if (error.response && error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("Error validating token");
        }
      }
    };

    validateToken();
  }, [token, axiosPublic]);

  if (isValidToken === null) {
    return <Loading /> // Optional: Show loading state until token is validated
  }

  if (!isValidToken) {
    return (
      <AccessVerificationFailed errorMessage={errorMessage} />
    );
  }

  return <SetupForm email={email} isValidToken={isValidToken} />;
}