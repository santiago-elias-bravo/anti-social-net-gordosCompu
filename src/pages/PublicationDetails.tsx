import { useEffect, useState, type SubmitEvent } from "react";
import {
  Container,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  Form,
} from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

interface Tag {
  _id: string;
  name: string;
}

interface Comment {
  _id: string;
  content: string;
  userId: {
    _id: string;
    nickName: string;
  };
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
  createdAt: string;
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
  const [eliminandoComentarioId, setEliminandoComentarioId] = useState<
    string | null
  >(null);
  const [eliminandoPublicacion, setEliminandoPublicacion] = useState(false);
  const [errorEliminacion, setErrorEliminacion] = useState("");
  const [errorComentario, setErrorComentario] = useState<{
    id: string;
    mensaje: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (mensaje !== "Comentario publicado correctamente.") return;

    const timer = setTimeout(() => {
      setMensaje("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [mensaje]);

  async function actualizarComentarios() {
    if (!id) return;

    try {
      const response = await fetch(`${API_URL}/posts/${id}`);

      if (!response.ok) {
        throw new Error("No se pudieron actualizar los comentarios.");
      }

      const data: PostDetail = await response.json();

      setPublicacion((publicacionActual) => {
        if (!publicacionActual || publicacionActual._id !== id) {
          return publicacionActual;
        }

        return {
          ...publicacionActual,
          comments: data.comments,
        };
      });
    } catch (error) {
      console.error("Error al actualizar comentarios:", error);
      setMensaje(
        "El comentario se publicó, pero no se pudo actualizar la lista. Actualizá la página para verlo.",
      );
    }
  }

  async function eliminarPublicacion() {
    if (
      !user ||
      !publicacion ||
      user._id !== publicacion.user._id ||
      enviando ||
      eliminandoPublicacion ||
      eliminandoComentarioId
    ) {
      return;
    }

    const confirmar = window.confirm(
      "¿Estás seguro de que querés eliminar esta publicación? También se eliminarán todos sus comentarios e imágenes. Esta acción no se puede deshacer.",
    );

    if (!confirmar) return;

    try {
      setEliminandoPublicacion(true);
      setErrorEliminacion("");

      const response = await fetch(`${API_URL}/posts/${publicacion._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        console.error("Error al eliminar publicación:", {
          status: response.status,
          respuesta: errorData,
        });

        throw new Error(
          errorData?.message || "No se pudo eliminar la publicación.",
        );
      }

      // Regresar al perfil del usuario
      navigate(`/perfil/${user._id}`, { replace: true });
    } catch (error) {
      console.error("Error al eliminar publicación:", error);
      setErrorEliminacion(
        "No se pudo eliminar la publicación. Intentá nuevamente.",
      );
    } finally {
      setEliminandoPublicacion(false);
    }
  }

  async function eliminarComentario(commentId: string, autorId: string) {
    if (
      !user ||
      user._id !== autorId ||
      enviando ||
      eliminandoPublicacion ||
      eliminandoComentarioId !== null
    ) {
      return;
    }

    const confirmar = window.confirm(
      "¿Estás seguro de que querés eliminar este comentario?",
    );

    if (!confirmar) return;

    try {
      setEliminandoComentarioId(commentId);
      setErrorComentario(null);

      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar el comentario.");
      }

      setPublicacion((publicacionActual) => {
        if (!publicacionActual) return null;

        return {
          ...publicacionActual,
          comments: publicacionActual.comments.filter(
            (comment) => comment._id !== commentId,
          ),
        };
      });
    } catch (error) {
      console.error("Error al eliminar comentario:", error);

      setErrorComentario({
        id: commentId,
        mensaje: "No se pudo eliminar el comentario. Intentá nuevamente.",
      });
    } finally {
      setEliminandoComentarioId(null);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function obtenerPublicacion() {
      if (!id) {
        setPublicacion(null);
        setError("No se encontró la publicación.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");
        setPublicacion(null);

        const response = await fetch(`${API_URL}/posts/${id}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("No se pudo obtener la publicación.");
        }

        const data: PostDetail = await response.json();

        if (controller.signal.aborted) return;

        setPublicacion(data);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Error al obtener la publicación:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar la publicación.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    void obtenerPublicacion();

    return () => {
      controller.abort();
    };
  }, [id, API_URL]);

  async function enviarComentario(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      enviando ||
      !user ||
      !id ||
      eliminandoPublicacion ||
      eliminandoComentarioId !== null
    ) {
      return;
    }

    if (!comentario.trim()) {
      setMensaje("El comentario no puede estar vacío.");
      return;
    }

    if (comentario.trim().length > 2000) {
      setMensaje("El comentario no puede superar los 2000 caracteres.");
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

      await actualizarComentarios();
    } catch (error) {
      console.error("Error al publicar el comentario:", error);
      setMensaje(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al publicar el comentario.",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="text-secondary mt-3">Cargando publicación...</p>
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
            <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
              <div className="d-flex align-items-center gap-3">
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
                  <h5 className="fw-bold mb-0">{publicacion.user.nickName}</h5>
                  <small className="text-secondary">
                    {new Date(publicacion.createdAt).toLocaleString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              </div>

              {/* Solo el autor puede eliminar la publicación */}
              {user?._id === publicacion.user._id && (
                <Button
                  type="button"
                  variant="outline-danger"
                  size="sm"
                  title="Eliminar publicación"
                  aria-label="Eliminar publicación"
                  disabled={
                    eliminandoPublicacion ||
                    eliminandoComentarioId !== null ||
                    enviando
                  }
                  onClick={eliminarPublicacion}
                >
                  {eliminandoPublicacion ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 10v6M14 10v6" />
                    </svg>
                  )}
                </Button>
              )}
            </div>

            {/* Descripción */}
            <p className="fs-5 text-break mb-4">{publicacion.description}</p>

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
        {errorEliminacion && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setErrorEliminacion("")}
          >
            {errorEliminacion}
          </Alert>
        )}
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold mb-0">Comentarios</h3>

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
                {publicacion.comments.map((comment) => {
                  const nickName = comment.userId?.nickName || "Usuario";

                  return (
                    <div
                      key={comment._id}
                      className="d-flex align-items-start gap-3"
                    >
                      {/* Inicial del usuario */}
                      <div
                        className="bg-dark text-white rounded-circle d-flex justify-content-center align-items-center fw-bold flex-shrink-0"
                        style={{
                          width: "40px",
                          height: "40px",
                          fontSize: "1rem",
                        }}
                      >
                        {nickName.charAt(0).toUpperCase()}
                      </div>

                      {/* Nombre y comentario */}
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="fw-bold mb-0">{nickName}</h6>

                          {/* Solo el autor puede ver la papelera */}
                          {user?._id === comment.userId?._id && (
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              title="Eliminar comentario"
                              aria-label="Eliminar comentario"
                              disabled={
                                eliminandoComentarioId !== null ||
                                eliminandoPublicacion ||
                                enviando
                              }
                              onClick={() =>
                                eliminarComentario(
                                  comment._id,
                                  comment.userId._id,
                                )
                              }
                            >
                              {eliminandoComentarioId === comment._id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4h8v2" />
                                  <path d="M19 6l-1 14H6L5 6" />
                                  <path d="M10 10v6M14 10v6" />
                                </svg>
                              )}
                            </Button>
                          )}
                        </div>

                        <div className="bg-light rounded-3 p-3">
                          <p className="mb-0 text-break">{comment.content}</p>
                        </div>

                        {/* Error al eliminar este comentario */}
                        {errorComentario?.id === comment._id && (
                          <Alert
                            variant="danger"
                            dismissible
                            className="mt-2 mb-0 small"
                            onClose={() => setErrorComentario(null)}
                          >
                            {errorComentario.mensaje}
                          </Alert>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Formulario para comentar */}
            <hr className="my-4" />

            {user ? (
              <>
                <h5 className="fw-bold mb-3">Dejá tu comentario</h5>

                <Form onSubmit={enviarComentario}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Escribí tu comentario..."
                      value={comentario}
                      onChange={(event) => setComentario(event.target.value)}
                      maxLength={2000}
                      required
                    />
                  </Form.Group>

                  {mensaje && (
                    <Alert
                      variant={
                        mensaje.includes("correctamente") ? "success" : "danger"
                      }
                    >
                      {mensaje}
                    </Alert>
                  )}

                  <div className="d-flex justify-content-end">
                    <Button
                      type="submit"
                      variant="dark"
                      disabled={
                        enviando ||
                        !comentario.trim() ||
                        eliminandoPublicacion ||
                        eliminandoComentarioId !== null
                      }
                    >
                      {enviando ? "Publicando..." : "Publicar comentario"}
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
