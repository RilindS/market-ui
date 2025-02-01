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

export const getAllProducts = async (search = "") => {
  try {
    const response = await api.get("/product/products", { params: { search } }); // Pass search as query param
    return response.data;
  } catch (error) {
    console.error("Get all products error:", error);
    throw error;
  }
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
