import axios from "axios";
import { useSession, update } from "next-auth/react";
import { useEffect, useRef } from "react";

// Create a single Axios instance
const axiosSecure = axios.create({
  // baseURL: 'http://localhost:5000',
  // baseURL: 'https://fashion-commerce-backend.vercel.app',
  baseURL: 'https://fc-backend-664306765395.asia-south1.run.app',
  withCredentials: true,
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

  useEffect(() => {
    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // ✅ Refresh only if token is expired & not retried already
        if (
          error?.response?.status === 401 &&
          !originalRequest._retry &&
          status === "authenticated"
        ) {
          originalRequest._retry = true;

          try {
            const { data } = await axios.post("/refresh-token", {}, {
              baseURL: 'https://fc-backend-664306765395.asia-south1.run.app', // same as axiosSecure
              withCredentials: true,
            });
            console.log(data, "data");

            // ✅ Update token in session (NextAuth)
            await update({ accessToken: data.accessToken });

            // ✅ Set new token in the retried request
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

            return axiosSecure(originalRequest);
          } catch (refreshError) {
            console.error("❌ Refresh token failed", refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [status]);

  return axiosSecure;
};
