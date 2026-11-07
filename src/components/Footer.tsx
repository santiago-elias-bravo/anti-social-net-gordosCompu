import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-dark text-white mt-5 py-4">

      <Container>

        <Row className="gy-4">

          <Col md={6}>
            <h5 className="fw-bold">
              Anti-Social Net GC
            </h5>

            <p className="text-secondary mb-0">
              Un espacio para compartir ideas,
              experiencias y conectar con otras personas.
            </p>
          </Col>

          <Col md={3}>
            <h6 className="fw-bold">
              Navegación
            </h6>

            <div className="d-flex flex-column gap-2">

              <Link to="/" className="text-secondary text-decoration-none">
                Inicio
              </Link>

              <Link to="/login" className="text-secondary text-decoration-none">
                Iniciar sesión
              </Link>

              <Link to="/registro" className="text-secondary text-decoration-none">
                Registrarse
              </Link>

            </div>
          </Col>

          <Col md={3}>
            <h6 className="fw-bold">
              Proyecto
            </h6>

            <p className="text-secondary mb-0">
              UnaHur Anti-Social Net GC
              <br />
              Trabajo práctico integrador
              <br />
              UNAHUR - 2026
            </p>
          </Col>

        </Row>

        <hr className="border-secondary my-4" />

        <div className="text-center text-secondary">
          <small>
            © 2026 UnaHur Anti-Social Net GC.
            Todos los derechos reservados.
          </small>
        </div>

      </Container>

    </footer>
  );
}

export default Footer;
