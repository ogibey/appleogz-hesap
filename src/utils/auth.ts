// Basit şifre hashleme (gerçek uygulamada daha güvenli olmalı)
export const hashPassword = (password: string): string => {
  return btoa(password); // Base64 encoding (demo için)
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return btoa(password) === hash;
};

export const setPassword = (password: string): void => {
  const hashedPassword = hashPassword(password);
  localStorage.setItem('appleogz_password', hashedPassword);
};

export const checkPassword = (password: string): boolean => {
  const storedHash = localStorage.getItem('appleogz_password');
  if (!storedHash) return false;
  return verifyPassword(password, storedHash);
};

export const isPasswordSet = (): boolean => {
  return localStorage.getItem('appleogz_password') !== null;
};
