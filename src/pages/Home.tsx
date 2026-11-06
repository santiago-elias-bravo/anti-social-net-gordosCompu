import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
} from "react-bootstrap";
import { publicaciones, etiquetasPopulares } from "../data/publicaciones";

import { Link } from "react-router-dom";

import PostCard from "../components/PostCard";

function Home() {
  return (
    <Container className="py-4">
      <Row className="g-4">
        <Col lg={3} className="d-none d-lg-block">
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <h5 className="fw-bold">Bienvenido a Anti-Social Net</h5>

              <p className="text-secondary small">
                Un espacio para compartir tus ideas, conocer personas y formar
                parte de una comunidad.
              </p>

              <hr />

              <h6 className="fw-bold mb-3">Accesos rápidos</h6>

              <div className="d-flex flex-column gap-3">
                <Link to="/" className="text-dark text-decoration-none">
                  🏠 Inicio
                </Link>

                <Link
                  to="/nuevo-post"
                  className="text-dark text-decoration-none"
                >
                  ✏️ Crear publicación
                </Link>

                <Link to="/login" className="text-dark text-decoration-none">
                  👤 Mi cuenta
                </Link>
              </div>

              <hr />

              <p className="text-secondary small mb-0">
                💜 Compartí, aprendé y conectá con otras personas.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} md={8}>
          <div className="mb-4">
            <h2 className="fw-bold">Explorá la comunidad</h2>

            <p className="text-secondary">
              Descubrí lo que están compartiendo los demás usuarios.
            </p>
          </div>

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body>
              <Form.Control type="text" placeholder="¿Qué estás buscando?" />
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h6 className="fw-bold mb-1">¿Qué tenés para compartir?</h6>

                <small className="text-secondary">
                  Creá una publicación para la comunidad.
                </small>
              </div>

              <Link to="/nuevo-post" className="btn btn-primary">
                + Crear post
              </Link>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Últimas publicaciones</h5>

            <small className="text-secondary">Más recientes</small>
          </div>

          {publicaciones.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              nickName={post.nickName}
              fecha={post.fecha}
              description={post.description}
              tags={post.tags}
              comentarios={post.comentarios}
            />
          ))}
        </Col>

        <Col lg={3} md={4}>
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body>
              <h6 className="fw-bold mb-3">Etiquetas populares</h6>

              <div className="d-flex flex-wrap gap-2">
                {etiquetasPopulares.map((tag) => (
                  <Badge
                    bg="light"
                    text="dark"
                    className="border rounded-pill px-3 py-2 fw-medium"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div className="fs-1 mb-2">💜</div>

              <h5 className="fw-bold">¡Sumate a la comunidad!</h5>

              <p className="text-secondary small">
                Registrate y empezá a compartir tus propias publicaciones.
              </p>

              <Link to="/registro" className="btn btn-primary w-100">
                Crear una cuenta
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
