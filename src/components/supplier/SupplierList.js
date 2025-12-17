// src/pages/Supplier/SupplierList.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  deleteSupplier,
  getAllSuppliers,
  getProductsBySupplier
} from "../../services/request/supplierService";

import { getAllProducts } from "../../services/request/productService";

import "./Supplier.scss";

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [products, setProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");

  const navigate = useNavigate();

  // ===================== SUPPLIER SEARCH =====================
  useEffect(() => {
    fetchSuppliers();
  }, [searchTerm]);

  const fetchSuppliers = async () => {
    try {
      const data = await getAllSuppliers(searchTerm);
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  // ===================== DELETE SUPPLIER =====================
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      await deleteSupplier(id);
      fetchSuppliers();
    }
  };

  // ===================== LOAD PRODUCTS BY SUPPLIER =====================
  const loadSupplierProducts = async (supplierId) => {
    try {
      const data = await getProductsBySupplier(supplierId);
      setProducts(data);
      setSelectedSupplierId(supplierId);
      setProductSearchTerm("");
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  // ===================== PRODUCT SEARCH =====================
  useEffect(() => {
    if (!selectedSupplierId) return;

    if (productSearchTerm.trim() === "") {
      loadSupplierProducts(selectedSupplierId);
      return;
    }

    searchProducts(productSearchTerm);
  }, [productSearchTerm]);

  const searchProducts = async (term) => {
    try {
const data = await getAllProducts(term);
const productsList = data.content;
      // Filter only products belonging to selected supplier
      const filtered = productsList.filter(
        (p) => p.supplierId === selectedSupplierId
      );

      setProducts(filtered);
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  return (
    <div className="supplier-container">
      <h2>Lista e Furnizuesve</h2>

      {/* SUPPLIER SEARCH */}
      <input
        type="text"
        placeholder="Search suppliers by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

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
            <React.Fragment key={sup.id}>
              <tr>
                <td>{sup.name}</td>
                <td>{sup.contactEmail}</td>
                <td>{sup.contactPhone}</td>
                <td>
                  <button onClick={() => navigate(`edit-suppliers/${sup.id}`)}>
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(sup.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>

                  <button onClick={() => loadSupplierProducts(sup.id)}>
                    View Products
                  </button>
                </td>
              </tr>

              {/* PRODUCT SECTION */}
              {selectedSupplierId === sup.id && (
                <tr>
                  <td colSpan="4">
                    <div className="product-section">
                      <h4>Produktet e Furnisuesit: {sup.name}</h4>

                      <button
                        className="close-btn"
                        onClick={() => {
                          setSelectedSupplierId(null);
                          setProducts([]);
                          setProductSearchTerm("");
                        }}
                      >
                        Close Products
                      </button>

                      {/* PRODUCT SEARCH INPUT */}
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search products by name..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        style={{ marginTop: "10px", marginBottom: "10px" }}
                      />

                      {products.length === 0 ? (
                        <p>No products found.</p>
                      ) : (
                        <table className="inner-product-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Barcode</th>
                              <th>Stock</th>
                              <th>Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((p) => (
                              <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>{p.barcode ?? "-"}</td>
                                <td>{p.stockQuantity}</td>
                                <td>{p.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierList;
