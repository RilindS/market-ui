import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createProduct,
  getAllProducts,
  getProductByBarcode,
  updateProduct,
} from "../../services/request/productService";
import { getAllSuppliers } from "../../services/request/supplierService";

const PAGE_SIZE = 20;

const EditableProductTable = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [searchName, setSearchName] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");

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

  /* =============================
     BARCODE DUPLICATE CHECK
  ============================= */
  const checkBarcodeDuplicate = async (barcode) => {
    if (!barcode) {
      setBarcodeDuplicate(false);
      return;
    }

    setBarcodeCheckLoading(true);
    try {
      const existing = await getProductByBarcode(barcode.trim());
      if (existing) {
        setBarcodeDuplicate(true);
        showNotification("Barcode ekziston tashmë!");
      } else {
        setBarcodeDuplicate(false);
      }
    } catch (err) {
      console.error(err);
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

  /* =============================
     LOAD PRODUCTS
  ============================= */
  const loadProducts = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 🔴 SEARCH BY BARCODE (EXACT)
      if (searchBarcode.trim() !== "") {
        const product = await getProductByBarcode(searchBarcode.trim());
        setProducts(product ? [product] : []);
        setHasMore(false);
      }
      // 🟢 SEARCH BY NAME
      else if (searchName.trim() !== "") {
        const res = await getAllProducts(searchName.trim());
        setProducts(res.content || []);
        setHasMore(false);
      }
      // 🔵 NORMAL PAGINATION
      else {
        const res = await getAllProducts("", page, PAGE_SIZE);
        const content = res.content || [];

        setProducts((prev) => {
          if (page === 0) return content;

          const existingIds = new Set(prev.map((p) => p.id));
          const newContent = content.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newContent];
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

  /* =============================
     EFFECTS
  ============================= */
  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
    loadProducts();
  }, [searchName, searchBarcode, refresh]);

  useEffect(() => {
    if (!searchName && !searchBarcode) {
      loadProducts();
    }
  }, [page]);

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const res = await getAllSuppliers("");
        setSuppliers(res);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSuppliers();
  }, []);

  useEffect(() => {
    return () => {
      if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);
    };
  }, []);

  /* =============================
     CREATE PRODUCT
  ============================= */
  const handleCreate = async () => {
    if (barcodeDuplicate) {
      showNotification("Barcode ekziston tashmë!");
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
      setRefresh((p) => !p);
    } catch (err) {
      console.error(err);
      showNotification("Gabim gjatë krijimit!");
    }
  };

  /* =============================
     EDIT PRODUCT
  ============================= */
  const handleEdit = async (id, field, value) => {
    if (field === "barcode") {
      const existing = await getProductByBarcode(value);
      if (existing && existing.id !== id) {
        showNotification("Barcode ekziston tashmë!");
        return;
      }
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );

    try {
      await updateProduct(id, { [field]: value });
    } catch (err) {
      console.error(err);
    }
  };

  /* =============================
     SUPPLIER COMBOBOX
  ============================= */
  const SupplierCombobox = ({ valueId, onChange }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [list, setList] = useState([]);
    const ref = useRef(null);

    const currentName =
      suppliers.find((s) => s.id === valueId)?.name || "Zgjedh Furnitorin";

    useEffect(() => {
      if (!open) return;
      getAllSuppliers(search).then(setList);
    }, [search, open]);

    useEffect(() => {
      const close = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", close);
      return () => document.removeEventListener("mousedown", close);
    }, []);

    return (
      <div ref={ref} style={{ position: "relative" }}>
        <div
          onClick={() => setOpen(!open)}
          style={{ border: "1px solid #ccc", padding: "5px", cursor: "pointer" }}
        >
          {currentName}
        </div>

        {open && (
          <div style={{ position: "absolute", background: "#fff", zIndex: 1000 }}>
            <input
              autoFocus
              placeholder="Kërko furnitor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ul style={{ listStyle: "none", padding: 0 }}>
              {list.map((s) => (
                <li
                  key={s.id}
                  style={{ padding: "6px", cursor: "pointer" }}
                  onClick={() => {
                    onChange(s.id);
                    setOpen(false);
                  }}
                >
                  {s.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {notification && (
        <div style={{ background: "#4caf50", color: "#fff", padding: "8px" }}>
          {notification}
        </div>
      )}

    
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
  <div style={{ display: "flex", gap: "10px" }}>
    <input
      placeholder="Search by name"
      value={searchName}
      onChange={(e) => {
        setSearchName(e.target.value);
        setSearchBarcode("");
      }}
    />

    <input
      placeholder="Search by barcode"
      value={searchBarcode}
      onChange={(e) => {
        setSearchBarcode(e.target.value);
        setSearchName("");
      }}
    />
  </div>

  <button
    onClick={() => navigate("/admin/create-product")}
    style={{
      backgroundColor: "#1976d2",
      color: "white",
      border: "none",
      padding: "8px 14px",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "500",
    }}
  >
    + Create Product
  </button>
</div>

      {/* TABLE */}
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Stock</th>
            <th>Supplier</th>
            <th>Active</th>
            <th>Create</th>
          </tr>
        </thead>
        <tbody>
          {/* CREATE ROW */}
          <tr>
            <td>
              <input
                value={newProduct.barcode}
                onChange={handleBarcodeChange}
                style={{ borderColor: barcodeDuplicate ? "red" : "#ccc" }}
              />
            </td>
            <td>
              <input
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </td>
            <td>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />
            </td>
            <td>
              <input
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
            </td>
            <td>
              <input
                type="number"
                value={newProduct.stockQuantity}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stockQuantity: e.target.value,
                  })
                }
              />
            </td>
            <td>
              <SupplierCombobox
                valueId={newProduct.supplierId}
                onChange={(id) =>
                  setNewProduct({ ...newProduct, supplierId: id })
                }
              />
            </td>
            <td>
              <input
                type="checkbox"
                checked={newProduct.active}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, active: e.target.checked })
                }
              />
            </td>
            <td>
              <button onClick={handleCreate}>Create</button>
            </td>
          </tr>

          {/* PRODUCTS */}
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <input
                  value={p.barcode}
                  onChange={(e) =>
                    handleEdit(p.id, "barcode", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  value={p.name}
                  onChange={(e) => handleEdit(p.id, "name", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={p.price}
                  onChange={(e) => handleEdit(p.id, "price", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={p.description}
                  onChange={(e) =>
                    handleEdit(p.id, "description", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  value={p.stockQuantity}
                  onChange={(e) =>
                    handleEdit(p.id, "stockQuantity", e.target.value)
                  }
                />
              </td>
              <td>
                <SupplierCombobox
                  valueId={p.supplierId}
                  onChange={(id) =>
                    handleEdit(p.id, "supplierId", id)
                  }
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={p.active}
                  onChange={(e) =>
                    handleEdit(p.id, "active", e.target.checked)
                  }
                />
              </td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p>Loading...</p>}
    </div>
  );
};

export default EditableProductTable;
