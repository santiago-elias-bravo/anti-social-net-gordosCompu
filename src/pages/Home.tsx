import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import { etiquetasPopulares } from "../data/publicaciones";

interface Tag {
  _id: string;
  name: string;
}

interface Post {
  _id: string;
  description: string;
  user: {
    _id: string;
    nickName: string;
  };
  tags: Tag[];
}

interface PostDetail {
  comments: {
    _id: string;
    content: string;
    userId: string;
    postId: string;
  }[];
  images: {
    _id: string;
    url: string;
    postId: string;
  }[];
}

interface PostCardData {
  id: string;
  nickName: string;
  fecha: string;
  description: string;
  tags: string[];
  comentarios: number;
  imagenes: string[];
}

function Home() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [publicaciones, setPublicaciones] = useState<PostCardData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function obtenerPublicaciones() {
      try {
        setCargando(true);
        setError("");

        const response = await fetch(`${API_URL}/posts`);

        if (!response.ok) {
          throw new Error("No se pudieron obtener las publicaciones.");
        }

        const data: Post[] = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("El formato de las publicaciones es incorrecto.");
        }

        const publicacionesCompletas = await Promise.all(
          data.map(async (post) => {
            try {
              const respuestaDetalle = await fetch(
                `${API_URL}/posts/${post._id}`
              );

              if (!respuestaDetalle.ok) {
                throw new Error("No se pudo obtener el detalle.");
              }

              const detalle: PostDetail = await respuestaDetalle.json();

              return {
                id: post._id,
                nickName: post.user.nickName,
                fecha: "Publicación",
                description: post.description,
                tags: post.tags.map((tag) => tag.name),
                comentarios: Array.isArray(detalle.comments)
                  ? detalle.comments.length
                  : 0,
                imagenes: Array.isArray(detalle.images)
                  ? detalle.images.map((imagen) => imagen.url)
                  : [],
              };
            } catch (error) {
              console.error(
                `Error al obtener el detalle de la publicación ${post._id}:`,
                error
              );

              return {
                id: post._id,
                nickName: post.user.nickName,
                fecha: "Publicación",
                description: post.description,
                tags: post.tags.map((tag) => tag.name),
                comentarios: 0,
                imagenes: [],
              };
            }
          })
        );

        setPublicaciones(publicacionesCompletas);
      } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar las publicaciones."
        );
      } finally {
        setCargando(false);
      }
    }

    obtenerPublicaciones();
  }, [API_URL]);

  return (
    <Container className="py-4">
      <Row className="g-4">
        <Col lg={3} className="d-none d-lg-block">
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <h5 className="fw-bold">Bienvenido a Anti-Social Net GC</h5>

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
              <Form.Control
                type="text"
                placeholder="¿Qué estás buscando?"
              />
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h6 className="fw-bold mb-1">
                  ¿Qué tenés para compartir?
                </h6>

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

          {cargando && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="dark" />
              <p className="text-secondary mt-3">
                Cargando publicaciones...
              </p>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {!cargando && !error && publicaciones.length === 0 && (
            <Alert variant="secondary">
              Todavía no hay publicaciones.
            </Alert>
          )}

          {!cargando &&
            publicaciones.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                nickName={post.nickName}
                fecha={post.fecha}
                description={post.description}
                tags={post.tags}
                comentarios={post.comentarios}
                imagenes={post.imagenes}
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
                    key={tag}
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
