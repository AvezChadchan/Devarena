import axios from "axios";
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "/api",
  withCredentials: true, // important
  timeout: 20000,
});
export default api;
