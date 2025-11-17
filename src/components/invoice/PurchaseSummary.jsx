import { useEffect, useState } from "react";
import { getPurchasesSummary } from "../../services/request/invoiceService";
import "./PurchaseSummary.scss"; // ✅ Import SCSS

const PurchaseSummary = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async (date) => {
    setLoading(true);
    try {
      const data = await getPurchasesSummary(date);
      setSummary(data);
    } catch (error) {
      alert("Gabim gjatë marrjes së përmbledhjes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate]);

  return (
    <div className="purchase-summary-container">
      <h2>📊 Përmbledhje e Blerjeve</h2>

      <div className="date-picker">
        <label>Zgjidh datën:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="loading-text">Duke ngarkuar të dhënat...</p>
      ) : summary ? (
        <>
          <div className="total-summary">
            Totali i ditës {summary.date}:{" "}
            <strong>{summary.totalAmountToday.toFixed(2)} €</strong>
          </div>

          {summary.purchases.length === 0 ? (
            <p className="no-purchases">Nuk ka blerje për këtë datë.</p>
          ) : (
            <div className="purchases-list">
              {summary.purchases.map((inv, idx) => (
                <div key={idx} className="purchase-card">
                  <div className="purchase-header">
                    <span><strong>Fatura:</strong> {inv.invoiceNumber}</span>
                     <span><strong>Supplier:</strong> {inv.supplierName}</span>
                    <span><strong>User:</strong> {inv.userFullName}</span>
                    <span><strong>Total:</strong> {inv.invoiceTotal.toFixed(2)} €</span>
                  </div>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Produkt</th>
                        <th>Sasia</th>
                        <th>Totali</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inv.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{item.totalPrice.toFixed(2)} €</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="no-purchases">Zgjidh një datë për të parë përmbledhjen.</p>
      )}
    </div>
  );
};

export default PurchaseSummary;
