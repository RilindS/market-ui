import api from "../axios";


export const createPurchaseInvoice = async (invoiceData) => {
  //const token = localStorage.getItem("token");
  const response = await api.post("invoices/create", invoiceData, {
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
  });
  return response.data;
};

export const getPurchasesSummary = async (date) => {
  try {
    const response = await api.get("/invoices/summary", {
      params: { date },
    });
    return response.data;
  } catch (error) {
    console.error("Gabim gjatë marrjes së përmbledhjes së blerjeve:", error);
    throw error;
  }
};
