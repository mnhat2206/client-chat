import { useState, useEffect, useRef } from "react";
import { AiOutlineSend, AiFillWechat } from "react-icons/ai";
import { MdOutlineAttachFile } from "react-icons/md";
import jwtDecode from "jwt-decode";
import { Cookies } from "react-cookie";
import { uniqBy } from "lodash";

import Avatar from "./Avatar";
import axiosClient from "./services/axios";

interface User {
  userId: string;
  username: string;
}

interface UserOnline {
  [userId: string]: string;
}

interface Message {
  _id: string;
  sender?: string;
  recipient?: string;
  text?: string;
  file?: string;
  createAt?: number;
  updateAt?: number;
}

const cookie = new Cookies();
const ACCESS_TOKEN = "accessToken";

function Chat() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [userList, setUserList] = useState([]);
  const [onlinePeople, setOnlinePeople] = useState<UserOnline>({});
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const messageEndRef = useRef<HTMLDivElement>(null);

  const accessToken = cookie.get(ACCESS_TOKEN);
  const presentUserData: User = {
    userId: "",
    username: "",
  };
  if (accessToken) {
    const decodeAccessToken: User = jwtDecode(accessToken);
    presentUserData.userId = decodeAccessToken.userId;
    presentUserData.username = decodeAccessToken.username;
  }

  useEffect(() => {
    connectWebSocket();
  }, []);

  useEffect(() => {
    axiosClient.get("/users").then((res) => {
      const newUserList = res.data.filter(({ _id }: { _id: string }) => {
        return _id !== presentUserData.userId;
      });

      setUserList(res.data);
      setSelectedUserId(newUserList[0]._id);
    });
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (selectedUserId) {
      // const responseBody = (response: AxiosResponse) => response;
      // const messagesRequest = axiosClient.get<Message>(`/messages/${selectedUserId}`).then(responseBody);
      // const data = (): Promise<Message[]> => messagesRequest();

      axiosClient
        .get<Message[]>(`/messages/${selectedUserId}`)
        .then((response) => {
          setMessages(response.data);
        });
    }
  }, [selectedUserId]);

  const connectWebSocket = () => {
    const webSocket = new WebSocket(import.meta.env.VITE_BASE_URL_WS);
    setWs(webSocket);
    webSocket.addEventListener("message", handleMessage);
    webSocket.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect.");
        connectWebSocket();
      }, 1000);
    });
  };

  const showPeopleOnline = (peopleArray: []) => {
    const people: UserOnline = {};
    peopleArray.forEach((p: User) => {
      if (p.userId === presentUserData.userId) return;
      people[p.userId] = p.username;
    });
    setOnlinePeople(people);
  };

  const handleMessage = (e: any) => {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showPeopleOnline(messageData.online);
    } else {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  };

  const handleSendMessage = (
    e: React.FormEvent<HTMLFormElement> | null,
    file: { name: string; data: string | ArrayBuffer | null } | null = null
  ) => {
    if (e) e.preventDefault();
    ws?.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessage,
        file,
      })
    );
    if (file) {
      axiosClient
        .get<Message[]>(`/messages/${selectedUserId}`)
        .then((response) => {
          setMessages(response.data);
        });
    } else {
      if (newMessage) {
        setNewMessage("");
        setMessages((prev) => [
          ...prev,
          {
            _id: Date.now().toString(),
            sender: presentUserData.userId,
            recipient: selectedUserId,
            text: newMessage,
          },
        ]);
      }
    }
  };

  const handleLogout = async () => {
    axiosClient.post("/logout").then(() => {
      setWs(null);
      location.reload();
    });
  };

  const sendFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileData = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(fileData);
    reader.onload = () => {
      handleSendMessage(null, {
        name: fileData.name,
        data: reader.result,
      });
    };
    e.target.value = "";
  };

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col">
        <div className="flex items-center justify-start p-4 text-3xl text-blue-600 font-bold">
          <p>
            <AiFillWechat />
          </p>
          <h3>MERN CHAT</h3>
        </div>
        <ul className="flex-grow">
          {userList.map(({ _id: userId, username }) => {
            if (presentUserData.userId && userId !== presentUserData.userId) {
              return (
                <div
                  onClick={() => setSelectedUserId(userId)}
                  key={userId}
                  className={
                    "flex items-center gap-2 px-4 py-2 border-b border-gray-100 cursor-pointer select-none" +
                    (selectedUserId === userId && " bg-gray-100")
                  }
                >
                  <Avatar
                    username={username}
                    isOnline={!!onlinePeople[userId]}
                  />
                  <li className="text-gray-700">{username}</li>
                </div>
              );
            }
          })}
        </ul>
        <div className="mb-2 text-center">
          <button
            onClick={() => handleLogout()}
            className="p-2 px-4 text-black bg-gray-300 rounded opacity-80 hover:opacity-100"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-blue-100 w-2/3 p-2">
        <div className="h-full flex-grow overflow-y-scroll mb-2">
          {uniqBy(messages, "_id").map((mess: Message) => (
            <div
              key={mess._id}
              className={
                "pr-2 " +
                (presentUserData.userId === mess.sender
                  ? "text-right"
                  : "text-left")
              }
            >
              {mess.text && (
                <div
                  className={
                    "text-left inline-block p-2 my-2 rounded-md text-sm " +
                    (presentUserData.userId === mess.sender
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-500")
                  }
                >
                  {mess.text}
                </div>
              )}
              {mess.file && (
                <a
                  href={import.meta.env.VITE_BASE_URL_FILE + mess.file}
                  target="_blank"
                  download
                  className={
                    "text-left inline-block p-2 my-2 rounded-md text-sm cursor-pointer underline " +
                    (presentUserData.userId === mess.sender
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-500")
                  }
                >
                  {mess.file}
                </a>
              )}
            </div>
          ))}
          <div ref={messageEndRef}></div>
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.currentTarget.value)}
            placeholder="Type your message here"
            className="flex-grow bg-white border rounded-sm p-2"
          />
          <label className="bg-gray-400 p-2 text-white rounded-sm flex items-center cursor-pointer">
            <MdOutlineAttachFile />
            <input type="file" hidden onChange={sendFile} />
          </label>
          <button
            type="submit"
            className="bg-blue-500 p-2 text-white rounded-sm"
          >
            <AiOutlineSend />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
