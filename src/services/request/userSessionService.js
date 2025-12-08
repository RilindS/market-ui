import api from "../axios";

// Log out
export const logoutUser = async (userId) => {
  try {
    const response = await api.post("/user-session/logout", null, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Get work time for current user
export const getUserWorkTime = async (userId, date) => {
  try {
    const response = await api.get("/user-session/user/worktime", {
      params: { userId, date }
    });
    return response.data;
  } catch (error) {
    console.error("Get user work time error:", error);
    throw error;
  }
};

// Get work time for all users (admin)
export const getAllUsersWorkTime = async (date) => {
  try {
    const response = await api.get("/user-session/admin/worktime", {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error("Get all users work time error:", error);
    throw error;
  }
};

export const getUserSessions = async (userId, startDate, endDate) => {
  try {
    const response = await api.get("/user-session/admin/user-sessions", {
      params: { userId, startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error("Get user sessions error:", error);
    throw error;
  }
};

