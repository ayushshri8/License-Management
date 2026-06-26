import { useEffect, useState } from "react";
import "../../MockAPI/Clients";                    // mock handlers register karo
import { apiCall }   from "../../MockAPI/apiCall";
import { ENDPOINTS } from "../../MockAPI/endpoints";
import Tooltip       from "../../Components/Tooltip";
import { useTheme }  from "../../Components/ThemeContext";

const EMPTY_FORM = {
  employeeName: "",
  designation: "",
  contactNumber: "",
  email: "",
  department: "",
};

const avatarColors = ["#4f46e5", "#7c3aed", "#0891b2", "#059669", "#d97706", "#e11d48"];
const getColor   = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];
const initials   = (name = "") => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const DESIGNATIONS = ["All", "Software Engineer", "HR", "Ui/Ux Designer", "Manager", "Analyst"];

function ClientsPage() {
  const { addToast } = useTheme();
  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterDes,  setFilterDes]  = useState("All");
  const [modal,      setModal]      = useState(false);   // add/edit modal
  const [editTarget, setEditTarget] = useState(null);    // null = add, obj = edit
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [confirmId,  setConfirmId]  = useState(null);    // delete confirm

  const load = async () => {
    setLoading(true);
    const res = await apiCall("GET", ENDPOINTS.CLIENTS.GET_ALL);
    if (res.success) setClients(res.data);
    else addToast("Failed to load clients. Please refresh.", "error");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  /* ── derived list ── */
  const displayed = clients
    .filter((c) => filterDes === "All" || c.designation === filterDes)
    .filter((c) =>
      [c.employeeName, c.email, c.department, c.designation]
        .join(" ").toLowerCase().includes(search.toLowerCase())
    );

  /* ── modal helpers ── */
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (client) => {
    setEditTarget(client);
    setForm({
      employeeName:  client.employeeName,
      designation:   client.designation,
      contactNumber: client.contactNumber,
      email:         client.email,
      department:    client.department,
    });
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditTarget(null); };

  /* ── save (create / update) ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editTarget) {
      const res = await apiCall("PUT", ENDPOINTS.CLIENTS.UPDATE(editTarget.clientId), form);
      addToast(res.success
        ? `✅ ${form.employeeName}'s details updated successfully.`
        : res.statusCode === 404 ? `Client not found.` : "Could not update client. Please try again.",
        res.success ? "success" : "error");
    } else {
      const res = await apiCall("POST", ENDPOINTS.CLIENTS.CREATE, form);
      addToast(res.success
        ? `🎉 ${form.employeeName} has been added as a new client.`
        : res.statusCode === 409 ? `A client with this email already exists.`
        : res.statusCode === 400 ? `Please fill in all required fields.`
        : "Could not create client. Please try again.",
        res.success ? "success" : "error");
    }
    setSaving(false);
    closeModal();
    load();
  };

  /* ── delete ── */
  const handleDelete = async () => {
    const res = await apiCall("DELETE", ENDPOINTS.CLIENTS.DELETE(confirmId));
    addToast(res.success ? "🗑️ Client has been removed from the system." : "Could not delete client. Please try again.", res.success ? "success" : "error");
    setConfirmId(null);
    load();
  };

  /* ── filter pill click ── */
  const handleFilter = async (des) => {
    setFilterDes(des);
    if (des !== "All") {
      setLoading(true);
      const res = await apiCall("GET", ENDPOINTS.CLIENTS.FILTER(des));
      if (res.success) setClients(res.data);
      setLoading(false);
    } else {
      load();
    }
  };

  return (
    <div className="cp-page">

      {/* ── Header ── */}
      <div className="cp-header">
        <div>
          <h2 className="cp-title">Clients</h2>
          <p className="cp-sub">{clients.length} {clients.length === 1 ? "client" : "clients"} registered</p>
        </div>
        <Tooltip text="Add Client" position="bottom">
          <button className="cp-add-btn" onClick={openAdd}>
            <i className="fa-solid fa-plus" /> Add Client
          </button>
        </Tooltip>
      </div>

      {/* ── Toolbar ── */}
      <div className="cp-toolbar">
        {/* Search */}
        <div className="cp-search-wrap">
          <i className="fa-solid fa-magnifying-glass cp-search-icon" />
          <input
            className="cp-search"
            placeholder="Search by name, email, department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <Tooltip text="Clear" position="bottom">
              <button className="cp-search-clear" onClick={() => setSearch("")}>
                <i className="fa-solid fa-xmark" />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Filter dropdown */}
        <div className="cp-filter-wrap">
          <i className="fa-solid fa-filter cp-filter-icon" />
          <select
            className="cp-filter-select"
            value={filterDes}
            onChange={(e) => handleFilter(e.target.value)}
          >
            {DESIGNATIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <i className="fa-solid fa-chevron-down cp-filter-chevron" />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="cp-table-wrap">
        {loading ? (
          <div className="cp-empty">
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 22, color: "#4f46e5" }} />
            <span>Loading clients…</span>
          </div>
        ) : displayed.length === 0 ? (
          <div className="cp-empty">
            <i className="fa-solid fa-users-slash" style={{ fontSize: 32, color: "#d1d5db" }} />
            <strong>No clients found</strong>
            <span style={{ fontSize: 12 }}>{search ? `No results for "${search}" — try a different keyword.` : "No clients match the selected filter."}</span>
          </div>
        ) : (
          <table className="cp-table">
            <thead>
              <tr>
                {["Client", "Designation", "Department", "Email", "Contact", "Actions"].map((h) => (
                  <th key={h} className="cp-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((c) => (
                <tr key={c.clientId} className="cp-tr">
                  <td className="cp-td">
                    <div className="cp-client-cell">
                      <div className="cp-avatar" style={{ background: getColor(c.employeeName) }}>
                        {initials(c.employeeName)}
                      </div>
                      <div>
                        <div className="cp-name">{c.employeeName}</div>
                        <div className="cp-id">#{c.clientId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="cp-td">
                    <span className="cp-badge">{c.designation}</span>
                  </td>
                  <td className="cp-td">{c.department}</td>
                  <td className="cp-td">
                    <a href={`mailto:${c.email}`} className="cp-email">{c.email}</a>
                  </td>
                  <td className="cp-td">{c.contactNumber}</td>
                  <td className="cp-td">
                    <div className="cp-actions">
                      <Tooltip text="Edit" position="top">
                        <button className="cp-icon-btn cp-edit-btn" onClick={() => openEdit(c)}>
                          <i className="fa-solid fa-pen-to-square" />
                        </button>
                      </Tooltip>
                      <Tooltip text="Delete" position="top">
                        <button className="cp-icon-btn cp-del-btn" onClick={() => setConfirmId(c.clientId)}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div className="cp-overlay" onClick={closeModal}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3>{editTarget ? "Edit Client" : "Add New Client"}</h3>
              <button className="cp-modal-close" onClick={closeModal}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSave} className="cp-modal-form">
              {[
                { label: "Employee Name",  name: "employeeName",  type: "text",  icon: "fa-solid fa-user",         placeholder: "Full name" },
                { label: "Email",          name: "email",         type: "email", icon: "fa-regular fa-envelope",   placeholder: "email@company.com" },
                { label: "Contact Number", name: "contactNumber", type: "text",  icon: "fa-solid fa-phone",        placeholder: "e.g. 9876543210" },
                { label: "Department",     name: "department",    type: "text",  icon: "fa-solid fa-building",     placeholder: "e.g. Analytics" },
              ].map((f) => (
                <div key={f.name} className="cp-field">
                  <label className="cp-label">{f.label}</label>
                  <div className="cp-input-wrap">
                    <i className={`${f.icon} cp-input-icon`} />
                    <input
                      type={f.type}
                      className="cp-input"
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      required
                    />
                  </div>
                </div>
              ))}

              {/* Designation select */}
              <div className="cp-field">
                <label className="cp-label">Designation</label>
                <div className="cp-input-wrap">
                  <i className="fa-solid fa-briefcase cp-input-icon" />
                  <select
                    className="cp-input cp-select"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    required
                  >
                    <option value="">Select designation</option>
                    {DESIGNATIONS.filter((d) => d !== "All").map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="cp-modal-footer">
                <Tooltip text="Cancel" position="top">
                  <button type="button" className="cp-cancel-btn" onClick={closeModal}>Cancel</button>
                </Tooltip>
                <Tooltip text={editTarget ? "Update" : "Create"} position="top">
                <button type="submit" className="cp-save-btn" disabled={saving}>
                  {saving
                    ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
                    : <><i className="fa-solid fa-check" /> {editTarget ? "Update" : "Create"}</>
                  }
                </button>
                </Tooltip>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {confirmId && (
        <div className="cp-overlay" onClick={() => setConfirmId(null)}>
          <div className="cp-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="cp-confirm-icon">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <h4 className="cp-confirm-title">Delete Client?</h4>
            <p className="cp-confirm-sub">This action cannot be undone.</p>
            <div className="cp-confirm-btns">
              <Tooltip text="Cancel" position="top">
                <button className="cp-cancel-btn" onClick={() => setConfirmId(null)}>Cancel</button>
              </Tooltip>
              <Tooltip text="Delete" position="top">
              <button className="cp-delete-confirm-btn" onClick={handleDelete}>
                <i className="fa-solid fa-trash" /> Delete
              </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ClientsPage;
