// src/components/invoice/CreatePurchaseInvoice.jsx
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../services/auth/AuthContext";
import { createPurchaseInvoice } from "../../services/request/invoiceService";
import { getAllProducts, getProductByBarcode } from "../../services/request/productService";
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
  const [notification, setNotification] = useState(null);

  const [searchResults, setSearchResults] = useState([]);
  const [searchIndex, setSearchIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // =============================
  // SUPPLIER COMBOBOX
  // =============================
  const SupplierCombobox = ({ valueId, onChange, allSuppliers }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    const currentName =
      allSuppliers.find((s) => s.id === valueId)?.name || "Zgjedh Furnitorin";

    useEffect(() => {
      if (!open) {
        setSearch("");
        return;
      }
      async function fetchSuppliers() {
        try {
          const res = await getAllSuppliers(search);
          setFilteredSuppliers(res.content || res || []);
        } catch (err) {
          console.error(err);
        }
      }
      fetchSuppliers();
    }, [search, open]);

    useEffect(() => {
      if (!open) return;
      const handleClickOutside = (event) => {
        if (triggerRef.current && !triggerRef.current.contains(event.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [open]);

    const handleSelect = (supplier) => {
      onChange(supplier.id);
      setOpen(false);
    };

    const dropdownStyle = {
      position: "absolute",
      zIndex: 1000,
      background: "#2a2a3d",
      border: "1px solid #444",
      borderRadius: "6px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      minWidth: "200px",
      maxHeight: "200px",
      overflowY: "auto",
    };

    const inputStyle = {
      width: "100%",
      padding: "5px",
      border: "none",
      borderBottom: "1px solid #444",
      outline: "none",
      background: "#2a2a3d",
      color: "#f1f1f1",
    };

    const listStyle = { listStyle: "none", padding: 0, margin: 0 };
    const itemStyle = { 
      padding: "8px 12px", 
      cursor: "pointer", 
      borderBottom: "1px solid #333",
      color: "#f1f1f1",
      background: "#2a2a3d"
    };
    const triggerStyle = { 
      position: "relative", 
      cursor: "pointer", 
      minWidth: "150px", 
      padding: "5px", 
      border: "1px solid #444", 
      borderRadius: "6px", 
      background: "#2a2a3d",
      color: "#f1f1f1"
    };

    return (
      <div ref={triggerRef} style={triggerStyle} onClick={() => setOpen(!open)}>
        {currentName}
        {open && (
          <div ref={dropdownRef} style={{ ...dropdownStyle, top: "100%", left: 0, marginTop: "2px" }}>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko furnitorë..."
              style={inputStyle}
              onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
            />
            <ul style={listStyle}>
              {filteredSuppliers.map((s) => (
                <li 
                  key={s.id} 
                  onClick={() => handleSelect(s)} 
                  style={itemStyle}
                  onMouseOver={(e) => { e.target.style.background = "#38385a"; }}
                  onMouseOut={(e) => { e.target.style.background = "#2a2a3d"; }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {s.name}
                </li>
              ))}
              {filteredSuppliers.length === 0 && (
                <li style={{ ...itemStyle, color: "#999", cursor: "default" }}>Asnjë furnitor nuk u gjet</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Ngarko draftin ose rreshtin default
  useEffect(() => {
    const savedDraft = localStorage.getItem("invoiceDraft");
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setInvoiceNumber(draft.invoiceNumber || "");
      setSelectedSupplier(draft.selectedSupplier || "");
      setInvoiceDate(draft.invoiceDate || new Date().toISOString().slice(0, 10));
      setItems(draft.items || []);
      setTotalAmount(Number(draft.totalAmount) || 0);
    } else {
      setItems([{ productId: null, barcode: "", name: "", quantity: 1, unitPrice: 0, sellingPrice: 0 }]);
    }
  }, []);

  useEffect(() => {
    getAllSuppliers("").then(res => setSuppliers(res.content || res || [])).catch(console.error);
  }, []);

  // Totali
  useEffect(() => {
    const total = items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
    setTotalAmount(total);
  }, [items]);


  const addItem = () => {
    setItems([
      ...items,
      { productId: null, barcode: "", name: "", quantity: 1, unitPrice: 0, sellingPrice: 0 }
    ]);
  };

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

 const updateItem = (index, field, value) => {
  const newItems = [...items];

  if (field === "quantity" || field === "unitPrice" || field === "sellingPrice") {
    newItems[index][field] = Number(value);   // KTHEJE NE NUMËR
  } else {
    newItems[index][field] = value;
  }

  setItems(newItems);
};


  // Kërkim me emër
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1 && !/^\d+$/.test(searchQuery)) {
        try {
          const results = await getAllProducts(searchQuery);
          setSearchResults(results.content || results || []);
        } catch {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);


  const selectProductFromName = (product) => {
    if (searchIndex === null) return;
    const newItems = [...items];

    newItems[searchIndex] = {
      ...newItems[searchIndex],
      productId: product.id,
      name: product.name,
      barcode: product.barcode || "",
      unitPrice: product.purchasePrice || product.price || 0,
      sellingPrice: product.price || 0,  // SHTUAR
    };

    setItems(newItems);
    setSearchResults([]);
    setSearchQuery("");
    setSearchIndex(null);
  };


  const handleBarcodeKeyDown = async (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const barcode = e.target.value.trim();
      if (!barcode || !/^\d+$/.test(barcode)) return;

      try {
        const product = await getProductByBarcode(barcode);
        if (product) {
          const newItems = [...items];
          newItems[index] = {
            ...newItems[index],
            productId: product.id,
            barcode: product.barcode || barcode,
            name: product.name,
            unitPrice: product.purchasePrice || product.price || 0,
            sellingPrice: product.price || 0, // SHTUAR
          };
          setItems(newItems);
        } else {
          showNotification("error", `Produkti me barcode ${barcode} nuk u gjet!`);
          e.target.select();
        }
      } catch {
        showNotification("error", "Gabim gjatë kërkimit të barcode-it.");
      }
    }
  };


  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSupplier) {
      showNotification("error", "Zgjidhni furnitorin!");
      return;
    }
    if (items.length === 0 || items.some(i => !i.productId)) {
      showNotification("error", "Plotësoni të gjithë artikujt!");
      return;
    }

    const invoiceData = {
      invoiceNumber,
      invoiceDate: `${invoiceDate}T00:00:00`,
      supplierId: Number(selectedSupplier),
      userId: user.id,
      totalAmount,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        sellingPrice: i.sellingPrice, // DËRGOHET TE BACKEND
      })),
    };

    try {
      setLoading(true);
      await createPurchaseInvoice(invoiceData);

      showNotification("success", "Fatura u ruajt me sukses!");

      setInvoiceNumber("");
      setSelectedSupplier("");
      setInvoiceDate(new Date().toISOString().slice(0, 10));
      setItems([]);
      setTotalAmount(0);
      localStorage.removeItem("invoiceDraft");

      setTimeout(() => {
        setItems([{ productId: null, barcode: "", name: "", quantity: 1, unitPrice: 0, sellingPrice: 0 }]);
      }, 100);

    } catch (err) {
      showNotification("error", "Gabim gjatë ruajtjes së faturës.");
    } finally {
      setLoading(false);
    }
  };


  const handleCreateProductRedirect = () => {
    localStorage.setItem("invoiceDraft", JSON.stringify({
      invoiceNumber, selectedSupplier, invoiceDate, items, totalAmount
    }));
    navigate("/admin/create-product");
  };


  return (
    <div className="invoice-form-container">
      <h2>Krijo Faturë të Re të Blerjes</h2>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === "success" ? "✓" : "✕"} {notification.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <section className="invoice-info">
          <div>
            <label>Numri i Faturës</label>
            <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} required />
          </div>
          <div>
            <label>Data e Faturës</label>
            <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} required />
          </div>
          <div>
            <label>Furnitori</label>
            <SupplierCombobox valueId={selectedSupplier} onChange={(id) => setSelectedSupplier(id)} allSuppliers={suppliers} />
          </div>
        </section>

        <h3>Artikujt e Faturës</h3>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Emri i Produktit</th>
              <th>Sasia</th>
              <th>Çmimi Blerës</th>
              <th>Çmimi Shitës</th>
              <th>Totali</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    placeholder="Skanoni..."
                    value={item.barcode}
                    onChange={e => updateItem(index, "barcode", e.target.value)}
                    onKeyDown={e => handleBarcodeKeyDown(e, index)}
                    style={{ width: "130px", fontFamily: "monospace" }}
                  />
                </td>

                <td style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Kërko produkt..."
                    value={item.name}
                    onChange={e => {
                      updateItem(index, "name", e.target.value);
                      setSearchQuery(e.target.value);
                      setSearchIndex(index);
                    }}
                  />

                  {searchIndex === index && searchResults.length > 0 && (
                    <ul className="search-dropdown">
                      {searchResults.map(p => (
                        <li key={p.id} onClick={() => selectProductFromName(p)}>
                          <span>{p.name}</span>
                          <span className="price">{(p.purchasePrice || p.price || 0).toFixed(2)} €</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {searchIndex === index && searchResults.length === 0 && searchQuery.trim() && (
                    <div className="no-results">
                      <p>Nuk u gjet.</p>
                      <button type="button" className="create-product-btn" onClick={handleCreateProductRedirect}>
                        Krijo Produkt të Ri
                      </button>
                    </div>
                  )}
                </td>

                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={e => updateItem(index, "quantity", e.target.value)}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={e => updateItem(index, "unitPrice", e.target.value)}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={item.sellingPrice}
                    onChange={e => updateItem(index, "sellingPrice", e.target.value)}
                  />
                </td>

                <td className="total-col">
                  {(item.quantity * item.unitPrice).toFixed(2)} €
                </td>

                <td>
                  <button type="button" className="delete-btn" onClick={() => removeItem(index)}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="button" className="add-item-btn" onClick={addItem}>
          Shto Artikull
        </button>

        <div className="total-section">
          <strong>Totali i Faturës: {Number(totalAmount).toFixed(2)} €</strong>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Duke ruajtur..." : "Ruaj Faturën"}
        </button>
      </form>
    </div>
  );
};

export default CreatePurchaseInvoice;