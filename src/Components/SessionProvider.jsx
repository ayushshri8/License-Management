import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSessionManager from "./useSessionManager";
import { useTheme } from "./ThemeContext";

function SessionProvider({ children }) {
  const navigate     = useNavigate();
  const { addToast } = useTheme();
  const isLoggedIn   = !!localStorage.getItem("isLoggedIn");

  const [showWarning, setShowWarning] = useState(false);
  const [countdown,   setCountdown]   = useState(120); // 2 min remaining
  const tickRef = useRef(null);

  const startCountdown = useCallback(() => {
    setCountdown(120);
    clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(tickRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  }, []);

  const handleWarn = useCallback(() => {
    setShowWarning(true);
    startCountdown();
  }, [startCountdown]);

  const handleExpire = useCallback(() => {
    clearInterval(tickRef.current);
    setShowWarning(false);
    addToast("Session expired. Please sign in again.", "error");
    setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      navigate("/");
    }, 1000);
  }, [addToast, navigate]);

  const handleStay = () => {
    clearInterval(tickRef.current);
    setShowWarning(false);
    addToast("Session extended.", "success");
  };

  const handleLogoutNow = () => {
    clearInterval(tickRef.current);
    setShowWarning(false);
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  useEffect(() => () => clearInterval(tickRef.current), []);

  useSessionManager({ isLoggedIn, onWarn: handleWarn, onExpire: handleExpire });

  const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
  const ss = String(countdown % 60).padStart(2, "0");

  return (
    <>
      {children}

      {showWarning && (
        <div className="session-overlay">
          <div className="session-modal">
            <div className="session-modal-icon">
              <i className="fa-solid fa-clock" />
            </div>
            <h3 className="session-modal-title">Are you still there?</h3>
            <p className="session-modal-sub">
              No activity detected. You will be signed out in
            </p>
            <div className="session-countdown-text">{mm}:{ss}</div>
            <div className="session-modal-btns">
              <button className="session-btn session-btn--ghost" onClick={handleLogoutNow}>
                Sign Out
              </button>
              <button className="session-btn session-btn--primary" onClick={handleStay}>
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SessionProvider;
