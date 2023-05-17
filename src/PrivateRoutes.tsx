import { useMemo } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import jwtDecode from "jwt-decode";

const ACCESS_TOKEN = "accessToken";

const cookies = new Cookies();

function PrivateRoutes() {
  const auth = useMemo(() => {
    const checkJwtDecode = () => {
      const token = { accessToken: cookies.get(ACCESS_TOKEN) };
      if (token.accessToken) {
        try {
          jwtDecode(token.accessToken);
        } catch (error) {
          console.log("[ERROR JWT PrivateRoutes]", error);
        }
      }
      return token;
    };
    return checkJwtDecode();
  }, []);

  return auth.accessToken ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoutes;
