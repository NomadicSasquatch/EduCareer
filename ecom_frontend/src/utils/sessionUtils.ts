export const saveUserToSession = (user: any) => {
  sessionStorage.setItem("user", JSON.stringify(user));
};

export const getUserFromSession = (): any | null => {
  const user = sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const clearSession = () => {
  sessionStorage.clear();
};
