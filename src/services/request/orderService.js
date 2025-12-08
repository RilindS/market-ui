import api from "../axios";

export const createOrder = async (orderData) => {
  const response = await api.post(`order/create`, orderData, {
    // headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getTodayReport = async () => {
  const res = await api.get("order/today");
  return res.data;
};

// Detajet e një porosi të vetme
export const getOrderDetails = async (orderId) => {
  const res = await api.get(`order/${orderId}/details`);
  return res.data;
};

export const getTodayReports = async (page = 0, size = 10) => {
  const response = await api.get(`order/today`, { params: { page, size } });
  return response.data;
};

export const getReportsByDate = async (date, page = 0, size = 10) => {
  const response = await api.get(`order/date/${date}`, { params: { page, size } });
  return response.data;
};

export const getReportsByRange = async (startDate, endDate, page = 0, size = 10) => {
  const response = await api.get(`order/range`, {
    params: { start: startDate, end: endDate, page, size }
  });
  return response.data;
};
