import { Modal } from "@mui/material";
import "./AlertModal.css"


export default function AlertModal({ open, title, message, onConfirm, onCancel, confirmText, cancelText, confirmVariant = 'primary', cancelVariant = 'cancel' }) {

    return (
        <Modal open={open} onClose={onCancel}>
            <div className="alert-container">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="alert-button-container">
                    {cancelText && (
                        <button
                            className={`alert-btn ${cancelVariant === 'primary' ? 'alert-btn--confirm' : 'alert-btn--cancel'}`}
                            onClick={onCancel}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        className={`alert-btn ${confirmVariant === 'danger' ? 'alert-btn--danger' : 'alert-btn--confirm'}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
