import "./CreateProductButton.css";

function CreateProductButton({
                                 onClick,
                                 label = "+ Create New Product",
                                 hint = "Can't find your product? Create it here",
                                 tooltip = "The product you are looking for is not in the list? Click here"
                             }) {
    return (
        <div className="product-trigger-wrapper">
            <button
                type="button"
                className="product-trigger-button"
                onClick={onClick}
                data-tooltip={tooltip}
            >
                {label}
            </button>

            <span className="product-trigger-hint">
                {hint}
            </span>
        </div>
    );
}

export default CreateProductButton;
