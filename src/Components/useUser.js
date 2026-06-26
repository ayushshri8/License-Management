// reads the user that was stored at login
const useUser = () => {
  const raw = localStorage.getItem("user");
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
};

export default useUser;
