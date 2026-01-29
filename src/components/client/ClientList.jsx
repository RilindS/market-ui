import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/axios";
import {
  getAllClients,
  getClientDebt1,
  getClientPayments,
  getClientUnpaidOrders,
} from "../../services/request/clientService";
import styles from "./Client.module.scss";

const ClientList = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDebt, setClientDebt] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [payments, setPayments] = useState([]);

  const [showPayments, setShowPayments] = useState(false);
  const [showUnpaidOrders, setShowUnpaidOrders] = useState(false);
  const [unpaidOrdersData, setUnpaidOrdersData] = useState(null);
  const [unpaidPage, setUnpaidPage] = useState(0);
  const [unpaidLoading, setUnpaidLoading] = useState(false);

  const [notification, setNotification] = useState(null);

  // Pay debt modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");

  // Manual debt modal
  const [showManualDebtModal, setShowManualDebtModal] = useState(false);
  const [manualDebtAmount, setManualDebtAmount] = useState("");

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

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

  const handleSelectClient = async (client) => {
    try {
      const debtData = await getClientDebt1(client.id);
      const paymentsData = await getClientPayments(client.id);

      setSelectedClient(client);
      setTotalUnpaid(debtData.totalUnpaid || 0);
      setTotalPaid(debtData.totalPaid || 0);
      setClientDebt(debtData.remainingDebt || 0);
      setPayments(paymentsData.payments || []);

      // Reset sections
      setShowPayments(false);
      setShowUnpaidOrders(false);
      setUnpaidOrdersData(null);
      setUnpaidPage(0);
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
    setShowPayments(false);
    setShowUnpaidOrders(false);
    setUnpaidOrdersData(null);
    setUnpaidPage(0);
  };

  const loadUnpaidOrders = async (page = 0) => {
    if (!selectedClient?.id) return;

    setUnpaidLoading(true);
    try {
      const data = await getClientUnpaidOrders(selectedClient.id, page);
      setUnpaidOrdersData(data);
      setUnpaidPage(page);
    } catch (error) {
      showNotification("error", "Gabim gjatë ngarkimit të porosive të papaguara");
    } finally {
      setUnpaidLoading(false);
    }
  };

  const handleShowUnpaidOrders = () => {
    setShowUnpaidOrders(true);
    if (!unpaidOrdersData) {
      loadUnpaidOrders(0);
    }
  };

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

  const handleEditClient = (client) => {
    navigate(`edit-client/${client.id}`);
  };

  return (
    <div className={styles.clientContainer}>
      <div className={styles.header}>
        <h2>Clients List</h2>
        <button
          onClick={() => navigate("create-client")}
          className={styles.addButton}
        >
          + Shto Klient
        </button>
      </div>

      <input
        type="text"
        placeholder="Kërko klient (emër, telefon, email)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchInput}
      />

      <table className={styles.clientTable}>
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
              <td>
                <div className={styles.actionCell}>
                  <button
                    onClick={() => handleSelectClient(cli)}
                    className={styles.detailBtn}
                  >
                    Shiko Detaje
                  </button>
                  <button
                    onClick={() => handleEditClient(cli)}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedClient && (
        <div className={styles.detailsSection}>
          <h3>Detajet për klientin {selectedClient.name}</h3>

          <div className={styles.summary}>
             <div className={styles.remainingDebt}>
              <strong>Borxhi i Mbetur:</strong>{" "}
              <span>{clientDebt.toFixed(2)} €</span>
            </div>
            {/* <div>
              <strong>Borxhi Total i Papaguar:</strong>{" "}
              <span className={styles.unpaid}>{totalUnpaid.toFixed(2)} €</span>
            </div> */}
            <div>
              <strong>Total i Paguar:</strong> {totalPaid.toFixed(2)} €
            </div>
           
          </div>

          <div className={styles.actionButtons}>
            <button
              onClick={() => setShowPayModal(true)}
              disabled={clientDebt <= 0}
              className={`${styles.actionBtn} ${styles.payBtn} ${
                clientDebt <= 0 ? styles.disabled : ""
              }`}
            >
              Paguaj Borxh
            </button>

            <button
              onClick={() => setShowManualDebtModal(true)}
              className={`${styles.actionBtn} ${styles.manualBtn}`}
            >
              Vendos Borxh Manualisht
            </button>

            <button
              onClick={() => setShowPayments((prev) => !prev)}
              className={`${styles.actionBtn} ${styles.paymentsBtn}`}
            >
              {showPayments ? "Fshih pagesat" : "Shiko pagesat"}
            </button>

            <button
              onClick={handleShowUnpaidOrders}
              className={`${styles.actionBtn} ${styles.unpaidOrdersBtn}`}
            >
              Shiko porositë e papaguara
            </button>

            <button
              onClick={clearSelection}
              className={`${styles.actionBtn} ${styles.closeBtn}`}
            >
              Mbyll Detajet
            </button>
          </div>

          {showPayments && (
            <div className={styles.paymentsSection}>
              <h4>Historiku i pagesave</h4>
              {payments.length > 0 ? (
                <table className={styles.paymentsTable}>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Shuma (€)</th>
                      <th>Metoda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>{new Date(p.paymentDate).toLocaleDateString("sq-AL")}</td>
                        <td>{p.amount?.toFixed(2) || "—"}</td>
                        <td>{p.method || p.paymentMethod || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.noData}>Nuk ka pagesa të regjistruara ende.</p>
              )}
            </div>
          )}

          {showUnpaidOrders && (
            <div className={styles.unpaidOrdersSection}>
              <h4>Porositë e papaguara</h4>

              {unpaidLoading ? (
                <p className={styles.loading}>Po ngarkohen...</p>
              ) : !unpaidOrdersData || !unpaidOrdersData.unpaidOrders?.length ? (
                <p className={styles.noData}>Nuk ka porosi të papaguara.</p>
              ) : (
                <>
                  <div className={styles.currentDebt}>
                    Borxhi aktual: {unpaidOrdersData.currentDebt?.toFixed(2) || "—"} €
                  </div>

                  {unpaidOrdersData.unpaidOrders.map((order) => (
                    <div key={order.orderId} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <span>Porosi #{order.orderId}</span>
                        <span>
                          {order.orderDate
                            ? format(new Date(order.orderDate), "dd.MM.yyyy HH:mm")
                            : "—"}
                        </span>
                      </div>

                      <div className={styles.orderTotal}>
                        Totali: {order.totalAmount?.toFixed(2) || "—"} €
                      </div>

                      <table className={styles.orderItemsTable}>
                        <thead>
                          <tr>
                            <th>Produkti</th>
                            <th className={styles.right}>Sasia</th>
                            <th className={styles.right}>Çmimi njësor</th>
                            <th className={styles.right}>Totali</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items?.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.productName}</td>
                              <td className={styles.right}>{item.quantity}</td>
                              <td className={styles.right}>
                                {item.unitPrice?.toFixed(2) || item.price?.toFixed(2)} €
                              </td>
                              <td className={styles.right}>
                                {item.totalPrice?.toFixed(2) || "—"} €
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}

                  {unpaidOrdersData.totalPages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        onClick={() => loadUnpaidOrders(unpaidPage - 1)}
                        disabled={unpaidPage === 0 || unpaidLoading}
                      >
                        ← Back
                      </button>
                      <span>
                        Faqja {unpaidPage + 1} / {unpaidOrdersData.totalPages}
                      </span>
                      <button
                        onClick={() => loadUnpaidOrders(unpaidPage + 1)}
                        disabled={!unpaidOrdersData.hasNext || unpaidLoading}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pay modal */}
      {showPayModal && selectedClient && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h4>Paguaj për {selectedClient.name}</h4>
            <p className={styles.modalWarning}>
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
              className={styles.modalInput}
            />

            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className={styles.modalSelect}
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Kartë</option>
              <option value="TRANSFER">Transfertë</option>
            </select>

            <div className={styles.modalButtons}>
              <button
                onClick={() => setShowPayModal(false)}
                className={styles.modalCancel}
              >
                Anulo
              </button>
              <button
                onClick={handlePayDebt}
                disabled={!payAmount || parseFloat(payAmount) <= 0}
                className={styles.modalConfirm}
              >
                Paguaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual debt modal */}
      {showManualDebtModal && selectedClient && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h4>Vendos Borxh Manualisht</h4>

            <input
              type="number"
              placeholder="Shuma (€)"
              value={manualDebtAmount}
              onChange={(e) => setManualDebtAmount(e.target.value)}
              step="0.01"
              min="0.01"
              className={styles.modalInput}
            />

            <div className={styles.modalButtons}>
              <button
                onClick={() => setShowManualDebtModal(false)}
                className={styles.modalCancel}
              >
                Anulo
              </button>
              <button
                onClick={handleSetManualDebt}
                disabled={!manualDebtAmount || parseFloat(manualDebtAmount) <= 0}
                className={styles.modalConfirm}
              >
                Ruaj
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ClientList;