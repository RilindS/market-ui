import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/axios";
import {
  getAllClients,
  getClientDebt1,
  getClientPayments
} from "../../services/request/clientService";
import "./Client.scss";


const ClientList = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDebt, setClientDebt] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [payments, setPayments] = useState([]);

  const [notification, setNotification] = useState(null);

  // Pay debt modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");

  // Manual debt modal
  const [showManualDebtModal, setShowManualDebtModal] = useState(false);
  const [manualDebtAmount, setManualDebtAmount] = useState("");

  /* ================== NOTIFICATIONS ================== */
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  /* ================== FETCH CLIENTS ================== */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchClients = async (query = "") => {
    try {
      const data = await getAllClients(query);
      setClients(data);
    } catch (error) {
      console.error("Gabim gjatë ngarkimit të klientëve:", error);
      showNotification("error", "Gabim gjatë ngarkimit të klientëve");
    }
  };

  /* ================== CLIENT ACTIONS ================== */
  // const handleDelete = async (id) => {
  //   if (window.confirm("A jeni të sigurt që doni të fshini këtë klient?")) {
  //     try {
  //       await deleteClient(id);
  //       fetchClients(search);
  //       showNotification("success", "Klienti u fshi me sukses!");
  //     } catch (error) {
  //       console.error("Gabim gjatë fshirjes:", error);
  //       showNotification("error", "Gabim gjatë fshirjes së klientit");
  //     }
  //   }
  // };

  const handleSelectClient = async (client) => {
    try {
      const debtData = await getClientDebt1(client.id);
      const paymentsData = await getClientPayments(client.id);

      setSelectedClient(client);
      setTotalUnpaid(debtData.totalUnpaid || 0);
      setTotalPaid(debtData.totalPaid || 0);
      setClientDebt(debtData.remainingDebt || 0);
      setPayments(paymentsData.payments || []);
    } catch (error) {
      console.error("Gabim gjatë ngarkimit të detajeve:", error);
      showNotification("error", "Gabim gjatë ngarkimit të detajeve të klientit");
    }
  };

  const clearSelection = () => {
    setSelectedClient(null);
    setClientDebt(0);
    setTotalUnpaid(0);
    setTotalPaid(0);
    setPayments([]);
    setShowPayModal(false);
    setShowManualDebtModal(false);
  };

  /* ================== PAY DEBT ================== */
  const handlePayDebt = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) return;

    try {
      await api.post(`/clients/${selectedClient.id}/pay`, {
        amount: parseFloat(payAmount),
        paymentMethod: payMethod,
      });
      showNotification("success", `Pagesa e ${payAmount} € u krye me sukses!`);
      setShowPayModal(false);
      setPayAmount("");
      setPayMethod("CASH");
      handleSelectClient(selectedClient);
    } catch (error) {
      console.error("Gabim gjatë pagesës:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Gabim gjatë pagesës!"
      );
    }
  };

  /* ================== MANUAL DEBT ================== */
  const handleSetManualDebt = async () => {
    if (!manualDebtAmount || parseFloat(manualDebtAmount) <= 0) return;

    try {
      await api.put(`/clients/${selectedClient.id}/set-debt`, {
        amount: parseFloat(manualDebtAmount),
      });
      showNotification(
        "success",
        `Borxhi u shtua manualisht me ${manualDebtAmount} €`
      );
      setShowManualDebtModal(false);
      setManualDebtAmount("");
      handleSelectClient(selectedClient);
    } catch (error) {
      console.error("Gabim gjatë vendosjes së borxhit:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Gabim gjatë vendosjes së borxhit!"
      );
    }
  };

  /* ================== EDIT CLIENT ================== */
 const handleEditClient = (client) => {
  navigate(`edit-client/${client.id}`);
};


  return (
    <div className="client-container">
      <h2>Clients List</h2>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === "success" ? "✓" : "✕"} {notification.message}
        </div>
      )}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  }}
>
  <h2 style={{ margin: 0 }}>Clients List</h2>

