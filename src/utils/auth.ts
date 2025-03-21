// Authentication utility functions

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

// Helper function to get user data
export const getUserData = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

// Helper function to get access token
export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

// Helper function to set authentication data
export const setAuthData = (token: string, userData: any) => {
  // Set in localStorage
  localStorage.setItem('access_token', token);
  localStorage.setItem('user', JSON.stringify(userData));
  
  // Set in cookie for middleware
  document.cookie = `access_token=${token}; path=/; max-age=86400`; // 24 hours
};

// Helper function to clear authentication data
export const clearAuthData = () => {
  // Clear localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  
  // Clear cookie
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};
