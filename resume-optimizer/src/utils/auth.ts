// src/utils/auth.ts
export const getAuthToken = () => localStorage.getItem('token');

export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};