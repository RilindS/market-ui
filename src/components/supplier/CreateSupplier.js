import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSupplier } from "../../services/request/supplierService";
import "./CreateSupplier.scss";

const CreateSupplier = () => {
  const [supplier, setSupplier] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupplier((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSupplier(supplier);
      navigate("/admin/suppliers");
    } catch (error) {}
  };

  return (
    <div className="supplier-container">
      <div className="supplier-card">
        <h2 className="title">Create Supplier</h2>

        <form onSubmit={handleSubmit} className="supplier-form">
          <input
            type="text"
            name="name"
            value={supplier.name}
            onChange={handleChange}
            placeholder="Supplier Name"
            className="input-field"
          />
          <input
            type="email"
            name="contactEmail"
            value={supplier.contactEmail}
            onChange={handleChange}
            placeholder="Contact Email"
            className="input-field"
          />
          <input
            type="tel"
            name="contactPhone"
            value={supplier.contactPhone}
            onChange={handleChange}
            placeholder="Contact Phone"
            className="input-field"
          />

          <button type="submit" className="btn-create">
            Create Supplier
          </button>

          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/suppliers")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSupplier;
