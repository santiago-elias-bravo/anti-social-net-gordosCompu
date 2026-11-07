import { Container, Navbar as BootstrapNavbar } from "react-bootstrap";

import { Link } from "react-router-dom";

function Navbar() {
  return (
    <BootstrapNavbar
      expand="lg"
      bg="dark"
      variant="dark"
      sticky="top"
      className="py-3 shadow"
    >
      <Container>
        <Link to="/" className="navbar-brand fw-bold fs-4">
          <span className="bg-white text-dark rounded-3 px-2 py-1 me-2">A</span>
          Anti-Social <span className="text-white">Net GC</span> 
        </Link>

        <BootstrapNavbar.Toggle aria-controls="navbar-content" />

        <BootstrapNavbar.Collapse id="navbar-content">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 ms-auto mt-3 mt-lg-0">
            <Link to="/" className="text-white text-decoration-none">
              Inicio
            </Link>

            <Link to="/nuevo-post" className="text-white text-decoration-none">
              Crear publicación
            </Link>

            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-outline-light">
                Iniciar sesión
              </Link>

              <Link to="/registro" className="btn btn-primary">
                Registrarse
              </Link>
            </div>
          </div>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
