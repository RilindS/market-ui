import { useEffect, useRef, useState } from "react";
import { createProduct, getAllProducts, getProductByBarcode, updateProduct } from "../../services/request/productService";
import { getAllSuppliers } from "../../services/request/supplierService";

const PAGE_SIZE = 20;

const EditableProductTable = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const [notification, setNotification] = useState("");

  const [newProduct, setNewProduct] = useState({
    barcode: "",
    name: "",
    price: "",
    description: "",
    stockQuantity: "",
    category: "",
    supplierId: "",
    active: true,
  });

  const [barcodeCheckLoading, setBarcodeCheckLoading] = useState(false);
  const [barcodeDuplicate, setBarcodeDuplicate] = useState(false);
  const barcodeTimeoutRef = useRef(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2500);
  };

  // =============================
  // BARCODE DUPLICATE CHECK FOR CREATE
  // =============================
  const checkBarcodeDuplicate = async (barcode) => {
    if (!barcode || barcode.trim() === "") {
      setBarcodeDuplicate(false);
      setBarcodeCheckLoading(false);
      return;
    }

    setBarcodeCheckLoading(true);
    try {
      const existingProduct = await getProductByBarcode(barcode);
      setBarcodeDuplicate(existingProduct !== null);
      if (existingProduct !== null) {
        showNotification("Barcode ekziston tashmë! Zgjidhni një tjetër.");
      }
    } catch (err) {
      console.error("Error checking barcode:", err);
      setBarcodeDuplicate(false);
    }
    setBarcodeCheckLoading(false);
  };

  const handleBarcodeChange = (e) => {
    const value = e.target.value;
    setNewProduct({ ...newProduct, barcode: value });

    if (barcodeTimeoutRef.current) {
      clearTimeout(barcodeTimeoutRef.current);
    }

    barcodeTimeoutRef.current = setTimeout(() => {
      checkBarcodeDuplicate(value);
    }, 500);
  };

  // =============================
  // FETCH PRODUCTS (WITH OR WITHOUT PAGINATION)
  // =============================
  const loadProducts = async () => {
    if (loading) return;
    setLoading(true);

    try {
      let res;

      if (search && search.trim() !== "") {
        // SEARCH ACTIVE: fetch all matching products without pagination
        res = await getAllProducts(search); 
        setProducts(res.content || []);
        setHasMore(false); // disable pagination during search
      } else {
        // NORMAL PAGINATION
        res = await getAllProducts(search, page, PAGE_SIZE);
        const content = res.content || [];

        setProducts((prev) => {
          let updated;
          if (page === 0) {
            updated = content;
          } else {
            const existingIds = new Set(prev.map((p) => p.id));
            const newContent = content.filter((p) => !existingIds.has(p.id));
            updated = [...prev, ...newContent];
          }

          return updated.sort((a, b) => {
            const aLen = a.barcode?.length || 0;
            const bLen = b.barcode?.length || 0;
            if (aLen > 4 && bLen > 4) {
              return parseInt(a.barcode, 10) - parseInt(b.barcode, 10);
            } else {
              return (a.barcode || "").localeCompare(b.barcode || "");
            }
          });
        });

        if (content.length < PAGE_SIZE || res.last === true) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // Reset products on search or refresh
  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
    loadProducts();
  }, [search, refresh]);

  // Load next page
  useEffect(() => {
    if (!search || search.trim() === "") {
      loadProducts();
    }
  }, [page]);

  // Scroll handler for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500
      ) {
        if (!loading && hasMore) {
          const now = Date.now();
          if (!window.lastScrollTrigger || now - window.lastScrollTrigger > 1000) {
            window.lastScrollTrigger = now;
            setPage((p) => p + 1);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    return () => {
      if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);
    };
  }, []);

  // =============================
  // FETCH ALL SUPPLIERS (ONCE)
  // =============================
  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const result = await getAllSuppliers("");
        setSuppliers(result);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSuppliers();
  }, []);

  // =============================
  // CREATE PRODUCT
  // =============================
  const handleCreate = async () => {
    if (barcodeDuplicate) {
      showNotification("Barcode ekziston tashmë! Zgjidhni një tjetër.");
      return;
    }

    try {
      await createProduct(newProduct);

      setNewProduct({
        barcode: "",
        name: "",
        price: "",
        description: "",
        stockQuantity: "",
        category: "",
        supplierId: "",
        active: true,
      });
      setBarcodeDuplicate(false);

      showNotification("Produkti u krijua me sukses!");
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error(error);
      showNotification("Gabim gjatë krijimit të produktit!");
    }
  };

  // =============================
  // EDIT PRODUCT
  // =============================
  const handleEdit = async (id, field, value) => {
    if (field === "barcode") {
      const currentProduct = products.find((p) => p.id === id);
      if (value && value !== currentProduct?.barcode) {
        try {
          const existingProduct = await getProductByBarcode(value);
          if (existingProduct && existingProduct.id !== id) {
            showNotification("Barcode ekziston tashmë! Zgjidhni një tjetër.");
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }
    }

    const updated = products.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setProducts(updated);

    try {
      await updateProduct(id, { [field]: value });
    } catch (err) {
      console.error(err);
    }
  };

  // =============================
  // SUPPLIER COMBOBOX
  // =============================
  const SupplierCombobox = ({ valueId, onChange, allSuppliers }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    const currentName =
      allSuppliers.find((s) => s.id === valueId)?.name || "Zgjedh Furnitorin";

    useEffect(() => {
      if (!open) {
        setSearch("");
        return;
      }
      async function fetchSuppliers() {
        try {
          const res = await getAllSuppliers(search);
          setFilteredSuppliers(res);
        } catch (err) {
          console.error(err);
        }
      }
      fetchSuppliers();
    }, [search, open]);

    useEffect(() => {
      if (!open) return;
      const handleClickOutside = (event) => {
        if (triggerRef.current && !triggerRef.current.contains(event.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [open]);

    const handleSelect = (supplier) => {
      onChange(supplier.id);
      setOpen(false);
    };

    const dropdownStyle = {
      position: "absolute",
      zIndex: 1000,
      background: "white",
      border: "1px solid #ccc",
      borderRadius: "4px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      minWidth: "200px",
      maxHeight: "200px",
      overflowY: "auto",
    };

    const inputStyle = {
      width: "100%",
      padding: "5px",
      border: "none",
      borderBottom: "1px solid #eee",
      outline: "none",
    };

    const listStyle = { listStyle: "none", padding: 0, margin: 0 };
    const itemStyle = { padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #f0f0f0" };
    const triggerStyle = { position: "relative", cursor: "pointer", minWidth: "150px", padding: "5px", border: "1px solid #ccc", borderRadius: "4px", background: "white" };

    return (
      <div ref={triggerRef} style={triggerStyle} onClick={() => setOpen(!open)}>
        {currentName}
        {open && (
          <div ref={dropdownRef} style={{ ...dropdownStyle, top: "100%", left: 0, marginTop: "2px" }}>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko furnitorë..."
              style={inputStyle}
              onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
            />
            <ul style={listStyle}>
              {filteredSuppliers.map((s) => (
                <li key={s.id} onClick={() => handleSelect(s)} style={itemStyle} onMouseDown={(e) => e.preventDefault()}>
                  {s.name}
                </li>
              ))}
              {filteredSuppliers.length === 0 && (
                <li style={{ ...itemStyle, color: "#999", cursor: "default" }}>Asnjë furnitor nuk u gjet</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {notification && (
        <div style={{ background: "#4caf50", padding: "10px", color: "white", marginBottom: "10px", borderRadius: "5px", textAlign: "center", fontWeight: "bold" }}>
          {notification}
        </div>
      )}

      <input
        type="text"
        placeholder="Search by product name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "15px", padding: "5px", width: "300px" }}
      />

      <table border="1" cellPadding="5" style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Name</th>
            <th>Price (€)</th>
            <th>Description</th>
            <th>Stock</th>
            <th>Supplier</th>
            <th>Active</th>
            <th>Create</th>
          </tr>
        </thead>
        <tbody>
          {/* CREATE ROW */}
          <tr style={{ background: "#e9ffe9" }}>
            <td>
              <input
                type="text"
                value={newProduct.barcode}
                onChange={handleBarcodeChange}
                placeholder={barcodeCheckLoading ? "Duke kontrolluar..." : (barcodeDuplicate ? "Barcode i zënë" : "Barcode")}
                style={{ borderColor: barcodeDuplicate ? "red" : (barcodeCheckLoading ? "orange" : "#ccc") }}
              />
            </td>
            <td><input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} /></td>
            <td><input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} /></td>
            <td><input type="text" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} /></td>
            <td><input type="number" value={newProduct.stockQuantity} onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })} /></td>
            <td>
              <SupplierCombobox valueId={newProduct.supplierId} onChange={(id) => setNewProduct({ ...newProduct, supplierId: Number(id) })} allSuppliers={suppliers} />
            </td>
            <td><input type="checkbox" checked={newProduct.active} onChange={(e) => setNewProduct({ ...newProduct, active: e.target.checked })} /></td>
            <td>
              <button
                onClick={handleCreate}
                disabled={barcodeDuplicate || barcodeCheckLoading}
                style={{ backgroundColor: barcodeDuplicate ? "#f44336" : (barcodeCheckLoading ? "#ff9800" : "#4caf50"), color: "white" }}
              >
                {barcodeCheckLoading ? "Duke kontrolluar..." : "Create"}
              </button>
            </td>
          </tr>

          {/* LIST PRODUCTS */}
          {products.map((product) => (
            <tr key={product.id}>
              <td><input type="text" value={product.barcode || ""} onChange={(e) => handleEdit(product.id, "barcode", e.target.value)} /></td>
              <td><input type="text" value={product.name || ""} onChange={(e) => handleEdit(product.id, "name", e.target.value)} /></td>
              <td><input type="number" value={product.price || ""} onChange={(e) => handleEdit(product.id, "price", e.target.value)} /></td>
              <td><input type="text" value={product.description || ""} onChange={(e) => handleEdit(product.id, "description", e.target.value)} /></td>
              <td><input type="number" value={product.stockQuantity || ""} onChange={(e) => handleEdit(product.id, "stockQuantity", e.target.value)} /></td>
              <td><SupplierCombobox valueId={product.supplierId || ""} onChange={(id) => handleEdit(product.id, "supplierId", Number(id))} allSuppliers={suppliers} /></td>
              <td><input type="checkbox" checked={product.active} onChange={(e) => handleEdit(product.id, "active", e.target.checked)} /></td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {!hasMore && !search && <p style={{ textAlign: "center" }}>No more products</p>}
    </div>
  );
};

export default EditableProductTable;
