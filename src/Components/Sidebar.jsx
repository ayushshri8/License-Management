import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Tooltip  from "./Tooltip";
import useUser  from "./useUser";
import { useTheme } from "./ThemeContext";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "fa-solid fa-gauge",   tip: "Dashboard", tourId: "tour-dashboard" },
  { name: "Clients",   path: "/clients",   icon: "fa-solid fa-users",   tip: "Clients",   tourId: "tour-clients"   },
  { name: "Products",  path: "/products",  icon: "fa-solid fa-box",     tip: "Products",  tourId: "tour-products"  },
  { name: "Licenses",  path: "/licenses",  icon: "fa-solid fa-key",     tip: "Licenses",  tourId: "tour-licenses"  },
  { name: "Profile",   path: "/profile",   icon: "fa-solid fa-user",    tip: "Profile",   tourId: "tour-profile"   },
  // { name: "Settings",  path: "/settings",  icon: "fa-solid fa-gear",    tip: "Settings",  tourId: "tour-settings"  },
];

const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

function Sidebar({ open, onClose }) {
  const user     = useUser();
  const navigate = useNavigate();
  const { addToast } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSettings = () => {
    setMenuOpen(false);
    onClose();
    navigate("/settings");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    addToast("You have been signed out. See you soon! 👋", "info");
    setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/";
    }, 900);
  };

  const displayName = user.name  || "Admin User";
  const displayRole = user.role  || "Administrator";
  const avatar      = initials(displayName);

  return (
    <aside className={`lms-sidebar${open ? " lms-sidebar--open" : ""}`}>

      {/* Brand */}
      <div className="lms-brand">
        <div className="lms-brand-icon">
          <i className="fa-solid fa-shield-halved" />
        </div>
        <span className="lms-brand-name">LicenseMS</span>
        <Tooltip text="Close" position="bottom">
          <button className="lms-sidebar-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </Tooltip>
      </div>

      <p className="lms-menu-label">MAIN MENU</p>

      {/* Nav links */}
      <nav className="lms-nav">
        {menuItems.map((item) => (
          <Tooltip key={item.path} text={item.tip} position="right">
            <NavLink
              id={item.tourId}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `lms-link${isActive ? " lms-link--active" : ""}`
              }
            >
              <span className="lms-link-icon">
                <i className={item.icon} />
              </span>
              <span>{item.name}</span>
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      {/* User footer */}
      <div className="lms-user" ref={menuRef}>
        <div className="lms-user-avatar">{avatar}</div>
        <div className="lms-user-info">
          <span className="lms-user-name">{displayName}</span>
          <span className="lms-user-role">{displayRole}</span>
        </div>

        <Tooltip text="More options" position="top">
          <button
            className="lms-user-more-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="More options"
          >
            <i className="fa-solid fa-ellipsis" />
          </button>
        </Tooltip>

        {/* Dropdown */}
        {menuOpen && (
          <div className="lms-user-dropdown">
            <div className="lms-user-dropdown-header">
              <p className="lms-user-dropdown-name">{displayName}</p>
              <p className="lms-user-dropdown-email">{user.email || "admin@company.com"}</p>
            </div>
            <div className="lms-user-dropdown-divider" />
            <button className="lms-user-dropdown-item" onClick={handleSettings}>
              <i className="fa-solid fa-gear" />
              <span>Settings & Profile</span>
            </button>
            <div className="lms-user-dropdown-divider" />
            <button className="lms-user-dropdown-item lms-user-dropdown-item--danger" onClick={handleLogout}>
              <i className="fa-solid fa-power-off" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

    </aside>
  );
}

export default Sidebar;
