import { useEffect, useState, type FormEvent } from "react";
import {
  Container,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  Form,
} from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";

interface Tag {
  _id: string;
  name: string;
}

interface Comment {
  _id: string;
  content: string;
  userId: string;
  postId: string;
}

interface PostImage {
  _id: string;
  url: string;
  postId: string;
}

interface PostDetail {
  _id: string;
  description: string;
  user: {
    _id: string;
    nickName: string;
  };
  comments: Comment[];
  tags: Tag[];
  images: PostImage[];
}

function PublicationDetails() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const { user } = useUser();

  const [publicacion, setPublicacion] = useState<PostDetail | null>(null);
  const [comentario, setComentario] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const obtenerPublicacion = async () => {
    try {
      setCargando(true);
      setError("");

      const response = await fetch(`${API_URL}/posts/${id}`);

      if (!response.ok) {
        throw new Error("No se pudo obtener la publicación.");
      }

      const data: PostDetail = await response.json();
      setPublicacion(data);
    } catch (error) {
      console.error("Error al obtener la publicación:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al cargar la publicación."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (id) {
      obtenerPublicacion();
    }
  }, [id, API_URL]);

  async function enviarComentario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !id) return;

    if (!comentario.trim()) {
      setMensaje("El comentario no puede estar vacío.");
      return;
    }

    try {
      setEnviando(true);
      setMensaje("");

      const response = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: comentario.trim(),
          userId: user._id,
          postId: id,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo publicar el comentario.");
      }

      setComentario("");
      setMensaje("Comentario publicado correctamente.");

      await obtenerPublicacion();
    } catch (error) {
      console.error("Error al publicar el comentario:", error);
      setMensaje(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al publicar el comentario."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="text-secondary mt-3">
          Cargando publicación...
        </p>
      </Container>
    );
  }

  if (error || !publicacion) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || "No se encontró la publicación."}
        </Alert>

        <Link to="/" className="btn btn-outline-dark">
          Volver al inicio
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-4 py-md-5">
      <div className="mx-auto" style={{ maxWidth: "850px" }}>
        <Link
          to="/"
          className="text-decoration-none text-secondary d-inline-block mb-3"
        >
          ← Volver al inicio
        </Link>

        {/* Publicación */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body className="p-4 p-md-5">
            {/* Autor */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="bg-dark text-white rounded-circle d-flex justify-content-center align-items-center fw-bold"
                style={{
                  width: "45px",
                  height: "45px",
                  fontSize: "1.2rem",
                }}
              >
                {publicacion.user.nickName.charAt(0).toUpperCase()}
              </div>

              <div>
                <h5 className="fw-bold mb-0">
                  {publicacion.user.nickName}
                </h5>
                <small className="text-secondary">
                  Publicación
                </small>
              </div>
            </div>

            {/* Descripción */}
            <p className="fs-5 text-break mb-4">
              {publicacion.description}
            </p>

            {/* Imágenes */}
            {publicacion.images.length > 0 && (
              <div className="d-flex flex-column gap-3 mb-4">
                {publicacion.images.map((imagen) => {
                  const imageUrl = imagen.url.startsWith("http")
                    ? imagen.url
                    : `${API_URL}${imagen.url}`;

                  return (
                    <img
                      key={imagen._id}
                      src={imageUrl}
                      alt="Imagen de la publicación"
                      className="img-fluid rounded-3"
                      style={{
                        maxHeight: "500px",
                        width: "100%",
                        objectFit: "contain",
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Etiquetas */}
            {publicacion.tags.length > 0 && (
              <div className="d-flex flex-wrap gap-2">
                {publicacion.tags.map((tag) => (
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
          </Card.Body>
        </Card>

        {/* Comentarios */}
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold mb-0">
                Comentarios
              </h3>

              <Badge bg="dark" pill>
                {publicacion.comments.length}
              </Badge>
            </div>

            {publicacion.comments.length === 0 ? (
              <p className="text-secondary">
                Todavía no hay comentarios. ¡Sé el primero en comentar!
              </p>
            ) : (
              <div className="d-flex flex-column gap-3 mb-4">
                {publicacion.comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-light rounded-3 p-3"
                  >
                    <p className="mb-0 text-break">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para comentar */}
            <hr className="my-4" />

            {user ? (
              <>
                <h5 className="fw-bold mb-3">
                  Dejá tu comentario
                </h5>

                <Form onSubmit={enviarComentario}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Escribí tu comentario..."
                      value={comentario}
                      onChange={(event) =>
                        setComentario(event.target.value)
                      }
                      maxLength={2000}
                      required
                    />
                  </Form.Group>

                  {mensaje && (
                    <Alert
                      variant={
                        mensaje.includes("correctamente")
                          ? "success"
                          : "danger"
                      }
                    >
                      {mensaje}
                    </Alert>
                  )}

                  <div className="d-flex justify-content-end">
                    <Button
                      type="submit"
                      variant="dark"
                      disabled={enviando || !comentario.trim()}
                    >
                      {enviando
                        ? "Publicando..."
                        : "Publicar comentario"}
                    </Button>
                  </div>
                </Form>
              </>
            ) : (
              <Alert variant="secondary" className="mb-0">
                Tenés que iniciar sesión para comentar.
                <div className="mt-2">
                  <Link to="/login" className="alert-link">
                    Iniciar sesión
                  </Link>
                </div>
              </Alert>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default PublicationDetails;
