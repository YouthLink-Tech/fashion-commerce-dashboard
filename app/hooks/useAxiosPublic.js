import axios from "axios";
import { BACKEND_URL } from "../config/config";

const axiosPublic = axios.create({
  baseURL: `${BACKEND_URL}`,
})

const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;