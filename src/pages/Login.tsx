import { useState } from "react";
import type { FormEvent } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function Login() {
  const [nickName, setNickName] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log({ nickName, password });
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
                className="bg-dark text-white rounded-4 d-inline-flex justify-content-center align-items-center mb-3 fw-bold"
                style={{
                  width: "60px",
                  height: "60px",
                  fontSize: "2rem",
                }}
              >
                A
              </div>

              <h2 className="fw-bold">¡Qué bueno verte!</h2>
              <p className="text-secondary mb-0">
                Ingresá a tu cuenta y seguí conectado.
              </p>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Nombre de usuario
                </Form.Label>

                <Form.Control
                  type="text"
                  placeholder="Ingresá tu nickname"
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Contraseña</Form.Label>

                <Form.Control
                  type="password"
                  placeholder="Ingresá tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                className="w-100 fw-semibold py-2"
                variant="dark"
              >
                Iniciar sesión
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
