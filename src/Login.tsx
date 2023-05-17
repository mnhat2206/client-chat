import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import axiosClient from "./services/axios";

function Login() {
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post("login", loginData);
      navigate("/messages", { replace: true });
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 h-screen flex flex-col justify-center">
      <form className="w-64 mx-auto" onSubmit={handleSubmit}>
        <input
          value={loginData.username}
          onChange={(e) =>
            setLoginData({ ...loginData, username: e.currentTarget.value })
          }
          type="text"
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={loginData.password}
          onChange={(e) =>
            setLoginData({ ...loginData, password: e.currentTarget.value })
          }
          type="password"
          placeholder="password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button className="flex bg-blue-500 justify-center items-center text-white w-full rounded-sm p-2">
          Sign up
          {loading && (
            <AiOutlineLoading3Quarters className="animate-spin ml-2" />
          )}
        </button>
      </form>
      <div className="text-center mt-4">
        <div>
          Dont have an account?
          <Link to={"/register"} className="ml-1">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
