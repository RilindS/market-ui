import { useEffect, useRef, useState } from "react";
import {
  createProduct,
  getProductByBarcode,
  updateProduct,
} from "../../services/request/productService";
import { getAllSuppliers } from "../../services/request/supplierService";
import styles from "./ProductForm.module.scss";

/* =========================
   SUPPLIER COMBOBOX
========================= */
const SupplierCombobox = ({ valueId, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const triggerRef = useRef(null);

  const currentName =
    suppliers.find((s) => s.id === valueId)?.name || "Zgjedh Furnitorin";

  useEffect(() => {
    if (!open) return;

    async function fetchSuppliers() {
      try {
        const res = await getAllSuppliers(search);
        setSuppliers(res);
      } catch (err) {
        console.error(err);
      }
    }

    fetchSuppliers();
  }, [search, open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={styles.combobox} ref={triggerRef}>
      <div className={styles.trigger} onClick={() => setOpen(!open)}>
        {currentName}
      </div>

      {open && (
        <div className={styles.dropdown}>
          <input
            autoFocus
            placeholder="Kërko furnitor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <ul>
            {suppliers.map((s) => (
              <li
                key={s.id}
                onClick={() => {
                  onChange(s.id);
                  setOpen(false);
                }}
              >
                {s.name}
              </li>
            ))}
            {suppliers.length === 0 && (
              <li className={styles.empty}>Asnjë furnitor nuk u gjet</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

/* =========================
   PRODUCT FORM
========================= */
const ProductForm = ({ initialData = null, isEditMode = false, onSuccess }) => {
  const [product, setProduct] = useState({
    barcode: "",
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    category: "",
    active: true,
    supplierId: "",
  });

  /* ===== BARCODE CHECK ===== */
  const [barcodeDuplicate, setBarcodeDuplicate] = useState(false);
  const [barcodeCheckLoading, setBarcodeCheckLoading] = useState(false);
  const barcodeTimeoutRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setProduct({
        barcode: initialData.barcode,
        name: initialData.name,
        description: initialData.description,
        price: initialData.price,
        stockQuantity: initialData.stockQuantity,
        category: initialData.category,
        active: initialData.active,
        supplierId: initialData.supplierId || "",
      });
    }
  }, [initialData]);

  const checkBarcodeDuplicate = async (barcode) => {
    if (!barcode || barcode.trim() === "") {
      setBarcodeDuplicate(false);
      setBarcodeCheckLoading(false);
      return;
    }

    setBarcodeCheckLoading(true);
    try {
      const existing = await getProductByBarcode(barcode);

      if (
        existing &&
        (!isEditMode || existing.id !== initialData?.id)
      ) {
        setBarcodeDuplicate(true);
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
    setProduct((prev) => ({ ...prev, barcode: value }));

    if (barcodeTimeoutRef.current) {
      clearTimeout(barcodeTimeoutRef.current);
    }

    barcodeTimeoutRef.current = setTimeout(() => {
      checkBarcodeDuplicate(value);
    }, 500);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (barcodeDuplicate) {
      alert("Barcode ekziston tashmë!");
      return;
    }

    try {
      if (isEditMode) {
        await updateProduct(initialData.id, product);
      } else {
        await createProduct(product);
      }
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Gabim gjatë ruajtjes së produktit");
    }
  };

  return (
    <form className={styles["product-form"]} onSubmit={handleSubmit}>
      <label>Barcode</label>
      <input
        type="text"
        value={product.barcode}
        onChange={handleBarcodeChange}
        required
        style={{ borderColor: barcodeDuplicate ? "red" : "#ccc" }}
      />
      {barcodeCheckLoading && <small>Duke kontrolluar barcode...</small>}
      {barcodeDuplicate && (
        <small style={{ color: "red" }}>Barcode ekziston!</small>
      )}

      <label>Name</label>
      <input
        type="text"
        name="name"
        value={product.name}
        onChange={handleChange}
        required
      />

      <label>Description</label>
      <textarea
        name="description"
        value={product.description}
        onChange={handleChange}
      />

      <label>Price (€)</label>
      <input
        type="number"
        name="price"
        value={product.price}
        onChange={handleChange}
        required
      />

      <label>Stock Quantity</label>
      <input
        type="number"
        name="stockQuantity"
        value={product.stockQuantity}
        onChange={handleChange}
        required
      />

      <label>Supplier</label>
      <SupplierCombobox
        valueId={product.supplierId}
        onChange={(id) =>
          setProduct((prev) => ({ ...prev, supplierId: id }))
        }
      />
{/* 
      <div className={styles.checkbox}>
        <input
          type="checkbox"
          name="active"
          checked={product.active}
          onChange={handleChange}
        />
        <label>Active</label>
      </div> */}

      <button
        type="submit"
        disabled={barcodeDuplicate || barcodeCheckLoading}
      >
        {isEditMode ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
};

export default ProductForm;
