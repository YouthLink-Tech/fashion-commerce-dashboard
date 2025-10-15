"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAxiosSecure } from "../hooks/useAxiosSecure";

// Create a new context for authentication and user data
const AuthContext = createContext({
  isUserLoading: false,
});

// A Provider component that provides authentication and user data context to its children.
export const AuthProvider = ({ children }) => {
  const [isUserLoading, setIsUserLoading] = useState(true);
  const { data: session, status } = useSession();
  const axiosSecure = useAxiosSecure();
  const [existingUserData, setExistingUserData] = useState(null);

  // Provide the user state, loading state, and user data to child components through context
  useEffect(() => {
    const fetchExistingUserInformation = async () => {
      // Ensure _id is defined and valid
      if (
        status === "loading" ||
        !session?.user?._id ||
        session?.user?._id.length !== 24
      )
        return;

      try {
        // Set loading to true when the fetch starts
        setIsUserLoading(true);

        const res = await axiosSecure.get(
          `/api/user-access/single/${session?.user?._id}`,
        );
        setExistingUserData(res.data);
      } catch (error) {
        console.error("Error fetching existing user data:", error);
      } finally {
        setIsUserLoading(false);
      }
    };
    fetchExistingUserInformation();
  }, [session?.user?._id, axiosSecure, status]);

  // Provide the user state and loading state to child components through context
  return (
    <AuthContext.Provider
      value={{ isUserLoading, existingUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the authentication context
export const useAuth = () => {
  return useContext(AuthContext);
};
