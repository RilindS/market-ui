import React, { useEffect, useState } from "react";
import { getAllProducts, updateProduct } from "../../services/request/productService";
import { getAllSuppliers } from "../../services/request/supplierService";

const EditableProductTable = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState(""); // State for search query

  // Fetch products and suppliers when the component mounts or search changes
  useEffect(() => {
    async function fetchData() {
      try {
        const productData = await getAllProducts(search); // Pass the search query
        const supplierData = await getAllSuppliers();
        setProducts(productData);
        setSuppliers(supplierData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [search]); // Re-run when search changes

  const handleEdit = async (id, field, value) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);

    try {
      await updateProduct(id, { [field]: value });
      console.log(`Updated ${field} for product ${id}`);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div>
      <button onClick={() => window.location.href = "create-product"}>Create Product</button>
      
      {/* Search input to filter products by name */}
      <input
        type="text"
        placeholder="Search by product name"
        value={search}
        onChange={(e) => setSearch(e.target.value)} // Update the search query on change
      />

      <table border="1" cellPadding="5" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Name</th>
            <th>Price (€)</th>
            <th>Description</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Supplier</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <input
                  type="text"
                  value={product.barcode}
                  onChange={(e) => handleEdit(product.id, "barcode", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => handleEdit(product.id, "name", e.target.value)}
                  onBlur={(e) => handleEdit(product.id, "name", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => handleEdit(product.id, "price", e.target.value)}
                  onBlur={(e) => handleEdit(product.id, "price", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={product.description}
                  onChange={(e) => handleEdit(product.id, "description", e.target.value)}
                  onBlur={(e) => handleEdit(product.id, "description", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={product.stockQuantity}
                  onChange={(e) => handleEdit(product.id, "stockQuantity", e.target.value)}
                  onBlur={(e) => handleEdit(product.id, "stockQuantity", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={product.category}
                  onChange={(e) => handleEdit(product.id, "category", e.target.value)}
                  onBlur={(e) => handleEdit(product.id, "category", e.target.value)}
                />
              </td>
              <td>
                <select
                  value={product.supplier?.id || ""}
                  onChange={(e) => handleEdit(product.id, "supplierId", e.target.value)}
                >
                  <option value="" disabled>Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={product.active}
                  onChange={(e) => handleEdit(product.id, "active", e.target.checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditableProductTable;
