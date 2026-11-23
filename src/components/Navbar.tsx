import { useEffect, useState } from "react";
import {
  Container,
  Navbar as BootstrapNavbar,
  Form,
  InputGroup,
} from "react-bootstrap";
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
  const [temaOscuro, setTemaOscuro] = useState(
    () => localStorage.getItem("tema") === "oscuro",
  );

  useEffect(() => {
    const tema = temaOscuro ? "oscuro" : "claro";
    document.documentElement.setAttribute("data-tema", tema);
    localStorage.setItem("tema", tema);
  }, [temaOscuro]);

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
            <div className="position-relative buscador-usuarios">
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <span role="img" aria-label="Buscar">
                    🔍
                  </span>
                </InputGroup.Text>

                <Form.Control
                  type="search"
                  aria-label="Buscar usuarios"
                  placeholder="Buscar usuarios..."
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  className="border-start-0"
                />
              </InputGroup>

              {busqueda.trim() !== "" && (
                <div className="resultados-usuarios">
                  {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => (
                      <button
                        key={usuario._id}
                        type="button"
                        className="resultado-usuario"
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
            <Link to="/" className="navbar-accion">
              Inicio
            </Link>

            {user ? (
              <>
                <Link
                  to="/nuevo-post"
                  className="navbar-accion"
                >
                  Crear publicación
                </Link>

                <Link
                  to={`/perfil/${user._id}`}
                  className="navbar-accion"
                >
                  Mi perfil
                </Link>

                <button
                  onClick={handleLogout}
                  className="navbar-accion"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="d-flex gap-3">
                <Link to="/login" className="navbar-accion">
                  Iniciar sesión
                </Link>

                <Link to="/registro" className="navbar-accion">
                  Registrarse
                </Link>
              </div>
            )}
            <button
              type="button"
              className="navbar-accion"
              onClick={() => setTemaOscuro((actual) => !actual)}
              aria-label={`Cambiar a tema ${temaOscuro ? "claro" : "oscuro"}`}
              title={`Cambiar a tema ${temaOscuro ? "claro" : "oscuro"}`}
            >
              {temaOscuro ? "☀️" : "🌙"}
            </button>
          </div>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
