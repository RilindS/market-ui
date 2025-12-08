import React, { useEffect, useState } from "react";
import { createProduct, updateProduct } from "../../services/request/productService";
import { getAllSuppliers } from "../../services/request/supplierService";
import styles from "./ProductForm.module.scss"; // Importo SCSS

const CATEGORIES = ["DETERGJENTA", "USHQIMORE", "BUJQESORE"];

const ProductForm = ({ initialData = null, isEditMode = false, onSuccess }) => {
  const [product, setProduct] = useState({
    barcode: "",
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    category: "",
    imageUrl: "",
    active: true,
    supplierId: "",
  });

  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const data = await getAllSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    }
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (initialData) {
      setProduct({
        barcode: initialData.barcode,
        name: initialData.name,
        description: initialData.description,
        price: initialData.price,
        stockQuantity: initialData.stockQuantity,
        category: initialData.category,
        imageUrl: initialData.imageUrl,
        active: initialData.active,
        supplierId: initialData.supplier?.id || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateProduct(initialData.id, product);
        alert("Product updated successfully!");
      } else {
        await createProduct(product);
        alert("Product created successfully!");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  return (
    <form className={styles["product-form"]} onSubmit={handleSubmit}>
      <label>Barcode:</label>
      <input type="text" name="barcode" value={product.barcode} onChange={handleChange} required />

      <label>Name:</label>
      <input type="text" name="name" value={product.name} onChange={handleChange} required />

      <label>Description:</label>
      <textarea name="description" value={product.description} onChange={handleChange} />

      <label>Price:</label>
      <input type="number" name="price" value={product.price} onChange={handleChange} required />

      <label>Stock Quantity:</label>
      <input type="number" name="stockQuantity" value={product.stockQuantity} onChange={handleChange} required />

      <label>Category:</label>
      <select name="category" value={product.category} onChange={handleChange} required>
        <option value="">Select Category</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <label>Image URL:</label>
      <input type="text" name="imageUrl" value={product.imageUrl} onChange={handleChange} />

      <div className={styles["checkbox-container"]}>
        <input type="checkbox" name="active" checked={product.active} onChange={handleChange} />
        <label>Active</label>
      </div>

      <label>Supplier:</label>
      <select name="supplierId" value={product.supplierId} onChange={handleChange} required>
        <option value="">Select Supplier</option>
        {suppliers.map((sup) => (
          <option key={sup.id} value={sup.id}>
            {sup.name}
          </option>
        ))}
      </select>

      <button type="submit">{isEditMode ? "Update Product" : "Create Product"}</button>
    </form>
  );
};

export default ProductForm;
