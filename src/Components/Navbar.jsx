import Tooltip    from "./Tooltip";
import { useTheme } from "./ThemeContext";
import useUser      from "./useUser";

const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

function Navbar({ onMenuClick }) {
  const { dark, toggleTheme, addToast } = useTheme();
  const user = useUser();

  const displayName = user.name || "Admin User";
  const displayRole = user.role || "Administrator";

  const handleLogout = () => {
    alert("Are you sure you want to sign out?");
    addToast("You have been signed out. See you soon! 👋");
    setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/";
    }, 900);
  };

  return (
    <nav className="lms-navbar">
      <div className="lms-navbar-left">
        <Tooltip text="Menu" position="bottom">
          <button className="lms-hamburger" onClick={onMenuClick}>
            <i className="fa-solid fa-bars" />
          </button>
        </Tooltip>
        {/* <span className="lms-navbar-title">License Management System</span> */}
      </div>

      <div className="lms-navbar-right">
        <Tooltip text={dark ? "Light Mode" : "Dark Mode"} position="bottom">
          <button
            id="tour-navbar-theme"
            className="lms-theme-btn"
            onClick={() => {
              toggleTheme();
              addToast(`Switched to ${dark ? "Light" : "Dark"} Mode`, "info");
            }}
          >
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
          </button>
        </Tooltip>

        <div className="lms-navbar-divider" />

        <Tooltip text={displayName} position="bottom">
          <div className="lms-navbar-user">
            <div className="lms-navbar-avatar">{initials(displayName)}</div>
            <div className="lms-navbar-user-text">
              <div className="lms-navbar-name">{displayName}</div>
              <div className="lms-navbar-role">{displayRole}</div>
            </div>
          </div>
        </Tooltip>

        <div className="lms-navbar-divider" />

        <Tooltip text="Logout" position="bottom">
          <button className="lms-logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-power-off" />
            {/* <span className="lms-logout-text">Logout</span> */}
          </button>
        </Tooltip>
      </div>
    </nav>
  );
}

export default Navbar;
