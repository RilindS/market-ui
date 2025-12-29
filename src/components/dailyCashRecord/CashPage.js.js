// src/components/CashPage.js
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../services/auth/AuthContext";
import {
  closeDay,
  getOpeningBalance,
  getTotalDebtPaymentsToday,
  getTotalPurchases,
  getTotalSales,
} from "../../services/request/dailyCashRecordService";

const CashPage = () => {
  const { user, loading: authLoading } = useContext(AuthContext);

  const [opening, setOpening] = useState(0);
  const [sales, setSales] = useState(0);
  const [purchases, setPurchases] = useState(0);
  const [debtPayments, setDebtPayments] = useState(0);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState({ text: "", type: "" });

  // MODAL STATES
  const [showModal, setShowModal] = useState(false);
  const [closingAmount, setClosingAmount] = useState("");
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setMessage({ text: "Duhet të kyçesh për të parë raportin!", type: "error" });
      return;
    }
    fetchData();
  }, [authLoading, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        openingRes,
        salesRes,
        purchasesRes,
        debtPaymentsRes,
      ] = await Promise.all([
        getOpeningBalance(),
        getTotalSales(),
        getTotalPurchases(),
        getTotalDebtPaymentsToday(),
      ]);

      setOpening(openingRes);
      setSales(salesRes);
      setPurchases(purchasesRes);
      setDebtPayments(debtPaymentsRes);
    } catch (error) {
      console.error(error);
      setMessage({ text: "Gabim gjatë marrjes së të dhënave!", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     CLOSE DAY (OPEN MODAL)
  ============================= */
  const handleOpenModal = () => {
    if (!user) {
      setMessage({ text: "Duhet të kyçesh për të mbyllur ditën!", type: "error" });
      return;
    }
    setClosingAmount("");
    setModalError("");
    setShowModal(true);
  };

  /* =============================
     CONFIRM CLOSE DAY
  ============================= */
  const handleConfirmCloseDay = async () => {
    if (!closingAmount || isNaN(closingAmount)) {
      setModalError("Ju lutem vendosni një shumë valide!");
      return;
    }

    try {
      const response = await closeDay(closingAmount, user.id);
      setMessage({
        text: `Dita u mbyll me sukses! Gjendja finale: ${response.closingBalance.toFixed(
          2
        )} €`,
        type: "success",
      });
      setShowModal(false);
      fetchData();
    } catch (error) {
      setModalError(
        error.response?.data?.message || "Gabim gjatë mbylljes së ditës!(Dita eshte mbyllur)"
      );
    }
  };
  const currentCash =
  opening +
  sales -
  purchases +
  debtPayments;


  if (authLoading || loading) return <div>Loading...</div>;
  if (!user) return <div>Ju lutemi, kyçuni në sistem.</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Raporti i Kacës – User: {user.firstName || user.id}</h2>

      {/* MESSAGE */}
      {message.text && (
        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            borderRadius: "4px",
            background:
              message.type === "success" ? "#4caf50" : "#f44336",
            color: "white",
          }}
        >
          {message.text}
        </div>
      )}

      {/* TABLE */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}
      >
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              Elementi
            </th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              Shuma (€)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: "10px" }}>
              Gjendja Fillestare
            </td>
            <td style={{ border: "1px solid #ddd", padding: "10px" }}>
              {opening.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: "10px" }}>
              Total Shitje
            </td>
            <td style={{ border: "1px solid #ddd", padding: "10px" }}>
              {sales.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: "10px" }}>
              Total Blerje
            </td>
            <td style={{ border: "1px solid #ddd", padding: "10px" }}>
              {purchases.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: "10px" }}>
              Pagesat e Borgjeve Sot
            </td>
            <td style={{ border: "1px solid #ddd", padding: "10px" }}>
              {debtPayments.toFixed(2)}
            </td>
          </tr>
          <tr style={{ background: "#e8f5e9", fontWeight: "bold" }}>
  <td style={{ border: "1px solid #ddd", padding: "10px" }}>
    Gjendja Tanishme e Kacës
  </td>
  <td style={{ border: "1px solid #ddd", padding: "10px", color: "green" }}>
    {currentCash.toFixed(2)}
  </td>
</tr>

        </tbody>
      </table>

      <button
        onClick={handleOpenModal}
        style={{
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Perfundo Diten
      </button>

      <p style={{ marginTop: "10px", fontSize: "14px" }}>
        Pas mbylljes, gjendja finale bëhet fillestare për ditën e nesërme.
      </p>

      {/* =============================
          MODAL
      ============================= */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "6px",
              width: "350px",
            }}
          >
            <h3>Mbyllja e Ditës</h3>

            <label>Gjendja finale e kasës (€)</label>
            <input
              type="number"
              value={closingAmount}
              onChange={(e) => setClosingAmount(e.target.value)}
              style={{ width: "100%", padding: "6px", marginTop: "5px" }}
            />

            {modalError && (
              <p style={{ color: "red", marginTop: "8px" }}>{modalError}</p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              <button onClick={() => setShowModal(false)}>Anulo</button>
              <button
                onClick={handleConfirmCloseDay}
                style={{ background: "#4caf50", color: "white" }}
              >
                Konfirmo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashPage;