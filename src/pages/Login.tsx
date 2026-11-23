import { useState } from "react";
import type { SubmitEvent } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import type { User } from "../context/UserContext";
import { ADMIN_USER_ID } from "../constants/admin";

function Login() {
  const [nickName, setNickName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [erroresCampo, setErroresCampo] = useState({
    nickName: "",
    password: "",
  });
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const { setUser } = useUser();
  const navigate = useNavigate();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const nuevosErrores = {
      nickName: nickName.trim() ? "" : "El nombre de usuario no puede estar vacío",
      password: password.trim() ? "" : "La contraseña no puede estar vacía",
    };
    setErroresCampo(nuevosErrores);

    if (nuevosErrores.nickName || nuevosErrores.password) {
      return;
    }

    if (
      nickName.trim().toLowerCase() === "adminasn" &&
      password === "123456"
    ) {
      const usuarioAdmin: User = {
        _id: ADMIN_USER_ID,
        nickName: "AdminASN",
        email: "admin@antisocial.local",
      };

      setUser(usuarioAdmin);
      navigate("/");
      return;
    }

    try {
      setCargando(true);

      let usuarioEncontrado: User;

      if (password === "123456") {
        // Opción fija: acepta 123456 solamente si el usuario existe.
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users`);

        if (!response.ok) {
          throw new Error("No se pudo conectar con el servidor.");
        }

        const usuarios: User[] = await response.json();

        const usuario = usuarios.find(
          (item) =>
            item.nickName.toLowerCase() === nickName.trim().toLowerCase(),
        );

        if (!usuario) {
          setError("El nombre de usuario o la contraseña son incorrectos.");
          return;
        }

        usuarioEncontrado = usuario;
      } else {
        // Opción registrada: el backend verifica el hash de la contraseña.
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nickName: nickName.trim(),
              password,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "El nombre de usuario o la contraseña son incorrectos.",
          );
          return;
        }

        usuarioEncontrado = data.user as User;
      }

      setUser(usuarioEncontrado);
      navigate(`/perfil/${usuarioEncontrado._id}`);
    } catch {
      setError("Ocurrió un error al iniciar sesión. Intentá nuevamente.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Container fluid className="py-4 py-md-5 px-3">
      <div className="d-flex justify-content-center align-items-center">
        <Card
          className="border-0 shadow-sm rounded-4 w-100"
          style={{ maxWidth: "450px" }}
        >
          <Card.Body className="p-4 p-md-5">
            <div className="text-center mb-4">
              <div
                className="bg-dark rounded-4 d-flex justify-content-center align-items-center mb-3 mx-auto"
                style={{
                  width: "60px",
                  height: "60px",
                  overflow: "hidden",
                }}
              >
                <img
                  src="src/assets/logo-white.png"
                  alt="Logo Anti-Social"
                  style={{
                    width: "75%",
                    height: "75%",
                    objectFit: "contain",
                    display: "block",
                    margin: "auto",
                  }}
                />
              </div>

              <h2 className="fw-bold">¡Qué bueno verte!</h2>
              <p className="text-secondary mb-0">
                Ingresá a tu cuenta y seguí conectado.
              </p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit} noValidate>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Nombre de usuario
                </Form.Label>

                <Form.Control
                  type="text"
                  placeholder="Ingresá tu nombre de usuario"
                  value={nickName}
                  onChange={(e) => {
                    setNickName(e.target.value);
                    setErroresCampo((actuales) => ({
                      ...actuales,
                      nickName: "",
                    }));
                    setError("");
                  }}
                  isInvalid={!!erroresCampo.nickName}
                />
                <Form.Control.Feedback type="invalid">
                  {erroresCampo.nickName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Contraseña</Form.Label>

                <InputGroup>
                  <Form.Control
                    type={mostrarPassword ? "text" : "password"}
                    placeholder="Ingresá tu contraseña"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErroresCampo((actuales) => ({
                        ...actuales,
                        password: "",
                      }));
                      setError("");
                    }}
                    isInvalid={!!erroresCampo.password}
                  />

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    aria-label={
                      mostrarPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarPassword ? "Ocultar" : "Ver"}
                  </Button>
                </InputGroup>
                {erroresCampo.password && (
                  <div className="invalid-feedback d-block">
                    {erroresCampo.password}
                  </div>
                )}
              </Form.Group>

              <Button
                type="submit"
                className="w-100 fw-semibold py-2"
                variant="dark"
                disabled={cargando}
              >
                {cargando ? "Ingresando..." : "Iniciar sesión"}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <span className="text-secondary">
                ¿Todavía no tenés una cuenta?
              </span>

              <br />

              <Link
                to="/registro"
                className="fw-semibold text-dark text-decoration-underline"
              >
                Registrate
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Login;
