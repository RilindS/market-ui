import { useEffect, useState } from "react";
import { getTotalDebts } from "../../services/request/clientService";
import { getAllProducts, getProductCount, getStockValue } from "../../services/request/productService";
import "./ProductStats.scss";

export default function ProductStats() {
      const [totalDebts, setTotalDebts] = useState(0);

  const [productCount, setProductCount] = useState(0);
  const [stockValue, setStockValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search]);

  useEffect(() => {
    fetchTotalDebts();
  }, []);

  const fetchTotalDebts = async () => {
    try {
      const data = await getTotalDebts();
      setTotalDebts(data.totalUnpaid || 0);
    } catch (error) {
      console.error('Gabim gjatë ngarkimit të borxhit total:', error);
    }
  };

  const loadStats = async () => {
    try {
      const countData = await getProductCount();
      const stockData = await getStockValue();

      setProductCount(countData.totalProducts);
      setStockValue(stockData.totalStockValue);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const productData = await getAllProducts(search);
      setProducts(productData);
    } catch (error) {
      console.error("Error loading product list:", error);
    }
  };

  return (
    <div className="product-stats-container">
      <h2>Statistikat e Produkteve</h2>

      <div className="stats-box">
        <div className="stat-card">
          <h3>Numri Total i Produkteve</h3>
          <p>{productCount}</p>
        </div>

        <div className="stat-card">
          <h3>Vlera Totale e Stokut</h3>
          <p>{stockValue?.toLocaleString()} €</p>
        </div>
        <div className="stat-card">
          <h3>Vlera totale e borgjeve aktive</h3>
          <p>{totalDebts.toFixed(2)} €</p>
        </div>

      </div>

      <h3 className="table-title">Lista e Produkteve</h3>

      {/* 🔎 Search input */}
      <input
        type="text"
        placeholder="Kërko produkt me emër..."
        className="product-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="product-table">
        <thead>
          <tr>
            <th>Emri</th>
            <th>Sasia</th>
            <th>Çmimi Shitës(€)</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.stockQuantity}</td>
              <td>{p.price} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
