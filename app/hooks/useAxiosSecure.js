import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

// Create a single Axios instance
const axiosSecure = axios.create({
  // baseURL: 'http://localhost:5000',
  // baseURL: 'https://fashion-commerce-backend.vercel.app',
  baseURL: 'https://fc-backend-664306765395.asia-south1.run.app',
});

export const useAxiosSecure = () => {
  const { data: session, status } = useSession();
  const interceptorRef = useRef(null);

  useEffect(() => {
    // Clear previous interceptor to avoid duplication
    if (interceptorRef.current !== null) {
      axiosSecure.interceptors.request.eject(interceptorRef.current);
    }

    // Add interceptor when session is authenticated
    if (status === "authenticated" && session?.user?.accessToken) {
      interceptorRef.current = axiosSecure.interceptors.request.use((config) => {
        config.headers.Authorization = `Bearer ${session.user.accessToken}`;
        return config;
      },
        (error) => Promise.reject(error)
      );
    }

    // Clean up on unmount or session change
    return () => {
      if (interceptorRef.current !== null) {
        axiosSecure.interceptors.request.eject(interceptorRef.current);
      }
    };
  }, [session, status]);

  return axiosSecure;
};
