// src/services/request/supplierService.js
import api from "../axios";

// Merr të gjithë furnizuesit
export const getAllSuppliers = async (search = "") => {
  try {
    const response = await api.get(`/supplier`, {
      params: { search }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error;
  }
};

export const getProductsBySupplier = async (supplierId) => {
  try {
    const response = await api.get(`/product/supplier/${supplierId}/products`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products for supplier:", error);
    throw error;
  }
};
// Merr një furnizues sipas ID-së
export const getSupplierById = async (id) => {
  try {
    const response = await api.get(`/supplier/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching supplier:", error);
    throw error;
  }
};

// Krijo furnizues të ri
export const createSupplier = async (supplierData) => {
  try {
    const response = await api.post("/supplier/create", supplierData);
    return response.data;
  } catch (error) {
    console.error("Error creating supplier:", error);
    throw error;
  }
};

// Përditëso furnizuesin
export const updateSupplier = async (id, supplierData) => {
  try {
    const response = await api.put(`/supplier/${id}`, supplierData);
    return response.data;
  } catch (error) {
    console.error("Error updating supplier:", error);
    throw error;
  }
};

// Fshij furnizuesin
export const deleteSupplier = async (id) => {
  try {
    await api.delete(`/supplier/${id}`);
  } catch (error) {
    console.error("Error deleting supplier:", error);
    throw error;
  }
};
