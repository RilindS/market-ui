import api from "../axios"; // Si në shembullin tënd

export const getAllClients = async (search = "") => {
  try {
    const response = await api.get("/clients", { params: { search } });  // Dërgo search si query param
    return response.data;
  } catch (error) {
    console.error("Get all clients error:", error);
    throw error;
  }
};

// Shto edhe funksione të tjera nëse nuk i ke (p.sh., për debt dhe payments)
export const getClientDebt = async (clientId) => {
  try {
    const response = await api.get(`/clients/${clientId}/debt`);
    return response.data;
  } catch (error) {
    console.error("Get client debt error:", error);
    throw error;
  }
};

export const getClientDebt1 = async (clientId) => {
  try {
    const response = await api.get(`/clients/${clientId}/remaining-debt`);
    return response.data;
  } catch (error) {
    console.error("Get client debt error:", error);
    throw error;
  }
};

export const getClientPayments = async (clientId) => {
  try {
    const response = await api.get(`/clients/${clientId}/payments`);
    return response.data;
  } catch (error) {
    console.error("Get client payments error:", error);
    throw error;
  }
};

export const getTotalDebts = async () => {
  try {
    const response = await api.get("/clients/debts/total");
    return response.data;
  } catch (error) {
    console.error("Get total debts error:", error);
    throw error;
  }
};

export const createClient = (data) =>
  api.post("/clients", data).then((res) => res.data);

export const getClientById = (id) =>
  api.get(`/clients/${id}`).then((res) => res.data);

export const updateClient = (id, data) =>
  api.put(`/clients/${id}`, data).then((res) => res.data);

export const deleteClient = (id) =>
  api.delete(`/clients/${id}`).then((res) => res.data);