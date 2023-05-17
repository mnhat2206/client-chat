import { useMemo } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import jwtDecode from "jwt-decode";

const ACCESS_TOKEN = "accessToken";

const cookies = new Cookies();

function ControllerRoutes() {
  const auth = useMemo(() => {
    const checkJwtDecode = () => {
      const token = { accessToken: cookies.get(ACCESS_TOKEN) };
      if (token.accessToken) {
        try {
          jwtDecode(token.accessToken);
        } catch (error) {
          console.log("[ERROR JWT ControllerRoutes]", error);
        }
      }
      return token;
    };
    return checkJwtDecode();
  }, []);

  return auth.accessToken ? <Navigate to="/messages" /> : <Outlet />;
}

export default ControllerRoutes;
