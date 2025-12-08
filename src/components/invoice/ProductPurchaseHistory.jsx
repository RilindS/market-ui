import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductHistory } from "../../services/request/invoiceService";
import { getAllProducts } from "../../services/request/productService";
import "./ProductPurchaseHistory.scss";

const ProductPurchaseHistory = () => {
  const { id } = useParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    if (id) {
      loadHistoryById(id);
    }
  }, [id]);

  const loadHistoryById = async (productId) => {
    try {
      const data = await getProductHistory(productId);
      setHistory(data);
      setQuery(data.productName);
    } catch (e) {
      alert("Gabim gjatë marrjes së historisë.");
    }
  };

  const handleSearch = async (value) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    const data = await getAllProducts(value);
    setResults(data);
  };

  return (
    <div className="product-history-container">
      <h2>📦 Historia e Blerjeve</h2>

      <input
        type="text"
        value={query}
        placeholder="Kërko produkt..."
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
      />

      {results.length > 0 && (
        <ul className="search-results">
          {results.map((p) => (
            <li key={p.id} onClick={() => loadHistoryById(p.id)}>
              <span>{p.name}</span>
              <span>{p.barcode}</span>
            </li>
          ))}
        </ul>
      )}

      {history && (
        <div className="history-card">
          <h3>{history.productName} ({history.barcode})</h3>

          <table className="history-table">
            <thead>
              <tr>
                <th>Fatura</th>
                <th>Furnitori</th>
                <th>Data</th>
                <th>Sasia</th>
                <th>Çmimi Blerës</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {history.history.map((h, i) => (
                <tr key={i}>
                  <td>{h.invoiceNumber}</td>
                  <td>{h.supplierName}</td>
                  <td>{h.invoiceDate.replace("T", " ")}</td>
                  <td>{h.quantity}</td>
                  <td>{h.unitPrice.toFixed(2)}€</td>
                  <td>{h.totalPrice.toFixed(2)}€</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

    </div>
  );
};

export default ProductPurchaseHistory;
