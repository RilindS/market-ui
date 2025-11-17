import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1/order"; // ose nga .env

export const createOrder = async (orderData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${BASE_URL}/create`, orderData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
