import { createContext, useContext, useState, useCallback } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(
    () => localStorage.getItem("lms_theme") === "dark"
  );
  const [toasts, setToasts] = useState([]);

  const toggleTheme = () => {
    setDark((d) => {
      const next = !d;
      localStorage.setItem("lms_theme", next ? "dark" : "light");
      return next;
    });
  };

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme, addToast }}>
      <div className={dark ? "lms-dark" : "lms-light"}>
        {children}
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast--${t.type}`}>
              <i className={`toast-icon fa-solid ${
                t.type === "success" ? "fa-circle-check"        :
                t.type === "error"   ? "fa-circle-xmark"        :
                t.type === "warning" ? "fa-triangle-exclamation":
                "fa-circle-info"
              }`} />
              <span className="toast-msg">{t.message}</span>
              <button className="toast-close" onClick={() => removeToast(t.id)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
