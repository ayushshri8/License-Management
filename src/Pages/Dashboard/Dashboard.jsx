import { useNavigate } from "react-router-dom";
import useUser from "../../Components/useUser";

const avatarColors = ["#6b7a5e","#4a5240","#8a9a6e","#9a6e2e","#2e6b8a"];
const getColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];
const initials = (name = "") => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

function Dashboard() {
  const navigate  = useNavigate();
  const user      = useUser();
  const firstName = (user.name || "Admin").split(" ")[0];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    {
      label: "Total Clients",
      value: "150",
      icon: "fa-solid fa-users",
      gradient: "linear-gradient(135deg, #6b7a5e, #4a5240)",
      shadow: "rgba(74,82,64,0.35)",
      change: "+12 this month", changeUp: true,
    },
    {
      label: "Total Licenses",
      value: "320",
      icon: "fa-solid fa-key",
      gradient: "linear-gradient(135deg, #4a5240, #2e3328)",
      shadow: "rgba(46,51,40,0.4)",
      change: "+8 this month", changeUp: true,
    },
    {
      label: "Active Licenses",
      value: "290",
      icon: "fa-solid fa-circle-check",
      gradient: "linear-gradient(135deg, #4a7c59, #2d5a3d)",
      shadow: "rgba(74,124,89,0.35)",
      change: "90.6% of total", changeUp: true,
    },
    {
      label: "Expired Licenses",
      value: "30",
      icon: "fa-solid fa-circle-xmark",
      gradient: "linear-gradient(135deg, #9a6e2e, #7a5520)",
      shadow: "rgba(154,110,46,0.35)",
      change: "9.4% of total", changeUp: false,
    },
  ];

  const recentActivity = [
    { name: "Alice Johnson",  action: "License Renewed",   time: "09:41 AM",  status: "success", icon: "fa-solid fa-rotate-right"     },
    { name: "Bob Martinez",   action: "New License Added",  time: "08:15 AM",  status: "info",    icon: "fa-solid fa-key"               },
    { name: "Carol White",    action: "License Expired",    time: "Yesterday", status: "warning", icon: "fa-solid fa-circle-xmark"      },
    { name: "David Lee",      action: "Profile Updated",    time: "Yesterday", status: "purple",  icon: "fa-solid fa-user-pen"          },
    { name: "Priya Kapoor",   action: "Client Added",       time: "2 days ago",status: "teal",    icon: "fa-solid fa-user-plus"         },
  ];

  const statusMap = {
    success: { color: "#4a7c59", bg: "#edf7f1", label: "Renewed"  },
    info:    { color: "#2e6b8a", bg: "#edf4f7", label: "New"      },
    warning: { color: "#9a6e2e", bg: "#fdf7ed", label: "Expired"  },
    purple:  { color: "#6b7a5e", bg: "#f0f4ec", label: "Updated"  },
    teal:    { color: "#4a5240", bg: "#dde8cc", label: "Added"    },
  };

  const quickActions = [
    { label: "Add New Client",    icon: "fa-solid fa-user-plus",  color: "#4a5240", bg: "#dde8cc", path: "/clients"  },
    { label: "Generate License",  icon: "fa-solid fa-key",        color: "#6b7a5e", bg: "#e8f0dc", path: "/licenses" },
    { label: "View All Licenses", icon: "fa-solid fa-list-check", color: "#4a7c59", bg: "#edf7f1", path: "/licenses" },
    { label: "Settings",          icon: "fa-solid fa-gear",       color: "#9a6e2e", bg: "#fdf7ed", path: "/profile"  },
  ];

  return (
    <div className="db-page">

      {/* ── Top Header ── */}
      <div className="db-header">
        <div className="db-header-left">
          <div className="db-greeting-badge">
            <i className="fa-solid fa-sun" />
            <span>{greeting}</span>
          </div>
          <h2 className="db-title">
            Welcome back, <span className="db-title-name">{firstName}</span>! 👋
          </h2>
          <p className="db-sub">Here's what's happening with your licenses today.</p>
        </div>
        <div className="db-header-right">
          <div className="db-date-card">
            <i className="fa-regular fa-calendar" style={{ color: "#6b7a5e" }} />
            <div>
              <p className="db-date-day">
                {new Date().toLocaleDateString("en-US", { weekday: "long" })}
              </p>
              <p className="db-date-full">
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="db-stats">
        {stats.map((s) => (
          <div key={s.label} className="db-stat-card">
            <div className="db-stat-left">
              <p className="db-stat-label">{s.label}</p>
              <h3 className="db-stat-value">{s.value}</h3>
              {/* <div className={`db-stat-change${s.changeUp ? "" : " db-stat-change--down"}`}>
                <i className={`fa-solid fa-arrow-trend-${s.changeUp ? "up" : "down"}`} />
                <span>{s.change}</span>
              </div> */}
            </div>
            <div
              className="db-stat-icon"
              style={{ background: s.gradient, boxShadow: `0 8px 20px ${s.shadow}` }}
            >
              <i className={s.icon} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom Grid ── */}
      <div className="db-bottom">

        {/* Recent Activity */}
        <div className="db-panel">
          <div className="db-panel-header">
            <div className="db-panel-icon" style={{ background: "#dde8cc", color: "#4a5240" }}>
              <i className="fa-solid fa-clock-rotate-left" />
            </div>
            <div>
              <h4 className="db-panel-title">Recent Activity</h4>
              <p className="db-panel-sub">Latest actions across the system</p>
            </div>
          </div>

          <div className="db-activity-list">
            {recentActivity.map((a, i) => {
              const s = statusMap[a.status];
              return (
                <div key={i} className="db-activity-row">
                  <div className="db-activity-avatar" style={{ background: getColor(a.name) }}>
                    {initials(a.name)}
                  </div>
                  <div className="db-activity-body">
                    <span className="db-activity-name">{a.name}</span>
                    <span className="db-activity-action">{a.action}</span>
                  </div>
                  <div className="db-activity-meta">
                    <span className="db-activity-chip" style={{ color: s.color, background: s.bg }}>
                      <i className={a.icon} style={{ fontSize: 10 }} /> {s.label}
                    </span>
                    <span className="db-activity-time">{a.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="db-right-col">

          {/* Quick Actions */}
          <div className="db-panel">
            <div className="db-panel-header">
              <div className="db-panel-icon" style={{ background: "#fdf7ed", color: "#9a6e2e" }}>
                <i className="fa-solid fa-bolt" />
              </div>
              <div>
                <h4 className="db-panel-title">Quick Actions</h4>
                <p className="db-panel-sub">Jump to common tasks</p>
              </div>
            </div>

            <div className="db-quick-grid">
              {quickActions.map((q) => (
                <button key={q.label} className="db-quick-tile" onClick={() => navigate(q.path)}>
                  <div className="db-quick-tile-icon" style={{ background: q.bg, color: q.color }}>
                    <i className={q.icon} />
                  </div>
                  <span className="db-quick-tile-label">{q.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* System Overview */}
          <div className="db-panel">
            <div className="db-panel-header">
              <div className="db-panel-icon" style={{ background: "#edf7f1", color: "#4a7c59" }}>
                <i className="fa-solid fa-chart-pie" />
              </div>
              <div>
                <h4 className="db-panel-title">License Overview</h4>
                <p className="db-panel-sub">Status distribution</p>
              </div>
            </div>

            <div className="db-overview-list">
              {[
                { label: "Active",  value: 290, total: 320, color: "#4a7c59", bg: "#edf7f1" },
                { label: "Expired", value: 30,  total: 320, color: "#9a6e2e", bg: "#fdf7ed" },
                { label: "Revoked", value: 0,   total: 320, color: "#c0392b", bg: "#fdf2f2" },
              ].map((item) => (
                <div key={item.label} className="db-overview-row">
                  <div className="db-overview-left">
                    <span className="db-overview-dot" style={{ background: item.color }} />
                    <span className="db-overview-label">{item.label}</span>
                  </div>
                  <div className="db-overview-bar-wrap">
                    <div className="db-overview-bar-track">
                      <div
                        className="db-overview-bar-fill"
                        style={{
                          width: `${item.total ? (item.value / item.total) * 100 : 0}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>
                  <span className="db-overview-count" style={{ color: item.color, background: item.bg }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
