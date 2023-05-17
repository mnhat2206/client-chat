import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import axiosClient from "./services/axios";

interface UserData {
  email: string;
  username: string;
  password: string;
}

function Register() {
  const [registerData, setRegisterData] = useState<UserData>({
    email: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await axiosClient.post<UserData>("register", registerData);

      if (result.status === 201) {
        return navigate("/login");
      }
    } catch (error) {
      console.log("[ERROR]", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 h-screen flex flex-col justify-center">
      <form className="w-64 mx-auto" onSubmit={handleSubmit}>
        <input
          value={registerData.email}
          onChange={(e) =>
            setRegisterData({
              ...registerData,
              email: e.currentTarget.value,
            })
          }
          type="email"
          placeholder="email"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={registerData.username}
          onChange={(e) =>
            setRegisterData({
              ...registerData,
              username: e.currentTarget.value,
            })
          }
          type="text"
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={registerData.password}
          onChange={(e) =>
            setRegisterData({
              ...registerData,
              password: e.currentTarget.value,
            })
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
          Already a member?
          <Link to={"/login"} className="ml-1">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
