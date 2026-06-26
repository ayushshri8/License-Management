import { useState } from "react";
import { useTheme }  from "../../Components/ThemeContext";
import useUser       from "../../Components/useUser";
import Tooltip       from "../../Components/Tooltip";

const PROFILE_KEY = "lms_profile";

const defaultProfile = {
  name:       "Admin User",
  email:      "admin@company.com",
  phone:      "+91 98765 43210",
  role:       "Administrator",
  department: "IT & Operations",
  location:   "Mumbai, India",
  joined:     "January 2023",
};

const fields = [
  { key: "name",       label: "Full Name",  icon: "fa-solid fa-user",         type: "text"  },
  { key: "email",      label: "Email",      icon: "fa-regular fa-envelope",   type: "email" },
  { key: "phone",      label: "Phone",      icon: "fa-solid fa-phone",        type: "text"  },
  { key: "department", label: "Department", icon: "fa-solid fa-building",     type: "text"  },
  { key: "location",   label: "Location",   icon: "fa-solid fa-location-dot", type: "text"  },
];

function validate(draft) {
  const e = {};
  if (!draft.name.trim())                 e.name       = "Name is required.";
  if (!/\S+@\S+\.\S+/.test(draft.email)) e.email      = "Enter a valid email.";
  if (!draft.phone.trim())               e.phone      = "Phone is required.";
  if (!draft.department.trim())          e.department = "Department is required.";
  if (!draft.location.trim())            e.location   = "Location is required.";
  return e;
}

function ProfilePage() {
  const { addToast } = useTheme();
  const loggedUser   = useUser();

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      ...defaultProfile,
      name:  loggedUser.name  || defaultProfile.name,
      email: loggedUser.email || defaultProfile.email,
      role:  loggedUser.role  || defaultProfile.role,
    };
  });

  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(profile);
  const [errors,  setErrors]  = useState({});

  const handleEdit   = () => { setDraft(profile); setErrors({}); setEditing(true); };
  const handleCancel = () => { setEditing(false); setErrors({}); };

  const handleSave = () => {
    const e = validate(draft);
    if (Object.keys(e).length) {
      setErrors(e);
      addToast("Please fix the errors before saving.", "error");
      return;
    }
    setProfile(draft);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(draft));
    setEditing(false);
    setErrors({});
    addToast("Profile updated successfully!", "success");
  };

  const avatar = profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="pf-page">

      {/* Hero */}
      <div className="pf-hero">
        <div className="pf-avatar-wrap">
          <div className="pf-avatar">{avatar}</div>
          <div className="pf-avatar-badge">
            <i className="fa-solid fa-shield-halved" />
          </div>
        </div>
        <div className="pf-hero-info">
          <h2 className="pf-hero-name">{profile.name}</h2>
          <p className="pf-hero-role">{profile.role} · {profile.department}</p>
          <p className="pf-hero-meta">
            <i className="fa-solid fa-location-dot" /> {profile.location}
            <span className="pf-sep" />
            <i className="fa-regular fa-calendar" /> Joined {profile.joined}
          </p>
        </div>
        <button
          className={`pf-hero-btn${editing ? " pf-hero-btn--cancel" : ""}`}
          onClick={editing ? handleCancel : handleEdit}
        >
          <i className={`fa-solid ${editing ? "fa-xmark" : "fa-pen-to-square"}`} />
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Personal Details Card */}
      <div className="pf-card">
        <div className="pf-card-header">
          <div className="pf-card-icon-wrap">
            <i className="fa-solid fa-id-card" />
          </div>
          <h3 className="pf-card-title">Personal Details</h3>
        </div>

        <div className="pf-fields-grid">
          {fields.map((f, idx) => (
            <div
              key={f.key}
              className={`pf-field${idx === fields.length - 1 && fields.length % 2 !== 0 ? " pf-field--full" : ""}`}
            >
              <label className="pf-label">
                <i className={f.icon} /> {f.label}
              </label>
              {editing ? (
                <>
                  <input
                    type={f.type}
                    className={`pf-input${errors[f.key] ? " pf-input--err" : ""}`}
                    value={draft[f.key]}
                    onChange={(e) => {
                      setDraft({ ...draft, [f.key]: e.target.value });
                      setErrors({ ...errors, [f.key]: "" });
                    }}
                  />
                  {errors[f.key] && (
                    <span className="pf-err-msg">
                      <i className="fa-solid fa-circle-exclamation" /> {errors[f.key]}
                    </span>
                  )}
                </>
              ) : (
                <p className="pf-value">{profile[f.key]}</p>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div className="pf-form-actions">
            <Tooltip text="Cancel" position="top">
              <button className="pf-cancel-btn" onClick={handleCancel}>
                <i className="fa-solid fa-xmark" /> Cancel
              </button>
            </Tooltip>
            <Tooltip text="Save" position="top">
              <button className="pf-save-btn" onClick={handleSave}>
                <i className="fa-solid fa-check" /> Save Changes
              </button>
            </Tooltip>
          </div>
        )}
      </div>

    </div>
  );
}

export default ProfilePage;
