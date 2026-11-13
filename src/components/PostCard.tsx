import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

interface PostCardProps {
  id: string;
  nickName: string;
  fecha: string;
  description: string;
  tags: string[];
  comentarios: number;
  imagenes?: string[];
}

function PostCard({
  id,
  nickName,
  fecha,
  description,
  tags,
  comentarios,
  imagenes = [],
}: PostCardProps) {
  return (
    <Card className="border-0 shadow-sm rounded-4 mb-4">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-3">
          <div
            className="bg-dark text-white rounded-circle d-flex justify-content-center align-items-center fw-bold"
            style={{ width: "45px", height: "45px" }}
          >
            {nickName.charAt(0).toUpperCase()}
          </div>

          <div className="ms-3">
            <h6 className="fw-bold mb-0">{nickName}</h6>
            <small className="text-secondary">{fecha}</small>
          </div>
        </div>

        <Card.Text className="mb-3">{description}</Card.Text>

        {/* Imágenes */}
        {imagenes.length > 0 && (
          <div className="d-flex flex-column gap-3 mb-3">
            {imagenes.map((imagen, index) => {
              const imageUrl = imagen.startsWith("http")
                ? imagen
                : `${import.meta.env.VITE_API_URL}${imagen}`;

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

        <div className="d-flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              bg="light"
              text="dark"
              className="border rounded-pill px-3 py-2 fw-medium"
            >
              #{tag}
            </Badge>
          ))}
        </div>

        <hr />

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-secondary">
            💬 {comentarios} comentarios
          </small>

          <Link
            to={`/post/${id}`}
            className="btn btn-outline-primary btn-sm"
          >
            Ver publicación
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
}

export default PostCard;
