import api from "../axios";

// ... (funksionet e tjera mbeten të njëjta: getTotalSales, etj.)

// Përditëso closeDay: Dërgo si JSON body
export const closeDay = async (closingBalance, userId) => {
  try {
    const response = await api.post("/cash/close-day", {
      closingBalance: parseFloat(closingBalance),  // Siguro BigDecimal në backend
      userId: userId
    });
    return response.data;
  } catch (error) {
    console.error("Error closing day:", error);
    throw error;
  }
};

export const getTotalDebtPaymentsToday = async () => {
  try {
    const response = await api.get("/cash/today-debt-payments");
    return response.data;
  } catch (error) {
    console.error("Error fetching debt payments total:", error);
    throw error;
  }
};

export const getTotalSales = async () => {
  try {
    const response = await api.get("/cash/total-sales");
    return response.data;
  } catch (error) {
    console.error("Error fetching total sales:", error);
    throw error;
  }
};

// Merr totalin e blerjeve sot
export const getTotalPurchases = async () => {
  try {
    const response = await api.get("/cash/total-purchases");
    return response.data;
  } catch (error) {
    console.error("Error fetching total purchases:", error);
    throw error;
  }
};

// Merr gjendjen fillestare sot
export const getOpeningBalance = async () => {
  try {
    const response = await api.get("/cash/opening-balance");
    return response.data;
  } catch (error) {
    console.error("Error fetching opening balance:", error);
    throw error;
  }
};
export async function getCashRecords(page = 0, size = 30, year, month) {
    const params = new URLSearchParams({ page, size });

    if (year) params.append("year", year);
    if (month) params.append("month", month);

    const response = await api.get(`/cash/records?${params.toString()}`);
    return response.data;
}
