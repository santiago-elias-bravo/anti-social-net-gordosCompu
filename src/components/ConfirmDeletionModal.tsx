import { Button, Modal, Spinner } from "react-bootstrap";

interface ConfirmDeletionModalProps {
  show: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting?: boolean;
}

function ConfirmDeletionModal({
  show,
  message,
  onCancel,
  onConfirm,
  deleting = false,
}: ConfirmDeletionModalProps) {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      backdrop={deleting ? "static" : true}
      className="confirmacion-borrado"
    >
      <Modal.Header closeButton>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-0 text-center">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={onCancel}
          disabled={deleting}
        >
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={deleting}>
          {deleting ? <Spinner animation="border" size="sm" /> : "Eliminar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmDeletionModal;
