import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSupplier } from "../../services/request/supplierService";
import "./Supplier.scss";

const CreateSupplier = () => {
  const [supplier, setSupplier] = useState({ name: "", contactEmail: "", contactPhone: "" });
  const navigate = useNavigate();

  // Kontrollo nëse komponenti po ngarkohet
  useEffect(() => {
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupplier((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSupplier(supplier);
      navigate("/admin/suppliers"); 
    } catch (error) {
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={supplier.name}
        onChange={handleChange}
        placeholder="Supplier Name"
      />
      <input
        type="email"
        name="contactEmail"
        value={supplier.contactEmail}
        onChange={handleChange}
        placeholder="Contact Email"
      />
      <input
        type="tel"
        name="contactPhone"
        value={supplier.contactPhone}
        onChange={handleChange}
        placeholder="Contact Phone"
      />
      <button type="submit">Create Supplier</button>
    </form>
  );
};

export default CreateSupplier;
