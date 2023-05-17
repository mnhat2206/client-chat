import axios from "axios";
import { Cookies } from "react-cookie";
import jwtDecode from "jwt-decode";
import dayjs from "dayjs";

const ACCESS_TOKEN = "accessToken";
const REFRESH_TOKEN = "refreshToken";
const AUTHORIZATION = "authorization";

interface UserToken {
  username: string;
  iat: number;
  exp: number;
}

const cookies = new Cookies();

const configHeaders = {
  "Content-Type": `application/json`,
  [AUTHORIZATION]: `bearer ${cookies.get(ACCESS_TOKEN)}`,
};

const axiosClient = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: configHeaders,
});

axiosClient.interceptors.request.use(async (config: any) => {
  // path not check token
  const nonSecurePaths = ["login", "register", "refreshToken"];
  if (config.method === "post" && nonSecurePaths.includes(config.url)) {
    return config;
  }

  // path check token
  try {
    const expTime = jwtDecode<UserToken>(cookies.get(ACCESS_TOKEN))?.exp;
    const isExpired = dayjs.unix(expTime).diff(dayjs()) < 1;
    if (!isExpired) {
      const isAccessToken = config.headers[AUTHORIZATION]?.split(" ")[1];
      if (isAccessToken === "undefined") {
        config.headers[AUTHORIZATION] = `Bearer ${cookies.get(ACCESS_TOKEN)}`;
      }
      return config;
    }

    await axios.post(
      `${import.meta.env.VITE_BASE_URL}refreshToken`,
      {
        refreshToken: cookies.get(REFRESH_TOKEN),
      },
      {
        withCredentials: true,
        headers: configHeaders,
      }
    );
    config.headers[AUTHORIZATION] = `Bearer ${cookies.get(ACCESS_TOKEN)}`;
    return config;
  } catch (error: any) {
    if (error.message.includes("token")) {
      localStorage.clear();
      cookies.remove(ACCESS_TOKEN);
      cookies.remove(REFRESH_TOKEN);
    }
    return Promise.reject(error);
  }
});

axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (err) => {
    if (err.response.status === 401 || err.response.status === 403) {
      localStorage.clear();
      cookies.remove(ACCESS_TOKEN);
      cookies.remove(REFRESH_TOKEN);
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
