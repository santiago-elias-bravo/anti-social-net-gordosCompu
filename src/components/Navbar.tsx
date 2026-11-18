import { useEffect, useState } from "react";
import { Container, Navbar as BootstrapNavbar, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

interface UsuarioBusqueda {
  _id: string;
  nickName: string;
  email: string;
}

function Navbar() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [usuarios, setUsuarios] = useState<UsuarioBusqueda[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const usuariosFiltrados = usuarios
    .filter((usuario) =>
      usuario.nickName.toLowerCase().includes(busqueda.trim().toLowerCase()),
    )
    .slice(0, 6);
  const { user, logout } = useUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }
  useEffect(() => {
    async function cargarUsuarios() {
      try {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) return;

        const data: UsuarioBusqueda[] = await response.json();
        setUsuarios(data);
      } catch (error) {
        console.error("No se pudieron cargar los usuarios:", error);
      }
    }

    cargarUsuarios();
  }, [API_URL]);

  return (
    <BootstrapNavbar
      expand="lg"
      bg="dark"
      variant="dark"
      sticky="top"
      className="py-3 shadow"
    >
      <Container>
        <Link to="/" className="navbar-brand fw-bold fs-4">
          <span
            className="bg-white rounded-3 me-2 d-inline-flex justify-content-center align-items-center"
            style={{
              width: "34px",
              height: "34px",
              overflow: "hidden",
              verticalAlign: "middle",
            }}
          >
            <img
              src="/src/assets/logo-black.png"
              alt="Logo Anti-Social"
              style={{
                width: "75%",
                height: "75%",
                objectFit: "contain",
                display: "block",
                margin: "auto",
              }}
            />
          </span>
          Anti-Social <span className="text-white">Net GC</span>
        </Link>

        <BootstrapNavbar.Toggle aria-controls="navbar-content" />

        <BootstrapNavbar.Collapse id="navbar-content">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 ms-auto mt-3 mt-lg-0">
            <div className="position-relative">
              <Form.Control
                type="search"
                placeholder="Buscar usuarios..."
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />

              {busqueda.trim() !== "" && (
                <div className="position-absolute top-100 start-0 w-100 bg-white shadow rounded mt-1 z-3">
                  {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => (
                      <button
                        key={usuario._id}
                        type="button"
                        className="w-100 text-start border-0 bg-white px-3 py-2"
                        onClick={() => {
                          setBusqueda("");
                          navigate(`/perfil/${usuario._id}`);
                        }}
                      >
                        {usuario.nickName}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-secondary">
                      No se encontraron usuarios.
                    </div>
                  )}
                </div>
              )}
            </div>
            <Link to="/" className="text-white text-decoration-none">
              Inicio
            </Link>

            {user ? (
              <>
                <Link
                  to="/nuevo-post"
                  className="text-white text-decoration-none"
                >
                  Crear publicación
                </Link>

                <Link
                  to={`/perfil/${user._id}`}
                  className="text-white text-decoration-none"
                >
                  Mi perfil
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light">
                  Iniciar sesión
                </Link>

                <Link to="/registro" className="btn btn-primary">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
