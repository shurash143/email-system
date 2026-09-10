import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://email-system-zj1k.onrender.com/api",

  withCredentials: true,
});

export default API;