<button
  onClick={() => navigate("create-client")}
  style={{
    padding: "10px 15px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  + Shto Klient
</button>

</div>

      <input
        type="text"
        placeholder="Kërko klient (emër, telefon, email)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />

      <table>
        <thead>
          <tr>
            <th>Emri</th>
            <th>Adresa</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((cli) => (
            <tr key={cli.id}>
              <td>{cli.name}</td>
              <td>{cli.address}</td>
              <td>{cli.phone}</td>
              <td>{cli.email}</td>
              <td style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => handleSelectClient(cli)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#2196f3",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                  }}
                >
                  Shiko Detaje
                </button>

                
                <button
                  onClick={() => handleEditClient(cli)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#ffc107",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                  }}
                >
                  Edit
                </button>
                {/* <button
                  className="delete-btn"
                  onClick={() => handleDelete(cli.id)}
                >
                  Delete
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================== CLIENT DETAILS ================== */}
      {selectedClient && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "5px",
          }}
        >
          <h3>Detajet për klientin {selectedClient.name}</h3>
          <div style={{ marginBottom: "10px" }}>
            <strong>Borxhi Total i Papaguar:</strong>{" "}
            <span style={{ color: "orange" }}>{totalUnpaid.toFixed(2)} €</span>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Total i Paguar:</strong> {totalPaid.toFixed(2)} €
          </div>
          <div
            style={{
              marginBottom: "20px",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            <strong>Borxhi i Mbetur:</strong>{" "}
            <span style={{ color: "red", fontSize: "22px" }}>
              {clientDebt.toFixed(2)} €
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={() => setShowPayModal(true)}
              disabled={clientDebt <= 0}
              style={{
                padding: "10px 15px",
                backgroundColor: clientDebt > 0 ? "#4caf50" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: clientDebt > 0 ? "pointer" : "not-allowed",
              }}
            >
              Paguaj Borgj
            </button>
            <button
              onClick={() => setShowManualDebtModal(true)}
              style={{
                padding: "10px 15px",
                backgroundColor: "#ff9800",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Vendos Borgj Manualisht
            </button>
            <button
              onClick={clearSelection}
              style={{
                padding: "10px 15px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Mbyll Detajet
            </button>
          </div>

          {payments.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f2f2f2" }}>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                    Data
                  </th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                    Shuma (€)
                  </th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                    Metoda
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {new Date(p.paymentDate).toLocaleDateString("en-GB")}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {p.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {p.method || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "#999" }}>Nuk ka pagesa ende.</p>
          )}
        </div>
      )}

      {/* ================== PAY DEBT MODAL ================== */}
      {showPayModal && selectedClient && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "300px",
            }}
          >
            <h4>Paguaj për {selectedClient.name}</h4>
            <p style={{ color: "red", marginBottom: "10px" }}>
              Borxhi i mbetur: {clientDebt.toFixed(2)} €
            </p>
            <input
              type="number"
              placeholder="Shuma (€)"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              step="0.01"
              min="0.01"
              max={clientDebt}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "20px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Kartë</option>
              <option value="TRANSFER">Transfertë</option>
            </select>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowPayModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Anulo
              </button>
              <button
                onClick={handlePayDebt}
                disabled={!payAmount || parseFloat(payAmount) <= 0}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor:
                    !payAmount || parseFloat(payAmount) <= 0 ? "#ccc" : "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Paguaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================== MANUAL DEBT MODAL ================== */}
      {showManualDebtModal && selectedClient && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "300px",
            }}
          >
            <h4>Vendos Borgj Manualisht</h4>
            <input
              type="number"
              placeholder="Shuma (€)"
              value={manualDebtAmount}
              onChange={(e) => setManualDebtAmount(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "20px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowManualDebtModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Anulo
              </button>
              <button
                onClick={handleSetManualDebt}
                disabled={
                  !manualDebtAmount || parseFloat(manualDebtAmount) <= 0
                }
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor:
                    !manualDebtAmount || parseFloat(manualDebtAmount) <= 0
                      ? "#ccc"
                      : "#ff9800",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Ruaj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
