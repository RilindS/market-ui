import ProductForm from "../product/ProductForm";
import "./ProductModal.scss";

const ProductModal = ({ show, onClose, onSuccess }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>➕ Krijo Produkt të Ri</h3>
        <ProductForm onSuccess={onSuccess} />
        <button className="close-btn" onClick={onClose}>
          Mbyll
        </button>
      </div>
    </div>
  );
};

export default ProductModal;
