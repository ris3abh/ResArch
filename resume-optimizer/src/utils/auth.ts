// src/utils/auth.ts
const TOKEN_KEY = 'auth_token'; // Add this constant to ensure consistency

export const getAuthToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  console.log('Retrieved token:', token);
  return token;
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};