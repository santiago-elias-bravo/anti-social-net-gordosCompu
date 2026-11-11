import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";
import { Container, Card, Form, Button, Alert, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

interface Tag {
  _id: string;
  name: string;
}

interface PostCreado {
  _id: string;
  description: string;
  userId: string;
}

interface PostResponse {
  message?: string;
  error?: string;
  post?: PostCreado;
}

function NewPost() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");

  const [tags, setTags] = useState<Tag[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [imagenes, setImagenes] = useState<File[]>([]);

  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const [creandoEtiqueta, setCreandoEtiqueta] = useState(false);
  const [errorNuevaEtiqueta, setErrorNuevaEtiqueta] = useState("");

  const [cargandoTags, setCargandoTags] = useState(true);
  const [publicando, setPublicando] = useState(false);

  const [error, setError] = useState("");
  const [errorTags, setErrorTags] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  // Referencia al input de imágenes
  const inputImagenesRef = useRef<HTMLInputElement>(null);

  // Filtrar etiquetas según la búsqueda
  const etiquetasFiltradas =
    nuevaEtiqueta.trim() === ""
      ? []
      : tags
          .filter(
            (tag) =>
              tag.name
                .toLowerCase()
                .includes(nuevaEtiqueta.trim().toLowerCase()) &&
              !tagIds.includes(tag._id),
          )
          .slice(0, 6);

  // Ocultar el mensaje de confirmacion del post
  useEffect(() => {
    if (mensajeExito === "") return;

    const timer = setTimeout(() => {
      setMensajeExito("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [mensajeExito]);

  // Obtener etiquetas desde la API
  useEffect(() => {
    async function obtenerTags() {
      try {
        const response = await fetch(`${API_URL}/tags`);

        if (!response.ok) {
          throw new Error("No se pudieron obtener las etiquetas.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Formato de etiquetas incorrecto.");
        }

        setTags(data);
        setErrorTags("");
      } catch (error) {
        console.error("Error al obtener etiquetas:", error);
        setErrorTags("No se pudieron cargar las etiquetas.");
      } finally {
        setCargandoTags(false);
      }
    }

    obtenerTags();
  }, [API_URL]);

  // Actualizar descripción
  function handleDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDescription(event.target.value);
    setError("");
    setMensajeExito("");
  }

  // Seleccionar etiqueta existente
  function handleSeleccionarEtiqueta(tagId: string) {
    setTagIds((idsActuales) =>
      idsActuales.includes(tagId) ? idsActuales : [...idsActuales, tagId],
    );

    setNuevaEtiqueta("");
    setErrorNuevaEtiqueta("");
  }

  // Quitar etiqueta seleccionada
  function handleQuitarEtiqueta(tagId: string) {
    setTagIds((idsActuales) => idsActuales.filter((id) => id !== tagId));
  }

  // Crear una etiqueta nueva
  async function handleCrearEtiqueta() {
    if (creandoEtiqueta || publicando || cargandoTags) return;

    const nombre = nuevaEtiqueta.trim();
    setErrorNuevaEtiqueta("");

    if (nombre === "") {
      setErrorNuevaEtiqueta("Ingresá el nombre de la etiqueta.");
      return;
    }

    // Si existe exactamente, seleccionarla
    const etiquetaExistente = tags.find(
      (tag) => tag.name.toLowerCase() === nombre.toLowerCase(),
    );

    if (etiquetaExistente) {
      handleSeleccionarEtiqueta(etiquetaExistente._id);
      return;
    }

    setCreandoEtiqueta(true);

    try {
      const response = await fetch(`${API_URL}/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nombre,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrorNuevaEtiqueta(
            "Esta etiqueta ya está registrada. Actualizá la página para buscarla.",
          );
        } else {
          setErrorNuevaEtiqueta(
            data.error || data.message || "No se pudo crear la etiqueta.",
          );
        }
        return;
      }

      // Actualizar el listado desde MongoDB
      const respuestaTags = await fetch(`${API_URL}/tags`);

      if (!respuestaTags.ok) {
        throw new Error(
          "La etiqueta se creó, pero no se pudo actualizar el listado.",
        );
      }

      const etiquetasActualizadas: Tag[] = await respuestaTags.json();

      if (!Array.isArray(etiquetasActualizadas)) {
        throw new Error("El listado de etiquetas es inválido.");
      }

      setTags(etiquetasActualizadas);
      setErrorTags("");

      // Seleccionar la etiqueta creada
      const etiquetaCreada = etiquetasActualizadas.find(
        (tag) => tag.name.toLowerCase() === nombre.toLowerCase(),
      );

      if (etiquetaCreada) {
        handleSeleccionarEtiqueta(etiquetaCreada._id);
      } else {
        setErrorNuevaEtiqueta(
          "La etiqueta se creó, pero no se pudo seleccionar.",
        );
      }
    } catch (error) {
      console.error("Error al crear etiqueta: ", error);

      setErrorNuevaEtiqueta(
        error instanceof Error
          ? error.message
          : "No se pudo conectar con el servidor.",
      );
    } finally {
      setCreandoEtiqueta(false);
    }
  }

  // Seleccionar imágenes
  function handleImagenesChange(event: ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(event.target.files || []);

    const imagenInvalida = archivos.find(
      (archivo) =>
        !archivo.type.startsWith("image/") || archivo.size > 5 * 1024 * 1024,
    );

    if (imagenInvalida) {
      setError("Seleccioná únicamente imágenes de hasta 5 MB cada una.");
      event.target.value = "";
      return;
    }

    setImagenes((imagenesActuales) => [...imagenesActuales, ...archivos]);

    // Permitir seleccionar nuevamente el mismo archivo
    event.target.value = "";

    setError("");
  }

  // Quitar una imagen seleccionada
  function handleQuitarImagen(index: number) {
    setImagenes((imagenesActuales) =>
      imagenesActuales.filter((_, i) => i !== index),
    );
  }

  // Validar formulario
  function validateForm() {
    if (userId.trim() === "") {
      return "Ingresá un ID de usuario.";
    }

    if (!/^[a-fA-F0-9]{24}$/.test(userId.trim())) {
      return "El ID de usuario debe ser un ObjectId válido.";
    }

    if (description.trim() === "") {
      return "Ingresá una descripción para la publicación.";
    }

    if (description.trim().length > 2000) {
      return "La descripción no puede superar los 2000 caracteres.";
    }

    return "";
  }

  // Crear publicación y asociar imágenes
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (publicando || creandoEtiqueta) return;

    const mensajeError = validateForm();

    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    setPublicando(true);
    setError("");
    setMensajeExito("");

    try {
      // Crear publicación
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
          userId: userId.trim(),
          tagIds: tagIds,
        }),
      });

      const data: PostResponse = await response.json();

      if (!response.ok) {
        setError(
          data.error || data.message || "No se pudo crear la publicación.",
        );
        return;
      }

      if (!data.post?._id) {
        setError("La API no devolvió el ID de la publicación creada.");
        return;
      }

      const nuevoPostId = data.post._id;

      // Asociar imágenes
      let imagenesFallidas = 0;

      for (const imagen of imagenes) {
        const datosImagen = new FormData();

        datosImagen.append("imagen", imagen);
        datosImagen.append("postId", nuevoPostId);

        try {
          const respuestaImagen = await fetch(`${API_URL}/postimages`, {
            method: "POST",
            body: datosImagen,
          });

          if (!respuestaImagen.ok) {
            imagenesFallidas++;
          }
        } catch (error) {
          console.error("Error al subir imagen:", error);
          imagenesFallidas++;
        }
      }

      // Mostrar resultado
      if (imagenesFallidas > 0) {
        setMensajeExito(
          `La publicación se creó correctamente, pero ${imagenesFallidas} imagen(es) no pudieron subirse.`,
        );
      } else {
        setMensajeExito("¡Publicación creada correctamente!");
      }

      // Limpiar formulario
      setDescription("");
      setTagIds([]);
      setImagenes([]);
      setNuevaEtiqueta("");

      if (inputImagenesRef.current) {
        inputImagenesRef.current.value = "";
      }
    } catch (error) {
      console.error("Error al crear publicación:", error);
      setError("No se pudo completar la solicitud.");
    } finally {
      setPublicando(false);
    }
  }

  return (
    <Container className="py-4 py-md-5">
      <div className="mx-auto" style={{ maxWidth: "900px" }}>
        {/* Encabezado */}
        <div className="mb-4">
          <h1 className="fw-bold">Crear nueva publicación</h1>
          <p className="text-secondary">
            Compartí tus ideas, experiencias y proyectos con la comunidad.
          </p>
        </div>

        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}

            {mensajeExito && (
              <Alert
                variant={
                  mensajeExito.includes("no pudieron subirse")
                    ? "warning"
                    : "success"
                }
              >
                <strong>{mensajeExito}</strong>
              </Alert>
            )}

            <Form onSubmit={handleSubmit} noValidate>
              {/* Usuario Prueba */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  ID del usuario (pruebas) *
                </Form.Label>

                <Form.Control
                  type="text"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    setError("");
                  }}
                  disabled={publicando}
                />
              </Form.Group>

              {/* Descripción */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Descripción *</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="¿Qué estás pensando?"
                  value={description}
                  onChange={handleDescriptionChange}
                  maxLength={2000}
                  disabled={publicando}
                />

                <div className="text-end text-secondary small mt-1">
                  {description.length} / 2000 caracteres
                </div>
              </Form.Group>

              {/* Etiquetas */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Etiquetas</Form.Label>

                <p className="text-secondary small">
                  Buscá etiquetas existentes o creá una nueva.
                </p>

                {cargandoTags && (
                  <p className="text-secondary small">Cargando etiquetas...</p>
                )}

                {errorTags && <Alert variant="warning">{errorTags}</Alert>}

                {/* Buscador */}
                <div className="d-flex gap-2 align-items-start">
                  <Form.Control
                    type="text"
                    placeholder="Buscar o crear etiqueta..."
                    value={nuevaEtiqueta}
                    onChange={(e) => {
                      setNuevaEtiqueta(e.target.value);
                      setErrorNuevaEtiqueta("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleCrearEtiqueta();
                      }
                    }}
                    disabled={publicando || creandoEtiqueta}
                    isInvalid={!!errorNuevaEtiqueta}
                  />

                  <Button
                    type="button"
                    variant="outline-dark"
                    onClick={handleCrearEtiqueta}
                    disabled={
                      publicando ||
                      creandoEtiqueta ||
                      cargandoTags ||
                      nuevaEtiqueta.trim() === ""
                    }
                    className="text-nowrap"
                  >
                    {creandoEtiqueta ? "Agregando..." : "Agregar"}
                  </Button>
                </div>

                {/* Resultados de búsqueda */}
                {nuevaEtiqueta.trim() !== "" &&
                  etiquetasFiltradas.length > 0 && (
                    <div className="border rounded mt-2 overflow-hidden">
                      {etiquetasFiltradas.map((tag) => (
                        <button
                          key={tag._id}
                          type="button"
                          className="tag-resultado w-100 text-start border-0 border-bottom px-3 py-2"
                          onClick={() => handleSeleccionarEtiqueta(tag._id)}
                          disabled={publicando || creandoEtiqueta}
                        >
                          #{tag.name}
                        </button>
                      ))}
                    </div>
                  )}

                {nuevaEtiqueta.trim() !== "" &&
                  etiquetasFiltradas.length === 0 &&
                  !cargandoTags &&
                  !errorTags && (
                    <p className="text-secondary small mt-2 mb-0">
                      Esta etiqueta no existe. Podés crear una nueva haciendo
                      clic en el botón "Agregar".
                    </p>
                  )}

                {errorNuevaEtiqueta && (
                  <div className="text-danger small mt-2">
                    {errorNuevaEtiqueta}
                  </div>
                )}

                {/* Etiquetas seleccionadas */}
                {tagIds.length > 0 && (
                  <div className="mt-3">
                    <p className="small fw-semibold mb-2">
                      Etiquetas seleccionadas:
                    </p>

                    <div className="d-flex flex-wrap gap-2">
                      {tags
                        .filter((tag) => tagIds.includes(tag._id))
                        .map((tag) => (
                          <Badge
                            key={tag._id}
                            bg="dark"
                            className="d-flex align-items-center gap-2 px-3 py-2"
                          >
                            #{tag.name}
                            <button
                              type="button"
                              className="border-0 bg-transparent text-white p-0"
                              onClick={() => handleQuitarEtiqueta(tag._id)}
                              disabled={publicando}
                              aria-label={`Quitar etiqueta ${tag.name}`}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </Form.Group>

              {/* Imágenes */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Imágenes</Form.Label>

                {/* Input oculto */}
                <input
                  ref={inputImagenesRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="visually-hidden"
                  onChange={handleImagenesChange}
                  disabled={publicando}
                  tabIndex={-1}
                />

                {/* Selección de imágenes */}
                <button
                  type="button"
                  className="imagen-upload w-100 rounded-3 d-flex flex-column align-items-center justify-content-center text-center"
                  onClick={() => inputImagenesRef.current?.click()}
                  disabled={publicando}
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="mb-2"
                  >
                    <rect x="3" y="3" width="15" height="15" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m3 15 4-4 3 3 2-2 6 6" />
                    <path d="M20 3v6" />
                    <path d="M17 6h6" />
                  </svg>

                  <span className="fw-semibold">Seleccionar imágenes</span>

                  <small className="text-secondary mt-1">
                    Hasta 5 MB por archivo
                  </small>
                </button>

                {/* Archivos seleccionados */}
                {imagenes.length > 0 && (
                  <div className="mt-3">
                    <p className="small fw-semibold mb-2">
                      Imágenes seleccionadas:
                    </p>

                    {imagenes.map((imagen, index) => (
                      <div
                        key={`${imagen.name}-${index}`}
                        className="d-flex justify-content-between align-items-center border rounded px-3 py-2 mb-2 gap-2"
                      >
                        <span className="small text-secondary text-break">
                          {imagen.name}
                        </span>

                        <Button
                          type="button"
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleQuitarImagen(index)}
                          disabled={publicando}
                        >
                          Quitar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Form.Group>

              <hr />

              {/* Botones */}
              <div className="d-flex justify-content-end gap-2">
                <Link
                  to="/"
                  className={`btn btn-outline-secondary ${
                    publicando ? "disabled" : ""
                  }`}
                  aria-disabled={publicando}
                  tabIndex={publicando ? -1 : undefined}
                  onClick={(e) => {
                    if (publicando) e.preventDefault();
                  }}
                >
                  Cancelar
                </Link>

                <Button
                  type="submit"
                  variant="dark"
                  disabled={publicando || creandoEtiqueta}
                >
                  {publicando ? "Publicando..." : "Crear publicación"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default NewPost;
