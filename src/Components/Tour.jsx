import { useState, useEffect } from "react";

const TOUR_KEY = "lms_tour_done";

const steps = [
  {
    target: "tour-dashboard",
    title: "👋 Welcome to LicenseMS!",
    desc:  "This is your Dashboard — a quick overview of all your clients, licenses, and recent activity at a glance.",
    icon:  "fa-solid fa-gauge",
  },
  {
    target: "tour-clients",
    title: "👥 Manage Clients",
    desc:  "Go to Clients to add new employees, edit their details, search by name, or remove them from the system.",
    icon:  "fa-solid fa-users",
  },
  {
    target: "tour-products",
    title: "📦 Manage Products",
    desc:  "Products lets you register software products and versions that licenses can be assigned to.",
    icon:  "fa-solid fa-box",
  },
  {
    target: "tour-licenses",
    title: "🔑 Track Licenses",
    desc:  "Licenses lets you generate, renew, edit, revoke, delete and validate software licenses.",
    icon:  "fa-solid fa-key",
  },
  {
    target: "tour-profile",
    title: "👤 Your Profile",
    desc:  "Update your personal details like name, phone, department and location from the Profile page.",
    icon:  "fa-solid fa-user",
  },
  {
    target: "tour-settings",
    title: "⚙️ Settings",
    desc:  "Switch themes, manage your account, restart the tour, or sign out from the Settings page.",
    icon:  "fa-solid fa-gear",
  },
  {
    target: "tour-navbar-theme",
    title: "🌙 Quick Theme Switch",
    desc:  "Use this button in the top bar to instantly toggle between Light Mode and Dark Mode.",
    icon:  "fa-solid fa-moon",
  },
];

function Tour({ onDone }) {
  const [step, setStep] = useState(0);
  const [pos,  setPos]  = useState({ top: 0, left: 0, width: 0, height: 0 });

  const current = steps[step];

  useEffect(() => {
    const el = document.getElementById(current.target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height });
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [step, current.target]);

  const finish = () => {
    localStorage.setItem(TOUR_KEY, "true");
    onDone();
  };

  const isLast = step === steps.length - 1;

  /* Position the popover smartly */
  const PAD = 16;
  const popW = 300;
  const popH = 190;
  const viewW = window.innerWidth;

  let popLeft = pos.left + pos.width / 2 - popW / 2;
  let popTop  = pos.top + pos.height + PAD;
  if (popLeft + popW > viewW - 8) popLeft = viewW - popW - 8;
  if (popLeft < 8) popLeft = 8;

  return (
    <>
      {/* Dimmed overlay with cutout */}
      <div className="tour-overlay" onClick={finish} />

      {/* Highlighted element ring */}
      <div
        className="tour-spotlight"
        style={{
          top:    pos.top    - 6,
          left:   pos.left   - 6,
          width:  pos.width  + 12,
          height: pos.height + 12,
        }}
      />

      {/* Popover card */}
      <div
        className="tour-pop"
        style={{ top: popTop, left: popLeft, width: popW }}
      >
        <div className="tour-pop-icon">
          <i className={current.icon} />
        </div>
        <div className="tour-pop-body">
          <p className="tour-pop-title">{current.title}</p>
          <p className="tour-pop-desc">{current.desc}</p>
        </div>

        <div className="tour-pop-footer">
          <div className="tour-dots">
            {steps.map((_, i) => (
              <span key={i} className={`tour-dot${i === step ? " tour-dot--on" : ""}`} />
            ))}
          </div>
          <div className="tour-btns">
            <button className="tour-skip" onClick={finish}>Skip</button>
            <button
              className="tour-next"
              onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
            >
              {isLast ? "Got it! 🎉" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export { TOUR_KEY };
export default Tour;
