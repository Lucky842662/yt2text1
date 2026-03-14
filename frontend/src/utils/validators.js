export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validateYouTubeUrl = (url) => {
  const pattern =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/).+/;
  return pattern.test(url.trim());
};

export const validatePassword = (password) => {
  if (!password || password.length < 6)
    return 'Password must be at least 6 characters';
  return null;
};

export const validateName = (name) => {
  if (!name || !name.trim()) return 'Name is required';
  if (name.trim().length > 50) return 'Name is too long';
  return null;
};
