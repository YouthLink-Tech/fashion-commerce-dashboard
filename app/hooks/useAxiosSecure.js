// lib/axiosSecure.js
import axios from "axios";
import { getSession } from "next-auth/react";

const axiosSecure = axios.create({
  baseURL: "https://fc-backend-664306765395.asia-south1.run.app",
});

// Attach bearer token from session
axiosSecure.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (session?.user?._id) {
    const token = session?.accessToken || session?.jwt; // Use your token field
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosSecure;