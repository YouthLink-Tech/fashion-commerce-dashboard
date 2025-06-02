import axios from "axios";

const axiosPublic = axios.create({
  // baseURL: 'http://localhost:5000',
  // baseURL: 'https://fashion-commerce-backend.vercel.app',
  baseURL: 'https://fc-backend-664306765395.asia-south1.run.app',
})

const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;