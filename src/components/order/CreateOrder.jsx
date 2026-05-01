// src/components/order/CreateOrder.jsx

import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../services/auth/AuthContext";
import { getAllClients } from "../../services/request/clientService"; // Shto këtë import (supozo se e ke krijuar clientService me getAllClients())
import { createOrder } from "../../services/request/orderService";
import {
  getAllProducts,
  getProductByBarcode,
} from "../../services/request/productService";
import "./CreateOrder.scss";


const SOUND_SUCCESS =
  "https://assets.mixkit.co/sfx/preview/mixkit-confirmation-tone-2358.mp3";
const SOUND_ERROR =
  "https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-783.mp3";

const CreateOrder = () => {
  const { user } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [cashReceived, setCashReceived] = useState("");
  const [changeToReturn, setChangeToReturn] = useState(0);
  const [notification, setNotification] = useState(null);

  const [manualSearch, setManualSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Shtesa për modal-in e borgj
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const barcodeInputRef = useRef(null);

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isCreatingCreditOrder, setIsCreatingCreditOrder] = useState(false);

  // Fokus fillestar te input-i barcode
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Pas vendosjes së item-eve, pastro input-in
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.value = "";
      // barcodeInputRef.current.focus();
    }
    setManualSearch("");
    setSearchResults([]);
  }, [items]);

  const roundPrice = (value) => {
  // P.sh. 2.88 -> 2.9, 2.87 -> 2.85
  const rounded = Math.round(value * 20) / 20; // 1/0.05 = 20
  return rounded;
};
  // Llogarit totali me decimal
  useEffect(() => {
  const sum = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  setTotal(roundPrice(sum).toFixed(2));
}, [items]);


  // Llogarit kusurin
  useEffect(() => {
    if (cashReceived && parseFloat(cashReceived) >= parseFloat(total)) {
      setChangeToReturn(
        (parseFloat(cashReceived) - parseFloat(total)).toFixed(3)
      );
    } else {
      setChangeToReturn(0);
    }
  }, [total, cashReceived]);

  const playSound = (url) => {
    new Audio(url).play().catch(() => {});
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Shto produkt ose rrit sasinë
  const addProduct = (product) => {
  const existing = items.find((i) => i.productId === product.id);

  if (existing) {
    updateQuantity(existing.id, Number(existing.quantity) + 1);
  } else {
    const newItem = {
      id: Date.now() + Math.random(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    };
    setItems((prev) => [...prev, newItem]);
    // Fokus vetëm kur shtohet produkt i ri
    setTimeout(() => barcodeInputRef.current?.focus(), 0);
  }

  playSound(SOUND_SUCCESS);
};

const updateQuantity = (id, inputValue) => {
  const inputStr = inputValue.toString();

  if (inputStr === "") {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: "" } : i))
    );
    return;
  }

  
  const sanitized = inputStr.replace(",", ".");
  const q = parseFloat(sanitized);

  if (isNaN(q)) return;

  setItems((prev) =>
    prev.map((i) => (i.id === id ? { ...i, quantity: q } : i))
  );
};

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Barcode Enter
  const handleBarcodeEnter = async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const barcode = e.target.value.trim();

    if (!barcode) return;

    if (/^\d+$/.test(barcode) && barcode.length >= 3) {
      try {
        const product = await getProductByBarcode(barcode);

        if (product) {
          addProduct(product);
        } else {
          playSound(SOUND_ERROR);
          showNotification(
            "error",
            `Produkti me barcode ${barcode} nuk u gjet!`
          );
          // Pastro inputin
          barcodeInputRef.current.value = "";
          barcodeInputRef.current.focus();
        }
      } catch (err) {
        playSound(SOUND_ERROR);
        showNotification("error", "Gabim në server!");
        // Pastro inputin edhe këtu
        barcodeInputRef.current.value = "";
        barcodeInputRef.current.focus();
      }
    }
  }
};


  // Kërkim manual
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (manualSearch.trim().length > 1 && !/^\d+$/.test(manualSearch)) {
        try {
          const results = await getAllProducts(manualSearch);
          setSearchResults(results.content || results || []);
        } catch {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [manualSearch]);

  // Logjika e përbashkët për suksesin e porosisë (përdoret nga të dy butonat)
  const handleOrderSuccess = () => {
    playSound(SOUND_SUCCESS);
    showNotification(
      "success",
      changeToReturn > 0
        ? `Porosia u krye! Kusuri: ${changeToReturn} €`
        : "Porosia u krye me sukses!"
    );
    setItems([]);
    setCashReceived("");
    setChangeToReturn(0);
    barcodeInputRef.current?.focus();
    setShowModal(false); // Mbyll modal-in nëse është i hapur
    setSelectedClient(null);
    setClientSearch("");
  };

  // Ruaj porosinë si pagesë normale (isCredit: false, pa clientId)
    const handleCreateOrder = async () => {
    if (items.length === 0 || isCreatingOrder) return;

    setIsCreatingOrder(true);

    try {
      await createOrder({
        userId: Number(user.id),
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
      });

      handleOrderSuccess();
    } catch {
      playSound(SOUND_ERROR);
      showNotification("error", "Gabim gjatë ruajtjes së porosisë");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Hap modal-in për borgj dhe ngarko klientët
  const handleSaveAsCredit = async () => {
    if (items.length === 0) {
      showNotification("error", "Shto të paktën një produkt!");
      return;
    }

    try {
      const allClients = await getAllClients(); // Merr të gjithë klientët
      setClients(allClients);
      setFilteredClients(allClients);
      setShowModal(true);
    } catch (err) {
      showNotification("error", "Gabim gjatë ngarkimit të klientëve");
    }
  };

  // Filtrimi i klientëve bazuar në kërkim
  useEffect(() => {
    if (clientSearch.trim() === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter((client) =>
        client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        client.phone.toLowerCase().includes(clientSearch.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [clientSearch, clients]);

  // Ruaj porosinë si borgj (me clientId dhe isCredit: true)
    const handleCreateCreditOrder = async () => {
    if (!selectedClient || isCreatingCreditOrder) return;

    setIsCreatingCreditOrder(true);

    try {
      await createOrder({
        userId: Number(user.id),
        clientId: selectedClient.id,
        isCredit: true,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
      });

      handleOrderSuccess();
    } catch {
      playSound(SOUND_ERROR);
      showNotification("error", "Gabim gjatë ruajtjes së porosisë në borgj");
    } finally {
      setIsCreatingCreditOrder(false);
    }
  };

  // Zgjidh klient
  const selectClient = (client) => {
    setSelectedClient(client);
    setClientSearch(client.name); // Plotëso input-in me emrin
  };

  // Mbyll modal-in
  const closeModal = () => {
    setShowModal(false);
    setSelectedClient(null);
    setClientSearch("");
    setFilteredClients([]);
  };

  return (
    <div className="create-order">
      <h2>Krijo Porosi</h2>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === "success" ? "✓" : "✕"} {notification.message}
        </div>
      )}

      <table className="items-table">
        <thead>
          <tr>
            <th>Produkti</th>
            <th>Çmimi</th>
            <th>Sasia</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.name}</strong></td>
          <td>{item.price != null ? item.price.toFixed(3) : "0.000"} €</td>

              <td>
           <input
              type="number"
              min="0.001"
              step="0.001"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, e.target.value)}
              style={{ width: "80px" }}
            />

              </td>

              <td>
                <strong>
                  {roundPrice(item.price * item.quantity).toFixed(2)} €
                </strong>
              </td>


              <td>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}

          <tr>
            <td colSpan="5" style={{ padding: "20px 0" }}>
              <input
                ref={barcodeInputRef}
                type="text"
                className="barcode-input"
                placeholder="Skanoni barcode ose shkruani emrin..."
                onKeyDown={handleBarcodeEnter}
                onChange={(e) => setManualSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "18px",
                  fontSize: "20px",
                  textAlign: "center",
                  border: "3px dashed #aaa",
                  borderRadius: "12px",
                  background: "#f8f9fa",
                }}
              />

              {searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="dropdown-item"
                      onClick={() => {
                        addProduct(product);
                        setManualSearch("");
                        setSearchResults([]);
                      }}
                    >
                      <span>{product.name}</span>
                <strong>
                  {product.price != null ? product.price.toFixed(3) : "0.000"} €
                </strong>
                    </div>
                  ))}
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="payment-section">
        <div className="total-display">
          <span>Totali:</span>
          <span className="amount">{total} €</span>
        </div>

        <label>Para të marra:</label>
        <input
          type="number"
          step="0.01"
          value={cashReceived}
          onChange={(e) => setCashReceived(e.target.value)}
          placeholder="0.00"
          className="cash-input"
        />

        {cashReceived && (
          <div
            className={`change-display ${
              parseFloat(cashReceived) < parseFloat(total)
                ? "insufficient"
                : "sufficient"
            }`}
          >
            {parseFloat(cashReceived) < parseFloat(total)
              ? `Mungon ${(total - cashReceived).toFixed(3)} €`
              : `Kusuri: ${changeToReturn} €`}
          </div>
        )}
      </div>

      <div
  className="order-buttons"
  style={{
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginTop: "20px",
  }}
