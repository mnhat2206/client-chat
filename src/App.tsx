import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PrivateRoutes from "./PrivateRoutes";
import ControllerRoutes from "./ControllerRoutes";
import Register from "./Register";
import Login from "./Login";
import Chat from "./Chat";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/messages" element={<Chat />} />
        </Route>
        <Route element={<ControllerRoutes/>}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
