// src/pages/OrderDetailsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderDetails } from "../../services/request/orderService";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderDetails(id)
      .then(setOrder)
      .catch(() => alert("Porosia nuk u gjet!"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Duke ngarkuar porosinë...</div>;
  if (!order) return null;

  return (
    <>
      {/* CSS për Print - Vetëm për Faturën */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #invoice-print, #invoice-print * { visibility: visible; }
            #invoice-print { position: absolute; left: 0; top: 0; width: 100%; }
            #header-controls { display: none !important; }
            .invoice-header { page-break-inside: avoid; }
            .invoice-table { page-break-inside: avoid; width: 100%; border-collapse: collapse; }
            .invoice-table th, .invoice-table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .invoice-table th { background-color: #f0f0f0; font-weight: bold; }
            .signature-section { margin-top: 40px; display: flex; justify-content: space-between; font-size: 14px; }
            .signature-line { border-bottom: 1px solid #000; width: 200px; padding-top: 50px; text-align: center; }
            @page { margin: 1in; size: A4; }
          }
          /* Stilizim për ekran (opsional, për të mbajtur profesionalitetin) */
          .invoice-container { font-family: 'Arial', sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .invoice-header { text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 10px; margin-bottom: 20px; }
          .invoice-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
          .invoice-meta div { font-size: 14px; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .invoice-table th, .invoice-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .invoice-table th { background: #f8f9fa; font-weight: bold; color: #2c3e50; }
          .total-row { background: #e8f5e8; font-size: 18px; }
          .total-row td { font-weight: bold; color: #27ae60; }
          .signature-section { margin-top: 40px; display: flex; justify-content: space-between; gap: 20px; font-size: 14px; border-top: 2px dashed #ccc; padding-top: 20px; }
          .signature-item { flex: 1; text-align: center; }
          .signature-line { border-bottom: 1px solid #000; width: 100%; padding-top: 60px; margin-top: 10px; }
          .print-btn { background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
          .back-btn { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-right: auto; }
          #header-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        `}
      </style>

      {/* Kontrollet e Header-it (fshehur në print) */}
      <div id="header-controls">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Kthehu
        </button>
        <h1 style={{ margin: 0, fontSize: "24px", color: "#2c3e50" }}>Porosia #{order.orderId}</h1>
        <button onClick={() => window.print()} className="print-btn">
          🖨️ Print Faturën
        </button>
      </div>

      {/* Përmbajtja e Faturës (vetëm kjo printohet) */}
      <div id="invoice-print" className="invoice-container">
        {/* Header i Faturës */}
        <div className="invoice-header">
          <h2 style={{ margin: 0, color: "#2c3e50", fontSize: "28px" }}>FATURË SHITJESH</h2>
          <p style={{ margin: "5px 0 0 0", color: "#7f8c8d", fontSize: "14px" }}>Numri i Faturës: #{order.orderId} | Data: {new Date(order.orderDate).toLocaleDateString("sq-AL")}</p>
          {/* Placeholder për Logo - Zëvendëso me img nëse ke */}
          <div style={{ marginTop: "10px", fontSize: "12px", color: "#95a5a6" }}>Market Simnica | Adresa: Rr. UQK BARDHI 166, Fushe Kosovë </div>
        </div>

        {/* Meta të Faturës */}
        <div className="invoice-meta">
          <div><strong>Arkëtari:</strong> {order.cashierName}</div>
          <div><strong>Data e Plotë:</strong> {new Date(order.orderDate).toLocaleString("sq-AL")}</div>
          {/* <div><strong>Klienti:</strong> (Nuk specifikohet)</div> Shto nëse ke user info */}
        </div>

        {/* Tabela e Artikujve */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ width: "5%" }}>Nr.</th>
              <th style={{ width: "50%" }}>Produkti</th>
              <th style={{ width: "10%" }}>Sasia</th>
              <th style={{ width: "15%" }}>Çmimi (€)</th>
              <th style={{ width: "20%" }}>Nëntotali (€)</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{item.price.toFixed(2)}</td>
                <td>{item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="4" style={{ textAlign: "right", paddingRight: "20px" }}>TOTAL PËRFUNDIMTAR</td>
              <td>{order.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Seksioni i Nënshkrimeve */}
        <div className="signature-section">
          <div className="signature-item">
            <div>Pranoi:</div>
            <div className="signature-line">________________________</div>
            {/* <div style={{ fontSize: "12px", marginTop: "5px" }}>Emri i Klientit / Data</div> */}
          </div>
          <div className="signature-item">
            <div>Dorzoi:</div>
            <div className="signature-line">________________________</div>
            {/* <div style={{ fontSize: "12px", marginTop: "5px" }}>Emri i Punonjësit / Data</div> */}
          </div>
        </div>

        {/* Footer Profesional (opsional, për print) */}
        <div style={{ textAlign: "center", marginTop: "40px", fontSize: "10px", color: "#7f8c8d", borderTop: "1px solid #eee", paddingTop: "10px" }}>
          Faleminderit për blerjen tuaj! 
        </div>
      </div>
    </>
  );
};

export default OrderDetailsPage;