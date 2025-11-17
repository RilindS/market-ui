// src/pages/Supplier/SupplierList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteSupplier, getAllSuppliers } from "../../services/request/supplierService";
import "./Supplier.scss";

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const data = await getAllSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      await deleteSupplier(id);
      fetchSuppliers(); 
    }
  };

  return (
    <div className="supplier-container">
      <h2>Supplier List</h2>
      <button onClick={() => navigate("create-supplier")}>+ Add Supplier</button>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((sup) => (
            <tr key={sup.id}>
              <td>{sup.name}</td>
              <td>{sup.contactEmail}</td>
              <td>{sup.contactPhone}</td>
              <td>
                <button onClick={() => navigate(`edit-suppliers/${sup.id}`)}>Edit</button>
                <button onClick={() => handleDelete(sup.id)} className="delete-btn">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierList;
