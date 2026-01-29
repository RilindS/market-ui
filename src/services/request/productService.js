import api from "../axios";

export const createProduct = async (productData) => {
  try {
    const response = await api.post("/product/create", productData);
    return response.data;
  } catch (error) {
    console.error("Create product error:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/product/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get product by ID error:", error);
    throw error;
  }
};
export async function getProductByBarcode(barcode) {
  try {
    const response = await api.get("/product/find-by-barcode", {
      params: { barcode: barcode }
    });

    // Backend kthen listë, marrim produktin e parë
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }

    return null;
  } catch (err) {
    console.error("Barcode search error:", err);
    return null;
  }
}

// ... (other imports)

export const getAllProducts = async (search = "", page = 0, size = 20) => {
  const params = new URLSearchParams({ page, size });
  if (search) params.append('search', search);
  const response = await api.get(`/product/products?${params.toString()}`);
  return response.data;  // Kthen Page object: {content: [...], totalElements: num, etc.}
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/product/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error("Update product error:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete product error:", error);
    throw error;
  }
};

export const getProductsBySupplier = async (supplierId) => {
  const res = await api.get(`/product/supplier/${supplierId}/products`);
  return res.data;
};

export const getSuppliers = async (search = "") => {
  const res = await api.get(`/supplier?search=${search}`);
  return res.data;
};


export const getProductCount = async () => {
  try {
    const response = api.get("/product/count");
    return response.then((r) => r.data);
  } catch (error) {
    console.error("Error fetching product count:", error);
    throw error;
  }
};

// Merr vlerën totale të stokut
export const getStockValue = async () => {
  try {
    const response = api.get("/product/stock/value");
    return response.then((r) => r.data);
  } catch (error) {
    console.error("Error fetching stock value:", error);
    throw error;
  }
};

export const getProductSalesHistory = async (productId) => {
  const response = await api.get(`/product/${productId}/sales-history`);
  return response.data;
};
