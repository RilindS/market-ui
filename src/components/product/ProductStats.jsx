import { useEffect, useState } from "react";
import { getTotalDebts } from "../../services/request/clientService";
import { getAllProducts, getProductCount, getStockValue } from "../../services/request/productService";
import "./ProductStats.scss";

const PAGE_SIZE = 20;

export default function ProductStats() {
  const [totalDebts, setTotalDebts] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [stockValue, setStockValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const isSearching = search.trim() !== "";

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
    if (loading) return;
    setLoading(true);

    // Kur jemi në search, marrim të gjitha rezultatet (mos pagination)
    const size = isSearching ? 1000 : PAGE_SIZE;

    try {
      const res = await getAllProducts(search, isSearching ? 0 : page, size);
      const content = res.content || [];

      setProducts((prev) => {
        if (page === 0 || isSearching) {
          return content;
        } else {
          const existingIds = new Set(prev.map(p => p.id));
          const newContent = content.filter(p => !existingIds.has(p.id));
          return [...prev, ...newContent];
        }
      });

      if (content.length < size || res.last === true) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error("Error loading product list:", error);
    }

    setLoading(false);
  };

  // LOAD STATS & TOTAL DEBTS ON MOUNT
  useEffect(() => {
    loadStats();
    fetchTotalDebts();
  }, []);

  // RESET PRODUCTS ON SEARCH CHANGE
  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(!isSearching);

    // Thirrim produktet vetëm një herë
    loadProducts();
  }, [search]);

  // LOAD PRODUCTS WHEN PAGE CHANGES (ONLY WHEN NOT SEARCHING)
  useEffect(() => {
    if (!isSearching && page > 0) {
      loadProducts();
    }
  }, [page]);

  // INFINITE SCROLL
  useEffect(() => {
    const handleScroll = () => {
      if (
        !isSearching &&
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500
      ) {
        if (!loading && hasMore) {
          setPage((p) => p + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, isSearching]);

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
          <h3>Vlera totale e borxheve aktive</h3>
          <p>{totalDebts.toFixed(2)} €</p>
        </div>
      </div>

      <h3 className="table-title">Lista e Produkteve</h3>

      <input
        type="text"
        placeholder="Kërko produkt me emër..."
        className="product-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "15px", padding: "5px", width: "300px" }}
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

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {!hasMore && !isSearching && <p style={{ textAlign: "center" }}>No more products</p>}
    </div>
  );
}
