import { useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";
import { Container, Card, Form, Button, Alert, InputGroup, } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

interface FormData {
  nickName: string;
  email: string;
  password: string;
  confirmarPassword: string;
}

interface FormErrors {
  nickName?: string;
  email?: string;
  password?: string;
  confirmarPassword?: string;
}

function UserRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    nickName: "",
    email: "",
    password: "",
    confirmarPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [errorServidor, setErrorServidor] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);

  // Requisitos de la contraseña
  const requisitosPassword = [
    {
      texto: "Debe contener mínimo 8 caracteres.",
      valido: formData.password.length >= 8,
    },
    {
      texto: "Debe contener al menos una letra mayúscula.",
      valido: /[A-Z]/.test(formData.password),
    },
    {
      texto: "Debe contener al menos un número.",
      valido: /\d/.test(formData.password),
    },
    {
      texto: "Debe contener al menos un carácter especial.",
      valido: /[^A-Za-z0-9\s]/.test(formData.password),
    },
    {
      texto: "No debe contener espacios",
      valido:
        formData.password.length > 0 &&
        !/\s/.test(formData.password),
    },
  ];

  // Actualizar los campos del formulario
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData({...formData,[name]: value,});

    setErrors({...errors,[name]: "",});

    setErrorServidor("");
  }

  // Validar los datos ingresados
  function validateForm() {
    const newErrors: FormErrors = {};

    // Nickname
    if (formData.nickName.trim() === "") {
      newErrors.nickName = "Ingresá un nombre de usuario.";
    }
    else if (formData.nickName.trim().length < 3) {
      newErrors.nickName = "El nickname debe tener al menos 3 caracteres.";
    }
    else if (formData.nickName.trim().length > 30) {
      newErrors.nickName = "El nickname no puede superar los 30 caracteres.";
    }

    // Email
    if (formData.email.trim() === "") {
      newErrors.email = "Ingresá tu correo electrónico.";
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Ingresá un correo electrónico válido.";
    }

    // Contraseña
    if (formData.password === "") {
      newErrors.password = "Ingresá una contraseña.";
    } 
    else if (formData.password.length < 8 || formData.password.length > 100) {
      newErrors.password = "La contraseña debe tener entre 8 y 100 caracteres.";
    } 
    else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S+$/.test(formData.password)) {
      newErrors.password = "Debe incluir una mayúscula, un número, un carácter especial y no contener espacios.";
    }

    // Confirmación de contraseña
    if (formData.confirmarPassword === "") {
      newErrors.confirmarPassword = "Confirmá tu contraseña.";
    } 
    else if (formData.confirmarPassword !== formData.password) {
      newErrors.confirmarPassword = "Las contraseñas no coinciden.";
    }

    return newErrors;
  }

  // Enviar el registro al backend
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cargando) return;

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setCargando(true);
    setErrorServidor("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nickName: formData.nickName.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          if (data.message?.includes("email")) {
            setErrors({email: "Este correo electrónico ya está registrado.",});
          }
          else if (data.message?.includes("nickname")) {
            setErrors({nickName: "Este nombre de usuario ya está registrado.",});
          }
          else {
            setErrorServidor(data.message || "El usuario ya existe.");
          }
        }
        else {
          setErrorServidor(data.error || data.message || "No se pudo registrar el usuario.");
        }

        return;
      }

      // Registro exitoso (Llevar al login)
      navigate("/login", { replace: true });

    }
    catch (error) {
      console.error("Error al registrar usuario:", error);
      setErrorServidor("No se pudo conectar con el servidor. Intentá nuevamente.");
    } 
    finally {
      setCargando(false);
    }
  }

  return (
    <Container fluid className="py-4 py-md-5 px-3">
      <div className="d-flex justify-content-center">
        <Card className="border-0 shadow-sm rounded-4 w-100" style={{ maxWidth: "500px" }}>
          <Card.Body className="p-4 p-md-5">

            {/* Encabezado */}
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
                  src="/logo-white.png"
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

              <h2 className="fw-bold">
                Crear una cuenta
              </h2>

              <p className="text-secondary">
                Registrate y empezá a compartir con la comunidad.
              </p>
            </div>

            {/* Error del servidor */}
            {errorServidor && (
              <Alert variant="danger">
                {errorServidor}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} noValidate>

              {/* Nickname */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Nombre de usuario *
                </Form.Label>

                <Form.Control
                  type="text"
                  name="nickName"
                  className="input-focus"
                  placeholder="Ingresá tu nombre de usuario"
                  value={formData.nickName}
                  onChange={handleChange}
                  isInvalid={!!errors.nickName}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.nickName}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Correo electrónico *
                </Form.Label>

                <Form.Control
                  type="email"
                  name="email"
                  className="input-focus"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Contraseña */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Contraseña *
                </Form.Label>

                <InputGroup>
                  <Form.Control
                    type={mostrarPassword ? "text" : "password"}
                    name="password"
                    className="input-focus"
                    placeholder="Ingresá una contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                  />

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick= {() => setMostrarPassword(!mostrarPassword)}
                    aria-label= { mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña" }
                  >
                    {mostrarPassword ? "Ocultar" : "Ver"}
                  </Button>
                </InputGroup>

                {errors.password && (
                  <div className="text-danger small mt-1">
                    {errors.password}
                  </div>
                )}

                {/* Lista de requisitos */}
                <ul className="list-unstyled mt-2 mb-0">
                  {requisitosPassword.map((requisito) => (
                    <li key={requisito.texto}
                      className={`small mb-1 ${
                        requisito.valido ? "text-success" : "text-secondary"
                      }`}
                    >
                      <span className="me-2">
                        {requisito.valido ? "✓" : "○"}
                      </span>

                      {requisito.texto}
                    </li>
                  ))}
                </ul>
              </Form.Group>

              {/* Confirmar contraseña */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Confirmar contraseña *
                </Form.Label>

                <InputGroup>
                  <Form.Control
                    type={mostrarConfirmarPassword ? "text" : "password"}
                    name="confirmarPassword"
                    className="input-focus"
                    placeholder="Repetí tu contraseña"
                    value={formData.confirmarPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmarPassword}
                  />

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
                  >
                    {mostrarConfirmarPassword ? "Ocultar" : "Ver"}
                  </Button>
                </InputGroup>

                {errors.confirmarPassword && (
                  <div className="text-danger small mt-1">
                    {errors.confirmarPassword}
                  </div>
                )}
              </Form.Group>

              {/* Botón de registro */}
              <Button
                type="submit"
                variant="dark"
                className="w-100 fw-semibold py-2"
                disabled={cargando}
              >
                {cargando ? "Registrando..." : "Registrarse"}
              </Button>
            </Form>

            {/* Enlace al login */}
            <div className="text-center mt-4">
              <span className="text-secondary">
                ¿Ya tenés una cuenta?{" "}
              </span>

              <Link to="/login" className="fw-semibold text-dark text-decoration-underline">
                Iniciar sesión
              </Link>
            </div>

          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default UserRegister;
