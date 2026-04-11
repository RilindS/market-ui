import { format } from "date-fns";
import { useEffect, useState } from "react";
import { getDebtOrdersByDate, getPaymentsByDate } from "../../services/request/orderService";
import styles from "../client/Client.module.scss";

const DebtOrdersByDate = () => {
  const [date, setDate] = useState("");

  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(false);

  const [totalOrders, setTotalOrders] = useState(0);
  const [totalDebtTaken, setTotalDebtTaken] = useState(0);

  const [totalPayments, setTotalPayments] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    fetchData(today);
  }, []);

  const fetchData = async (selectedDate) => {
    setLoading(true);

    try {
      const [ordersData, paymentsData] = await Promise.all([
        getDebtOrdersByDate(selectedDate),
        getPaymentsByDate(selectedDate),
      ]);

      // Orders
      setOrders(ordersData);

      const totalOrdersCount = ordersData.length;
      const totalDebt = ordersData.reduce(
        (sum, order) => sum + (order.orderAmount || 0),
        0
      );

      setTotalOrders(totalOrdersCount);
      setTotalDebtTaken(totalDebt);

      // Payments
      setPayments(paymentsData);

      const paymentsTotal = paymentsData.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );

      setTotalPayments(paymentsTotal);
    } catch (error) {
      console.error("Gabim gjatë marrjes së të dhënave:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!date) return;
    fetchData(date);
  };

  return (
    <div className={styles.clientContainer}>
      <div className={styles.header}>
        <h2>Raporti ditor i borxheve dhe pagesave</h2>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.searchInput}
        />

        <button onClick={handleSearch} className={styles.addButton}>
          Kërko
        </button>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          marginBottom: "25px",
          fontWeight: "bold",
        }}
      >
        <div>Total Porosi me Borxh: {totalOrders}</div>
        <div>Total Borxh i Marrë: {totalDebtTaken.toFixed(2)} €</div>
        <div>Total Pagesa: {totalPayments.toFixed(2)} €</div>
      </div>

      {loading ? (
        <p>Po ngarkohen të dhënat...</p>
      ) : (
        <>
          {/* ORDERS TABLE */}
          <h3 style={{ marginBottom: "10px" }}>Porositë me borxh</h3>

          <table className={styles.clientTable}>
            <thead>
              <tr>
                <th>Klienti</th>
                <th>Telefon</th>
                <th>Shuma e Porosisë (€)</th>
                <th>Borxhi Total (€)</th>
                <th>Data e Porosisë</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    Nuk ka porosi me borxh për këtë datë
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.clientName}</td>
                    <td>{order.phone}</td>
                    <td>{order.orderAmount?.toFixed(2)} €</td>
                    <td>{order.totalDebt?.toFixed(2)} €</td>
                    <td>
                      {order.orderDate
                        ? format(new Date(order.orderDate), "dd.MM.yyyy HH:mm")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAYMENTS TABLE */}

          <h3 style={{ marginTop: "40px", marginBottom: "10px" }}>
            Pagesat e bëra
          </h3>

          <table className={styles.clientTable}>
            <thead>
              <tr>
                <th>Klienti</th>
                <th>Telefon</th>
                <th>Shuma (€)</th>
                <th>Metoda</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    Nuk ka pagesa për këtë datë
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => (
                  <tr key={index}>
                    <td>{payment.clientName}</td>
                    <td>{payment.phone}</td>
                    <td>{payment.amount?.toFixed(2)} €</td>
                    <td>{payment.paymentMethod}</td>
                    <td>
                      {payment.paymentDate
                        ? format(
                            new Date(payment.paymentDate),
                            "dd.MM.yyyy HH:mm"
                          )
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default DebtOrdersByDate;