import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../services/auth/AuthContext";
import { createPurchaseInvoice } from "../../services/request/invoiceService";
import { getAllProducts } from "../../services/request/productService";
import { getAllSuppliers } from "../../services/request/supplierService";
import "./CreatePurchaseInvoice.scss";

const CreatePurchaseInvoice = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
  const [searchIndex, setSearchIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ 1. Ngarko draftin nëse ekziston
  useEffect(() => {
    const savedDraft = localStorage.getItem("invoiceDraft");
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setInvoiceNumber(draft.invoiceNumber || "");
      setSelectedSupplier(draft.selectedSupplier || "");
      setInvoiceDate(draft.invoiceDate || new Date().toISOString().slice(0, 10));
      setItems(draft.items || []);
      setTotalAmount(draft.totalAmount || 0);
    }
  }, []);

  // ✅ 2. Merr furnitorët
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getAllSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error("Gabim gjatë marrjes së furnitorëve:", error);
      }
    };
    fetchSuppliers();
  }, []);

  // ✅ 3. Përditëso totalin
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    setTotalAmount(total);
  }, [items]);

  const addItem = () => {
    setItems([...items, { productId: null, barcode: "", name: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === "quantity" || field === "unitPrice" ? Number(value) : value;
    setItems(newItems);
  };

  // ✅ 4. Kërko produktet
  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchQuery || searchQuery.trim() === "") {
        setSearchResults([]);
        return;
      }
      try {
        const results = await getAllProducts(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Gabim gjatë kërkimit të produkteve:", error);
      }
    };
    const delay = setTimeout(fetchProducts, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const selectProduct = (product) => {
    if (searchIndex !== null) {
      const newItems = [...items];
      newItems[searchIndex] = {
        ...newItems[searchIndex],
        productId: product.id,
        name: product.name,
        barcode: product.barcode,
        unitPrice: product.price,
      };
      setItems(newItems);
      setSearchResults([]);
      setSearchQuery("");
      setSearchIndex(null);
    }
  };

  // ✅ 5. Ruaj faturën
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Nuk jeni i loguar!");
      return;
    }

    const formattedDate = `${invoiceDate}T00:00:00`;
    const invoiceData = {
      invoiceNumber,
      invoiceDate: formattedDate,
      supplierId: selectedSupplier,
      userId: user.id,
      totalAmount,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    };

    try {
      setLoading(true);
      await createPurchaseInvoice(invoiceData);
      alert("✅ Fatura u krijua me sukses!");
      setInvoiceNumber("");
      setSelectedSupplier("");
      setItems([]);
      localStorage.removeItem("invoiceDraft"); // ✅ pastro draftin pas ruajtjes
    } catch (error) {
      console.error("Gabim gjatë krijimit të faturës:", error);
      alert("❌ Ndodhi një gabim gjatë ruajtjes së faturës.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 6. Ruaj draftin në LocalStorage para redirect-it
  const handleCreateProductRedirect = () => {
    const draft = {
      invoiceNumber,
      selectedSupplier,
      invoiceDate,
      items,
      totalAmount,
    };
    localStorage.setItem("invoiceDraft", JSON.stringify(draft));
    navigate("/admin/create-product");
  };

  return (
    <div className="invoice-form-container">
      <h2>🧾 Krijo Faturë të Re të Blerjes</h2>

      <form onSubmit={handleSubmit}>
        <section className="invoice-info">
          <div>
            <label>Numri i Faturës</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Data e Faturës</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Furnitori</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              required
            >
              <option value="">Zgjidh Furnitorin</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <h3>📦 Artikujt e Faturës</h3>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Emri i Produktit</th>
              <th>Sasia</th>
              <th>Çmimi</th>
              <th>Totali</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.barcode}</td>
                <td>
                  <input
                    type="text"
                    placeholder="Kërko produkt..."
                    value={item.name}
                    onChange={(e) => {
                      updateItem(index, "name", e.target.value);
                      setSearchQuery(e.target.value);
                      setSearchIndex(index);
                    }}
                  />
                  {searchIndex === index && searchResults.length > 0 && (
                    <ul className="search-dropdown">
                      {searchResults.map((product) => (
                        <li key={product.id} onClick={() => selectProduct(product)}>
                          <span>{product.name}</span>
                          <span className="price">{product.price} €</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* ✅ Nëse s’ka produkte */}
                  {searchIndex === index &&
                    searchResults.length === 0 &&
                    searchQuery.trim() !== "" && (
                      <div className="no-results">
                        <p>Produkti nuk u gjet.</p>
                        <button
                          type="button"
                          className="create-product-btn"
                          onClick={handleCreateProductRedirect}
                        >
                          ➕ Krijo Produkt të Ri
                        </button>
                      </div>
                    )}
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                  />
                </td>
                <td className="total-col">{(item.quantity * item.unitPrice).toFixed(2)} €</td>
                <td>
                  <button type="button" className="delete-btn" onClick={() => removeItem(index)}>
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="button" className="add-item-btn" onClick={addItem}>
          ➕ Shto Artikull
        </button>

        <div className="total-section">
          <strong>Totali i Faturës: {totalAmount.toFixed(2)} €</strong>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Duke ruajtur..." : "💾 Ruaj Faturën"}
        </button>
      </form>
    </div>
  );
};

export default CreatePurchaseInvoice;
