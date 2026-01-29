import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getAllProducts,
    getProductSalesHistory,
} from "../../services/request/productService";
import "./ProductSalesHistory.scss";

const ProductSalesHistory = () => {
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
      const data = await getProductSalesHistory(productId);
      setHistory(data);
      setQuery(data.productName);
    } catch (e) {
      alert("Gabim gjatë marrjes së historisë së shitjeve.");
    }
  };

  const handleSearch = async (value) => {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      const response = await getAllProducts(value);
      setResults(response?.content || []);
    } catch {
      setResults([]);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getFullYear()}`;
  };

  // 📅 GRUPIM MUJOR I SHITJEVE
  const chartData = useMemo(() => {
    if (!history) return [];

    const map = {};

    history.history.forEach((h) => {
      const d = new Date(h.orderDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      map[key] = (map[key] || 0) + Number(h.quantity);
    });

    const max = Math.max(...Object.values(map), 1);

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, quantity]) => {
        const [year, month] = key.split("-");
        const date = new Date(year, month - 1);

        const label = date.toLocaleDateString("sq-AL", {
          month: "short",
          year: "numeric",
        });

        return {
          label,
          quantity,
          percent: (quantity / max) * 100,
        };
      });
  }, [history]);

  return (
    <div className="product-history-container">
      <h2>📈 Historia Mujore e Shitjeve</h2>

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
        <>
          {/* 📊 CHART PURE CSS */}
          <div className="chart-card">
            <h3>
              {history.productName} ({history.barcode})
            </h3>

            <div className="chart">
              {chartData.map((d) => (
                <div className="chart-row" key={d.label}>
                  <span className="chart-label">
                    {d.label}
                    <span className="chart-label-qty">
                      {" "}
                      ({d.quantity} copë)
                    </span>
                  </span>

                  <div className="chart-bar-wrapper">
                    <div
                      className="chart-bar"
                      style={{ width: `${d.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 📋 TABLE */}
          <div className="history-card">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Klienti</th>
                  <th>Sasia</th>
                  <th>Çmimi</th>
                  <th>Total</th>
                  <th>Statusi</th>
                </tr>
              </thead>
              <tbody>
                {history.history.map((h, i) => (
                  <tr key={i}>
                    <td>{formatDate(h.orderDate)}</td>
                    <td>{h.clientName || "-"}</td>
                    <td>{h.quantity}</td>
                    <td>{h.unitPrice.toFixed(2)}€</td>
                    <td>{h.totalPrice.toFixed(2)}€</td>
                    <td>{h.orderStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductSalesHistory;
