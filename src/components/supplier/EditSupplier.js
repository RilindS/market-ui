// src/pages/Supplier/EditSupplier.js
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSupplierById, updateSupplier } from "../../services/request/supplierService";
import "./Supplier.scss";

const EditSupplier = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState({ name: "", contactEmail: "", contactPhone: "" });
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSupplier() {
      const data = await getSupplierById(id);
      setSupplier(data);
    }
    fetchSupplier();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupplier((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSupplier(id, supplier);
    navigate("/admin/suppliers"); // Use absolute path here
  };
  

  return (
    <div className="supplier-container">
      <h2>Edit Supplier</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={supplier.name} onChange={handleChange} required />
        <input type="email" name="contactEmail" value={supplier.contactEmail} onChange={handleChange} />
        <input type="text" name="contactPhone" value={supplier.contactPhone} onChange={handleChange} />
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default EditSupplier;