>
  <button
    onClick={handleCreateOrder}
    disabled={items.length === 0 || isCreatingOrder}
    className={`complete-order-btn ${isCreatingOrder ? "loading" : ""}`}
    style={{ flex: 1, maxWidth: "200px" }}
  >
    {isCreatingOrder ? (
      <>
        <span className="spinner"></span> Duke u ruajtur...
      </>
    ) : (
      "Përfundo Porosinë"
    )}
  </button>

  <button
    onClick={handleSaveAsCredit}
    disabled={items.length === 0}
    className="credit-order-btn"
    style={{
      flex: 1,
      maxWidth: "200px",
      marginTop: "50px",
      backgroundColor: "#ff9800",
      color: "white",
    }}
  >
    Ruaj si Borgj
  </button>
</div>

      {showModal && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="modal-content" style={{ background: "white", padding: "30px", borderRadius: "10px", width: "400px", maxHeight: "80vh", overflowY: "auto" }}>
            <h3>Zgjidh Klient për Borgj</h3>
            <input
              type="text"
              placeholder="Kërko klient (emër ose telefon)..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
            />
            <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", borderRadius: "5px" }}>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className={`client-item ${selectedClient?.id === client.id ? "selected" : ""}`}
                    onClick={() => selectClient(client)}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      backgroundColor: selectedClient?.id === client.id ? "#e3f2fd" : "transparent"
                    }}
                  >
                    <strong>{client.name}</strong> <br />
                    <small>{client.phone} {client.email ? `| ${client.email}` : ""}</small>
                  </div>
                ))
              ) : (
                <p style={{ padding: "10px", textAlign: "center", color: "#999" }}>
                  {clientSearch ? "Asnjë klient nuk u gjet." : "Nuk ka klientë. Krijo një të ri."}
                </p>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", gap: "10px" }}>
              <button onClick={closeModal} style={{ flex: 1, padding: "10px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "5px" }}>
                Anulo
              </button>
              <button
  onClick={handleCreateCreditOrder}
  disabled={!selectedClient || isCreatingCreditOrder}
  className={isCreatingCreditOrder ? "loading" : ""}
  style={{
    flex: 1,
    padding: "10px",
    backgroundColor: selectedClient ? "#4caf50" : "#ccc",
    color: "white",
    border: "none",
    borderRadius: "5px",
  }}
>
  {isCreatingCreditOrder ? (
    <>
      <span className="spinner"></span> Duke u ruajtur...
    </>
  ) : (
    "Konfirmo Borgj"
  )}
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;