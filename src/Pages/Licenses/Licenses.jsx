import { useEffect, useState } from "react";
import "../../MockAPI/Licenses";
import { apiCall }   from "../../MockAPI/apiCall";
import { ENDPOINTS } from "../../MockAPI/endpoints";
import Tooltip       from "../../Components/Tooltip";
import { useTheme }  from "../../Components/ThemeContext";

const STATUS_COLOR = {
  Active:  { color: "#10b981", bg: "#ecfdf5" },
  Expired: { color: "#f59e0b", bg: "#fffbeb" },
  Revoked: { color: "#ef4444", bg: "#fef2f2" },
};

const LICENSE_TYPES = ["Premium", "Standard", "Enterprise", "Basic", "Trial"];

const EMPTY_GENERATE = { productName: "", employeeName: "", licenseType: "Premium", expiryDays: 365, type: "New", serialNumber: "" };
const EMPTY_EDIT     = { licenseType: "Premium", expiryDays: 365 };
const EMPTY_RENEW    = { expiryDays: 180 };
const EMPTY_REVOKE   = { reason: "" };

function LicensesPage() {
  const { addToast } = useTheme();

  const [licenses,     setLicenses]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [saving,       setSaving]       = useState(false);

  const [genModal,     setGenModal]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [renewTarget,  setRenewTarget]  = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [validateRes,  setValidateRes]  = useState(null);

  const [genForm,    setGenForm]    = useState(EMPTY_GENERATE);
  const [editForm,   setEditForm]   = useState(EMPTY_EDIT);
  const [renewForm,  setRenewForm]  = useState(EMPTY_RENEW);
  const [revokeForm, setRevokeForm] = useState(EMPTY_REVOKE);
  const [errors,     setErrors]     = useState({});

  const load = async () => {
    setLoading(true);
    const res = await apiCall("GET", ENDPOINTS.LICENSES.GET_ALL);
    if (res.success) setLicenses(res.data);
    else addToast("Failed to load licenses.", "error");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const displayed = licenses
    .filter((l) => filterStatus === "All" || l.status === filterStatus)
    .filter((l) =>
      [l.licenseKey, l.productName, l.employeeName, l.licenseType, l.serialNumber]
        .join(" ").toLowerCase().includes(search.toLowerCase())
    );

  // ── Generate ──
  const handleGenerate = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!genForm.productName.trim())  errs.productName  = "Required.";
    if (!genForm.employeeName.trim()) errs.employeeName = "Required.";
    if (!genForm.serialNumber.trim()) errs.serialNumber = "Required.";
    if (!genForm.expiryDays || genForm.expiryDays <= 0) errs.expiryDays = "Must be > 0.";
    if (Object.keys(errs).length) { setErrors(errs); addToast("Please fix the errors.", "error"); return; }

    setSaving(true);
    const res = await apiCall("POST", ENDPOINTS.LICENSES.GENERATE, { ...genForm, expiryDays: Number(genForm.expiryDays) });
    addToast(
      res.success ? `🎉 License ${res.data?.licenseKey} generated!` : res.error?.issue || "Could not generate license.",
      res.success ? "success" : "error"
    );
    setSaving(false);
    if (res.success) { setGenModal(false); setGenForm(EMPTY_GENERATE); setErrors({}); load(); }
  };

  // ── Edit ──
  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await apiCall("PUT", ENDPOINTS.LICENSES.UPDATE(editTarget.licenseId), { ...editForm, expiryDays: Number(editForm.expiryDays) });
    addToast(res.success ? "✅ License updated." : res.error?.issue || "Update failed.", res.success ? "success" : "error");
    setSaving(false);
    if (res.success) { setEditTarget(null); setErrors({}); load(); }
  };

  // ── Renew ──
  const handleRenew = async (e) => {
    e.preventDefault();
    if (!renewForm.expiryDays || renewForm.expiryDays <= 0) { setErrors({ expiryDays: "Must be > 0." }); addToast("Please fix the errors.", "error"); return; }
    setSaving(true);
    const res = await apiCall("PUT", ENDPOINTS.LICENSES.RENEW(renewTarget.licenseId), { expiryDays: Number(renewForm.expiryDays) });
    addToast(res.success ? "✅ License renewed." : res.error?.issue || "Renewal failed.", res.success ? "success" : "error");
    setSaving(false);
    if (res.success) { setRenewTarget(null); setErrors({}); load(); }
  };

  // ── Revoke ──
  const handleRevoke = async (e) => {
    e.preventDefault();
    if (!revokeForm.reason.trim()) { setErrors({ reason: "Reason is required." }); addToast("Please enter a reason.", "error"); return; }
    setSaving(true);
    const res = await apiCall("PUT", ENDPOINTS.LICENSES.REVOKE(revokeTarget.licenseId), revokeForm);
    addToast(res.success ? "⛔ License revoked." : res.error?.issue || "Revoke failed.", res.success ? "success" : "error");
    setSaving(false);
    if (res.success) { setRevokeTarget(null); setErrors({}); load(); }
  };

  // ── Delete ──
  const handleDelete = async () => {
    const res = await apiCall("DELETE", ENDPOINTS.LICENSES.DELETE(deleteTarget.licenseId));
    addToast(res.success ? "🗑️ License deleted." : res.error?.issue || "Delete failed.", res.success ? "success" : "error");
    setDeleteTarget(null);
    load();
  };

  // ── Validate ──
  const handleValidate = async (lic) => {
    const res = await apiCall("GET", ENDPOINTS.LICENSES.VALIDATE(lic.licenseId));
    if (res.success) setValidateRes({ lic, result: res });
    else addToast(res.error?.issue || "Validation failed.", "error");
  };

  const closeAll = () => {
    setGenModal(false); setEditTarget(null); setRenewTarget(null);
    setRevokeTarget(null); setDeleteTarget(null); setValidateRes(null);
    setErrors({});
  };

  return (
    <div className="lp-page">

      {/* Header */}
      <div className="lp-header">
        <div>
          <h2 className="lp-title">Licenses</h2>
          <p className="lp-sub">{licenses.length} {licenses.length === 1 ? "license" : "licenses"} tracked</p>
        </div>
        <Tooltip text="Generate License" position="bottom">
          <button className="lp-add-btn" onClick={() => { setGenForm(EMPTY_GENERATE); setErrors({}); setGenModal(true); }}>
            <i className="fa-solid fa-plus" /> Generate License
          </button>
        </Tooltip>
      </div>

      {/* Toolbar */}
      <div className="lp-toolbar">
        <div className="cp-search-wrap">
          <i className="fa-solid fa-magnifying-glass cp-search-icon" />
          <input
            className="cp-search"
            placeholder="Search by key, product, employee…"
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
        <div className="cp-filters">
          {["All", "Active", "Expired", "Revoked"].map((s) => (
            <button
              key={s}
              className={`cp-filter-pill${filterStatus === s ? " cp-filter-pill--active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="cp-table-wrap">
        {loading ? (
          <div className="cp-empty">
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 22, color: "#4f46e5" }} />
            <span>Loading licenses…</span>
          </div>
        ) : displayed.length === 0 ? (
          <div className="cp-empty">
            <i className="fa-solid fa-key" style={{ fontSize: 32, color: "#d1d5db" }} />
            <strong>No licenses found</strong>
            <span style={{ fontSize: 12 }}>
              {search ? `No results for "${search}"` : "No licenses match the selected filter."}
            </span>
          </div>
        ) : (
          <table className="cp-table">
            <thead>
              <tr>
                {["License Key", "Product", "Employee", "Type", "Serial No.", "Expiry", "Status", "Actions"].map((h) => (
                  <th key={h} className="cp-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((l) => {
                const sc = STATUS_COLOR[l.status] || STATUS_COLOR.Active;
                return (
                  <tr key={l.licenseId} className="cp-tr">
                    <td className="cp-td"><span className="lp-key-badge">{l.licenseKey}</span></td>
                    <td className="cp-td">{l.productName}</td>
                    <td className="cp-td">{l.employeeName}</td>
                    <td className="cp-td"><span className="cp-badge">{l.licenseType}</span></td>
                    <td className="cp-td" style={{ color: "var(--text-muted,#6b7280)", fontSize: 12 }}>{l.serialNumber}</td>
                    <td className="cp-td" style={{ fontSize: 12 }}>{l.expiryDate}</td>
                    <td className="cp-td">
                      <span className="lp-status-badge" style={{ color: sc.color, background: sc.bg }}>{l.status}</span>
                    </td>
                    <td className="cp-td">
                      <div className="cp-actions">
                        <Tooltip text="Validate Expiry" position="top">
                          <button className="cp-icon-btn lp-validate-btn" onClick={() => handleValidate(l)}>
                            <i className="fa-solid fa-circle-check" />
                          </button>
                        </Tooltip>
                        <Tooltip text="Renew" position="top">
                          <button className="cp-icon-btn lp-renew-btn" onClick={() => { setRenewTarget(l); setRenewForm(EMPTY_RENEW); setErrors({}); }}>
                            <i className="fa-solid fa-rotate-right" />
                          </button>
                        </Tooltip>
                        <Tooltip text="Edit" position="top">
                          <button className="cp-icon-btn cp-edit-btn" onClick={() => { setEditTarget(l); setEditForm({ licenseType: l.licenseType, expiryDays: 365 }); setErrors({}); }}>
                            <i className="fa-solid fa-pen-to-square" />
                          </button>
                        </Tooltip>
                        <Tooltip text="Revoke" position="top">
                          <button
                            className="cp-icon-btn lp-revoke-btn"
                            onClick={() => { setRevokeTarget(l); setRevokeForm(EMPTY_REVOKE); setErrors({}); }}
                            disabled={l.status === "Revoked"}
                            style={l.status === "Revoked" ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                          >
                            <i className="fa-solid fa-ban" />
                          </button>
                        </Tooltip>
                        <Tooltip text="Delete" position="top">
                          <button className="cp-icon-btn cp-del-btn" onClick={() => setDeleteTarget(l)}>
                            <i className="fa-solid fa-trash" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Generate Modal ── */}
      {genModal && (
        <div className="cp-overlay" onClick={closeAll}>
          <div className="cp-modal lp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3><i className="fa-solid fa-key" style={{ marginRight: 8, color: "#4f46e5" }} />Generate License</h3>
              <button className="cp-modal-close" onClick={closeAll}><i className="fa-solid fa-xmark" /></button>
            </div>
            <form onSubmit={handleGenerate} className="cp-modal-form">
              <div className="lp-form-grid">
                {[
                  { label: "Product Name",  name: "productName",  icon: "fa-solid fa-box",    placeholder: "e.g. CRM Software" },
                  { label: "Employee Name", name: "employeeName", icon: "fa-solid fa-user",   placeholder: "e.g. Rahul Sharma" },
                  { label: "Serial Number", name: "serialNumber", icon: "fa-solid fa-hashtag", placeholder: "e.g. SER-001" },
                ].map((f) => (
                  <div key={f.name} className="cp-field">
                    <label className="cp-label">{f.label}</label>
                    <div className="cp-input-wrap">
                      <i className={`${f.icon} cp-input-icon`} />
                      <input
                        type="text"
                        className={`cp-input${errors[f.name] ? " pf-input--err" : ""}`}
                        placeholder={f.placeholder}
                        value={genForm[f.name]}
                        onChange={(e) => { setGenForm({ ...genForm, [f.name]: e.target.value }); setErrors({ ...errors, [f.name]: "" }); }}
                      />
                    </div>
                    {errors[f.name] && <span className="pf-err-msg"><i className="fa-solid fa-circle-exclamation" /> {errors[f.name]}</span>}
                  </div>
                ))}

                <div className="cp-field">
                  <label className="cp-label">License Type</label>
                  <div className="cp-input-wrap">
                    <i className="fa-solid fa-tag cp-input-icon" />
                    <select className="cp-input cp-select" value={genForm.licenseType} onChange={(e) => setGenForm({ ...genForm, licenseType: e.target.value })}>
                      {LICENSE_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="cp-field">
                  <label className="cp-label">Type</label>
                  <div className="cp-input-wrap">
                    <i className="fa-solid fa-layer-group cp-input-icon" />
                    <select className="cp-input cp-select" value={genForm.type} onChange={(e) => setGenForm({ ...genForm, type: e.target.value })}>
                      {["New", "Renewal", "Upgrade"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="cp-field">
                  <label className="cp-label">Expiry Days</label>
                  <div className="cp-input-wrap">
                    <i className="fa-solid fa-calendar-days cp-input-icon" />
                    <input
                      type="number" min="1"
                      className={`cp-input${errors.expiryDays ? " pf-input--err" : ""}`}
                      placeholder="e.g. 365"
                      value={genForm.expiryDays}
                      onChange={(e) => { setGenForm({ ...genForm, expiryDays: e.target.value }); setErrors({ ...errors, expiryDays: "" }); }}
                    />
                  </div>
                  {errors.expiryDays && <span className="pf-err-msg"><i className="fa-solid fa-circle-exclamation" /> {errors.expiryDays}</span>}
                </div>
              </div>

              <div className="cp-modal-footer">
                <Tooltip text="Cancel" position="top">
                  <button type="button" className="cp-cancel-btn" onClick={closeAll}>Cancel</button>
                </Tooltip>
                <Tooltip text="Generate" position="top">
                  <button type="submit" className="cp-save-btn" disabled={saving}>
                    {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-key" /> Generate</>}
                  </button>
                </Tooltip>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <div className="cp-overlay" onClick={closeAll}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3><i className="fa-solid fa-pen-to-square" style={{ marginRight: 8, color: "#4f46e5" }} />Edit — {editTarget.licenseKey}</h3>
              <button className="cp-modal-close" onClick={closeAll}><i className="fa-solid fa-xmark" /></button>
            </div>
            <form onSubmit={handleEdit} className="cp-modal-form">
              <div className="cp-field">
                <label className="cp-label">License Type</label>
                <div className="cp-input-wrap">
                  <i className="fa-solid fa-tag cp-input-icon" />
                  <select className="cp-input cp-select" value={editForm.licenseType} onChange={(e) => setEditForm({ ...editForm, licenseType: e.target.value })}>
                    {LICENSE_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="cp-field">
                <label className="cp-label">Expiry Days (from today)</label>
                <div className="cp-input-wrap">
                  <i className="fa-solid fa-calendar-days cp-input-icon" />
                  <input type="number" min="1" className="cp-input" value={editForm.expiryDays}
                    onChange={(e) => setEditForm({ ...editForm, expiryDays: e.target.value })} />
                </div>
              </div>
              <div className="cp-modal-footer">
                <button type="button" className="cp-cancel-btn" onClick={closeAll}>Cancel</button>
                <button type="submit" className="cp-save-btn" disabled={saving}>
                  {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-check" /> Update</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Renew Modal ── */}
      {renewTarget && (
        <div className="cp-overlay" onClick={closeAll}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3><i className="fa-solid fa-rotate-right" style={{ marginRight: 8, color: "#10b981" }} />Renew — {renewTarget.licenseKey}</h3>
              <button className="cp-modal-close" onClick={closeAll}><i className="fa-solid fa-xmark" /></button>
            </div>
            <form onSubmit={handleRenew} className="cp-modal-form">
              <div className="cp-field">
                <label className="cp-label">Extend by (days)</label>
                <div className="cp-input-wrap">
                  <i className="fa-solid fa-calendar-plus cp-input-icon" />
                  <input type="number" min="1" className={`cp-input${errors.expiryDays ? " pf-input--err" : ""}`}
                    value={renewForm.expiryDays}
                    onChange={(e) => { setRenewForm({ expiryDays: e.target.value }); setErrors({}); }} />
                </div>
                {errors.expiryDays && <span className="pf-err-msg"><i className="fa-solid fa-circle-exclamation" /> {errors.expiryDays}</span>}
              </div>
              <div className="cp-modal-footer">
                <button type="button" className="cp-cancel-btn" onClick={closeAll}>Cancel</button>
                <button type="submit" className="cp-save-btn" style={{ background: "linear-gradient(135deg,#059669,#10b981)" }} disabled={saving}>
                  {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Renewing…</> : <><i className="fa-solid fa-rotate-right" /> Renew</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Revoke Modal ── */}
      {revokeTarget && (
        <div className="cp-overlay" onClick={closeAll}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3><i className="fa-solid fa-ban" style={{ marginRight: 8, color: "#ef4444" }} />Revoke — {revokeTarget.licenseKey}</h3>
              <button className="cp-modal-close" onClick={closeAll}><i className="fa-solid fa-xmark" /></button>
            </div>
            <form onSubmit={handleRevoke} className="cp-modal-form">
              <div className="cp-field">
                <label className="cp-label">Reason for Revocation</label>
                <div className="cp-input-wrap">
                  <i className="fa-solid fa-message cp-input-icon" />
                  <input type="text" className={`cp-input${errors.reason ? " pf-input--err" : ""}`}
                    placeholder="e.g. Employee resigned"
                    value={revokeForm.reason}
                    onChange={(e) => { setRevokeForm({ reason: e.target.value }); setErrors({}); }} />
                </div>
                {errors.reason && <span className="pf-err-msg"><i className="fa-solid fa-circle-exclamation" /> {errors.reason}</span>}
              </div>
              <div className="cp-modal-footer">
                <button type="button" className="cp-cancel-btn" onClick={closeAll}>Cancel</button>
                <button type="submit" className="cp-delete-confirm-btn" disabled={saving}>
                  {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Revoking…</> : <><i className="fa-solid fa-ban" /> Revoke</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <div className="cp-overlay" onClick={closeAll}>
          <div className="cp-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="cp-confirm-icon"><i className="fa-solid fa-triangle-exclamation" /></div>
            <h4 className="cp-confirm-title">Delete License?</h4>
            <p className="cp-confirm-sub"><strong>{deleteTarget.licenseKey}</strong> will be permanently removed.</p>
            <div className="cp-confirm-btns">
              <button className="cp-cancel-btn" onClick={closeAll}>Cancel</button>
              <button className="cp-delete-confirm-btn" onClick={handleDelete}>
                <i className="fa-solid fa-trash" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Validate Result ── */}
      {validateRes && (
        <div className="cp-overlay" onClick={() => setValidateRes(null)}>
          <div className="cp-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="cp-confirm-icon" style={{
              background: validateRes.result.expired ? "#fef2f2" : "#ecfdf5",
              color:      validateRes.result.expired ? "#ef4444" : "#10b981",
            }}>
              <i className={`fa-solid ${validateRes.result.expired ? "fa-circle-xmark" : "fa-circle-check"}`} />
            </div>
            <h4 className="cp-confirm-title">{validateRes.lic.licenseKey}</h4>
            <p className="cp-confirm-sub">
              {validateRes.result.expired
                ? "This license has expired."
                : `Valid · ${validateRes.result.daysRemaining} day${validateRes.result.daysRemaining !== 1 ? "s" : ""} remaining`}
            </p>
            <div style={{ marginBottom: 16 }}>
              <span className="lp-status-badge" style={
                validateRes.result.expired
                  ? { color: "#ef4444", background: "#fef2f2" }
                  : { color: "#10b981", background: "#ecfdf5" }
              }>
                {validateRes.result.expired ? "Expired" : "Active"}
              </span>
            </div>
            <div className="cp-confirm-btns">
              <button className="cp-save-btn" onClick={() => setValidateRes(null)}>
                <i className="fa-solid fa-check" /> Got it
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default LicensesPage;
