import "./ConfirmDeleteModal.css";

import AppButton from "./AppButton";

function ConfirmDeleteModal({
    label,
    description,
    onConfirm,
    onCancel,
    isDeleting = false,
    confirmText = "Yes, delete"
}) {
    return (
        <div className="confirm-delete-overlay" onClick={onCancel}>
            <div
                className="confirm-delete-card"
                onClick={(e) => e.stopPropagation()}
            >
                {label && (
                    <p className="confirm-delete-label">{label}</p>
                )}

                <h3>Are you sure?</h3>

                <p>{description}</p>

                <div className="confirm-delete-actions">
                    <AppButton
                        type="button"
                        variant="danger"
                        disabled={isDeleting}
                        onClick={onConfirm}
                    >
                        {isDeleting ? "Deleting..." : confirmText}
                    </AppButton>

                    <AppButton
                        type="button"
                        variant="secondary"
                        disabled={isDeleting}
                        onClick={onCancel}
                    >
                        Cancel
                    </AppButton>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeleteModal;
