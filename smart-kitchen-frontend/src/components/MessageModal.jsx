import "./MessageModal.css";

/*
    Reusable modal component for displaying messages across the app.
    Supports error, success, warning, and info messages.
*/
function MessageModal({
                          type = "error",
                          title,
                          message,
                          buttonText = "Got It 👍",
                          onClose
                      }) {
    if (!message) {
        return null;
    }

    const modalTitles = {
        error: "Error",
        success: "Success",
        warning: "Warning",
        info: "Notice"
    };

    const safeType = ["error", "success", "warning", "info"].includes(type)
        ? type
        : "info";

    return (
        <div className="message-modal-overlay">
            <div className={`message-modal-card message-modal-${safeType}`}>
                <h3>
                    {title || modalTitles[safeType]}
                </h3>

                <p>
                    {message}
                </p>

                <button
                    type="button"
                    onClick={onClose}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}

export default MessageModal;