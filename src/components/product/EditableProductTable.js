import { useEffect, useState } from "react";
import { createProduct, getAllProducts, updateProduct } from "../../services/request/productService";
import { getAllSuppliers } from "../../services/request/supplierService";

const EditableProductTable = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState("");


  // State për rreshtin e krijimit
  const [newProduct, setNewProduct] = useState({
  barcode: "",
  name: "",
  price: "",
  description: "",
  stockQuantity: "",
  category: "",
  supplierId: "",   // ← e re
  active: true,
});
const showNotification = (msg) => {
  setNotification(msg);
  setTimeout(() => {
    setNotification("");
  }, 2500);
};

  useEffect(() => {
    async function fetchData() {
      try {
        let productData = await getAllProducts(search);
        const supplierData = await getAllSuppliers();

        // SORTIMI sipas kërkesës
        const smallBarcodes = productData
          .filter((p) => p.barcode && p.barcode.length < 3)
          .sort((a, b) => Number(b.barcode) - Number(a.barcode));

        const otherProducts = productData.filter((p) => !p.barcode || p.barcode.length >= 3);

        productData = [...smallBarcodes, ...otherProducts];

        setProducts(productData);
        setSuppliers(supplierData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [search]);

  const handleEdit = async (id, field, value) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);

    try {
      await updateProduct(id, { [field]: value });
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleCreate = async () => {
  try {
    const created = await createProduct(newProduct);

    // Shto produktin lokalisht
    setProducts([created, ...products]);

    // Pastro input-at
    setNewProduct({
      barcode: "",
      name: "",
      price: "",
      description: "",
      stockQuantity: "",
      category: "",
      supplierId: "",
      active: true,
    });

    showNotification("Produkti u krijua me sukses!");

    // Bëj refresh pas 1 sekonde
    setTimeout(() => {
      window.location.reload();
    }, 600);

  } catch (error) {
    console.error("Error creating product:", error);
    showNotification("Gabim gjatë krijimit të produktit!");
  }
};

  return (
    
    <div>
      {notification && (
  <div
    style={{
      background: "#4caf50",
      padding: "10px",
      color: "white",
      marginBottom: "10px",
      borderRadius: "5px",
      textAlign: "center",
      fontWeight: "bold",
    }}
  >
    {notification}
  </div>
)}

      {/* Input për search */}
      <input
        type="text"
        placeholder="Search by product name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table border="1" cellPadding="5" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Name</th>
            <th>Price (€)</th>
            <th>Description</th>
            <th>Stock</th>
            {/* <th>Category</th> */}
            <th>Supplier</th>
            <th>Active</th>
            <th>Create</th>
          </tr>
        </thead>

        <tbody>
          {/* RRESHTI I KRIJIMIT */}
          <tr style={{ background: "#e9ffe9" }}>
            <td>
              <input
                type="text"
                value={newProduct.barcode}
                onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
              />
            </td>
            <td>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </td>
            <td>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </td>
            <td>
              <input
                type="text"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </td>
            <td>
              <input
                type="number"
                value={newProduct.stockQuantity}
                onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
              />
            </td>
            {/* <td>
              <input
                type="text"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              />
            </td> */}

            <td>
              <select
  value={newProduct.supplierId}
  onChange={(e) => setNewProduct({ ...newProduct, supplierId: Number(e.target.value) })}
>
  <option value="">Zgjedh Furnitorin</option>
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
                checked={newProduct.active}
                onChange={(e) => setNewProduct({ ...newProduct, active: e.target.checked })}
              />
            </td>

            <td>
              <button onClick={handleCreate}>Create</button>
            </td>
          </tr>

          {/* PRODUKTET E EKZISTUESHME */}
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <input
                  type="text"
                  value={product.barcode}
                  onChange={(e) => handleEdit(product.id, "barcode", e.target.value)}
                />
              </td>

              <td>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => handleEdit(product.id, "name", e.target.value)}
                />
              </td>

              <td>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => handleEdit(product.id, "price", e.target.value)}
                />
              </td>

              <td>
                <input
                  type="text"
                  value={product.description}
                  onChange={(e) => handleEdit(product.id, "description", e.target.value)}
                />
              </td>

              <td>
                <input
                  type="number"
                  value={product.stockQuantity}
                  onChange={(e) => handleEdit(product.id, "stockQuantity", e.target.value)}
                />
              </td>

              {/* <td>
                <input
                  type="text"
                  value={product.category}
                  onChange={(e) => handleEdit(product.id, "category", e.target.value)}
                />
              </td> */}

              <td>
              <select
                value={product.supplierId || ""} 
                onChange={(e) => handleEdit(product.id, "supplierId", Number(e.target.value))}
              >
                <option value="" disabled>Zgjedh Furnitorin</option>
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

              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditableProductTable;
