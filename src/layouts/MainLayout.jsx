import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar   from "../Components/Navbar";
import Sidebar  from "../Components/Sidebar";
import Tour, { TOUR_KEY } from "../Components/Tour";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tour key is per-user so re-login after clearing storage shows tour again
  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const tourKey = user.userId ? `${TOUR_KEY}_${user.userId}` : TOUR_KEY;

  const [showTour, setShowTour] = useState(
    () => localStorage.getItem(tourKey) !== "true"
  );

  const handleTourDone = () => {
    localStorage.setItem(tourKey, "true");
    setShowTour(false);
  };

  return (
    <div className="layout-root">
      {sidebarOpen && (
        <div className="layout-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="layout-main">
        <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} onStartTour={() => { localStorage.removeItem(tourKey); setShowTour(true); }} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>

      {showTour && <Tour onDone={handleTourDone} />}
    </div>
  );
}

export default MainLayout;
