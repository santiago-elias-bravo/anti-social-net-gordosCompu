import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Badge,
  Alert,
  Spinner,
  Button,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

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
  comentariosVisibles: number | null;
  imagenes: string[];
}

function UserProfile() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const [publicaciones, setPublicaciones] = useState<Post[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  function handleLogout() {
    navigate("/");
    logout();
  }

  useEffect(() => {
    async function obtenerPublicaciones() {
      if (!user) return;

      try {
        setCargando(true);
        setError("");

        const response = await fetch(
          `${API_URL}/posts?userId=${user._id}`
        );

        if (!response.ok) {
          throw new Error("No se pudieron obtener las publicaciones.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("El formato de las publicaciones es incorrecto.");
        }

        const publicacionesUsuario = data;

        // Obtener los comentarios visibles y las imágenes de cada publicación
        const publicacionesConComentarios = await Promise.all(
          publicacionesUsuario.map(async (post: Post) => {
            try {
              const respuestaDetalle = await fetch(
                `${API_URL}/posts/${post._id}`
              );

              if (!respuestaDetalle.ok) {
                throw new Error("No se pudo obtener el detalle.");
              }

              const detalle = await respuestaDetalle.json();

              return {
                ...post,
                comentariosVisibles: Array.isArray(detalle.comments)
                  ? detalle.comments.length
                  : 0,
                imagenes: Array.isArray(detalle.images)
                  ? detalle.images.map(
                      (imagen: { url: string }) => imagen.url
                    )
                  : [],
              };
            } catch {
              return {
                ...post,
                comentariosVisibles: null,
                imagenes: [],
              };
            }
          })
        );

        setPublicaciones(publicacionesConComentarios);
      } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar el perfil."
        );
      } finally {
        setCargando(false);
      }
    }

    obtenerPublicaciones();
  }, [API_URL, user]);

  if (!user) return null;

  return (
    <Container className="py-4 py-md-5">
      <div className="mx-auto" style={{ maxWidth: "900px" }}>
        {/* Encabezado del perfil */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body className="p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="bg-dark text-white rounded-circle d-flex justify-content-center align-items-center fw-bold"
                  style={{
                    width: "65px",
                    height: "65px",
                    fontSize: "1.6rem",
                  }}
                >
                  {user.nickName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h1 className="fw-bold mb-1">{user.nickName}</h1>
                  <p className="text-secondary mb-0">
                    Mi perfil
                  </p>
                </div>
              </div>

              <Button
                variant="outline-danger"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Publicaciones */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fw-bold mb-0">Mis publicaciones</h2>

          <Badge bg="dark" pill>
            {publicaciones.length}
          </Badge>
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
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="text-center py-5">
              <h5 className="fw-bold">Todavía no tenés publicaciones</h5>
              <p className="text-secondary">
                Cuando publiques algo, aparecerá acá.
              </p>

              <Link to="/nuevo-post" className="btn btn-dark">
                Crear publicación
              </Link>
            </Card.Body>
          </Card>
        )}

        {!cargando &&
          publicaciones.map((post) => (
            <Card
              key={post._id}
              className="border-0 shadow-sm rounded-4 mb-3"
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="bg-dark text-white rounded-circle d-flex justify-content-center align-items-center fw-bold"
                    style={{ width: "35px", height: "35px" }}
                  >
                    {user.nickName.charAt(0).toUpperCase()}
                  </div>

                  <span className="fw-semibold">
                    {user.nickName}
                  </span>
                </div>

                <p className="mb-3 text-break">
                  {post.description}
                </p>

                {/* Imágenes */}
                {post.imagenes.length > 0 && (
                  <div className="d-flex flex-column gap-3 mb-3">
                    {post.imagenes.map((imagen, index) => {
                      const imageUrl = imagen.startsWith("http")
                        ? imagen
                        : `${API_URL}${imagen}`;

                      return (
                        <img
                          key={`${imagen}-${index}`}
                          src={imageUrl}
                          alt={`Imagen de la publicación ${index + 1}`}
                          className="img-fluid rounded-3"
                          style={{
                            width: "100%",
                            maxHeight: "400px",
                            objectFit: "contain",
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                {post.tags.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag._id}
                        bg="light"
                        text="dark"
                        className="border px-3 py-2"
                      >
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span className="text-secondary small">
                    {post.comentariosVisibles === null
                      ? "No se pudieron cargar los comentarios"
                      : `${post.comentariosVisibles} ${
                          post.comentariosVisibles === 1
                            ? "comentario"
                            : "comentarios"
                        }`}
                  </span>

                  <Link
                    to={`/post/${post._id}`}
                    className="btn btn-outline-dark btn-sm"
                  >
                    Ver más
                  </Link>
                </div>
              </Card.Body>
            </Card>
          ))}
      </div>
    </Container>
  );
}

export default UserProfile;
