import { jwtDecode } from "jwt-decode"; // npm install jwt-decode
import { useEffect, useState } from "react";
import { createOrder } from "../../services/request/orderService";
import { getAllProducts } from "../../services/request/productService";

const CreateOrder = () => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [barcode, setBarcode] = useState("");

  // merr userId nga token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.userId || decoded.id || decoded.sub;
    } catch (error) {
      console.error("Token decoding failed:", error);
      return null;
    }
  };

  const userId = getUserIdFromToken();

  // kërko produktet sipas query
  useEffect(() => {
    const fetchProducts = async () => {
      if (search.trim() === "") {
        setSearchResults([]);
        return;
      }
      try {
        const results = await getAllProducts(search);
        setSearchResults(results);
      } catch (error) {
        console.error("Gabim gjatë kërkimit të produkteve:", error);
      }
    };

    const delayDebounce = setTimeout(fetchProducts, 400);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  // shto produktin në listë
  const handleAddProduct = (product) => {
    const exists = selectedItems.find((item) => item.productId === product.id);
    if (exists) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  // ndrysho sasinë manualisht
  const handleQuantityChange = (productId, value) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: parseInt(value) || 1 }
          : item
      )
    );
  };

  // llogarit totalin sa herë që ndryshon lista
  useEffect(() => {
    const totalAmount = selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(totalAmount.toFixed(2));
  }, [selectedItems]);

  const handleRemoveProduct = (id) => {
    setSelectedItems(selectedItems.filter((item) => item.productId !== id));
  };

  // 🔹 Kërko produkt nga barcode (pa backend shtesë)
  const handleBarcodeInput = async (e) => {
    if (e.key === "Enter" && barcode.trim() !== "") {
      try {
        const results = await getAllProducts(barcode); // përdor të njëjtin endpoint
        if (results.length === 0) {
          alert("Asnjë produkt nuk u gjet për këtë barcode!");
        } else {
          // nëse kthehet një produkt i vetëm ose lista — merre të parin
          handleAddProduct(results[0]);
        }
        setBarcode("");
      } catch (error) {
        console.error("Gabim gjatë kërkimit të barcode:", error);
        alert("Gabim gjatë kërkimit të produktit me barcode.");
      }
    }
  };

  const handleCreateOrder = async () => {
    if (!userId || selectedItems.length === 0) {
      alert("Ju lutem zgjidhni të paktën një produkt.");
      return;
    }

    const orderRequest = {
      userId: Number(userId),
      items: selectedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      await createOrder(orderRequest);
      alert("Porosia u krijua me sukses!");
      setSelectedItems([]);
      setSearch("");
      setSearchResults([]);
      setTotal(0);
    } catch (error) {
      console.error("Gabim gjatë krijimit të porosisë:", error);
      alert("Gabim gjatë krijimit të porosisë.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Krijo Porosi</h2>

      {/* 🔹 Input kërkimi ose barcode */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Kërko produkt sipas emrit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
          }}
        />

        <input
          type="text"
          placeholder="Skano barcode..."
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={handleBarcodeInput}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
          }}
        />
      </div>

      {/* Rezultatet e kërkimit */}
      {searchResults.length > 0 && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginBottom: "20px",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {searchResults.map((product) => (
            <div
              key={product.id}
              onClick={() => handleAddProduct(product)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>
                {product.name} ({product.barcode})
              </span>
              <span>{product.price} €</span>
            </div>
          ))}
        </div>
      )}

      {/* Produktet e zgjedhura */}
      <h3>Produktet e porosisë</h3>
      {selectedItems.length === 0 ? (
        <p>Asnjë produkt i shtuar ende.</p>
      ) : (
        <table
          border="1"
          cellPadding="5"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Emri</th>
              <th>Çmimi</th>
              <th>Sasia</th>
              <th>Totali</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {selectedItems.map((item) => (
              <tr key={item.productId}>
                <td>{item.name}</td>
                <td>{item.price} €</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.productId, e.target.value)
                    }
                    style={{ width: "60px" }}
                  />
                </td>
                <td>{(item.price * item.quantity).toFixed(2)} €</td>
                <td>
                  <button onClick={() => handleRemoveProduct(item.productId)}>
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Totali */}
      <h3 style={{ textAlign: "right", marginTop: "20px" }}>
        Totali: {total} €
      </h3>

      {/* Krijo porosinë */}
      <button
        onClick={handleCreateOrder}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#2d89ef",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Krijo Porosi
      </button>
    </div>
  );
};

export default CreateOrder;
