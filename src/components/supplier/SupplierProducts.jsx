import { useEffect, useState } from "react";
import { getProductsBySupplier, getSuppliers } from "../../services/request/productService";
import "./SupplierProducts.scss";

const SupplierProducts = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  let searchTimeout;

  useEffect(() => {
    loadSuppliers(); // load all on page start
  }, []);

  // Load suppliers from API
  const loadSuppliers = async (searchQuery = "") => {
    setLoadingSuppliers(true);
    const data = await getSuppliers(searchQuery);
    setSuppliers(data);
    setLoadingSuppliers(false);
  };

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadSuppliers(search);
    }, 400);

    return () => clearTimeout(searchTimeout);
  }, [search]);

  const loadProducts = async (supplierId) => {
    const data = await getProductsBySupplier(supplierId);
    setProducts(data);
  };

  const handleSupplierChange = (e) => {
    const id = e.target.value;
    setSelectedSupplier(id);
    setProducts([]);

    if (id) {
      loadProducts(id);
    }
  };

  return (
    <div className="supplier-products-container">
      <h2>📦 Produktet sipas furnitorit</h2>

      {/* SEARCH INPUT */}
      <input
        type="text"
        className="supplier-search-input"
        placeholder="Kërko furnitorin..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* SELECT SUPPLIER DROPDOWN */}
      <select className="supplier-select" value={selectedSupplier} onChange={handleSupplierChange}>
        <option value="">-- Zgjidh furnitorin --</option>
        {loadingSuppliers && <option>Loading...</option>}
        {!loadingSuppliers &&
          suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
      </select>

      {/* PRODUCTS TABLE */}
      {products.length > 0 && (
        <table className="supplier-products-table">
          <thead>
            <tr>
              <th>Produkti</th>
              <th>Barcode</th>
              <th>Stoku</th>
              <th>Çmimi</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.barcode}</td>
                <td>{p.stockQuantity}</td>
                <td>{p.price.toFixed(2)}€</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedSupplier && products.length === 0 && (
        <p className="empty-msg">Ky furnitor nuk ka produkte.</p>
      )}
    </div>
  );
};

export default SupplierProducts;
