import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import NewPost from "./pages/NewPost";
import PublicationDetails from "./pages/PublicationDetails";
import UserProfile from "./pages/UserProfile";
import UserRegister from "./pages/UserRegister";

function App() {
  return (
    <div>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<UserRegister />} />

          {/* Rutas que requieren iniciar sesión */}
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil/:id" element={<UserProfile />} />
            <Route path="/nuevo-post" element={<NewPost />} />
          </Route>

          {/* Detalle de publicación */}
          <Route path="/publicacion/:id" element={<PublicationDetails />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
