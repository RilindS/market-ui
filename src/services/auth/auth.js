// src/userService.js

import api from "../axios";

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/user/create', userData);
    return response.data; 
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (loginData) => {
  try {
    const response = await api.post('/user/auth', loginData);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
export const fetchUsers = async (page = 1, size = 50) => {
  try {
    const response = await api.get(`/user/allUsers?page=${page}&size=${size}`);
    return response.data.data.data; 
  } catch (error) {
    console.error("Gabim gjatë marrjes së userave:", error);
    throw error;
  }
};
