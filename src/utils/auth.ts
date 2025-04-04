// Authentication utility functions

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  // Check both localStorage and cookies
  const localStorageToken = localStorage.getItem('auth-token');
  const cookieToken = document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1];
  return !!(localStorageToken || cookieToken);
};

// Helper function to get user data
export const getUserData = () => {
  const userData = localStorage.getItem('user-metadata');
  return userData ? JSON.parse(userData) : null;
};

// Helper function to get access token
export const getAccessToken = () => {
  return localStorage.getItem('auth-token');
};

// Helper function to set authentication data
export const setAuthData = (token: string, userData: any) => {
  // Set in localStorage
  localStorage.setItem('auth-token', token);
  localStorage.setItem('user-metadata', JSON.stringify(userData));

  // Set in cookie for middleware
  document.cookie = `auth-token=${token}; path=/; max-age=86400`;
  document.cookie = `user-metadata=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400`;
};

// Helper function to clear authentication data
export const clearAuthData = () => {
  localStorage.removeItem('auth-token');
  localStorage.removeItem('user-metadata');

  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'user-metadata=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// Helper function to get user email
export const getUserEmail = () => {
  const userData = getUserData();
  return userData?.email || null;
};
