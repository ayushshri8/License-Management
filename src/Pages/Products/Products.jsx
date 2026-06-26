import { useEffect, useState } from "react";
import "../../MockAPI/Products";
import { apiCall }   from "../../MockAPI/apiCall";
import { ENDPOINTS } from "../../MockAPI/endpoints";
import Tooltip       from "../../Components/Tooltip";
import { useTheme }  from "../../Components/ThemeContext";

const EMPTY_FORM = { productName: "", version: "" };

const CARD_COLORS = ["#4f46e5","#0891b2","#059669","#d97706","#e11d48","#7c3aed"];
const getColor    = (name = "") => CARD_COLORS[name.charCodeAt(0) % CARD_COLORS.length];

function ProductsPage() {
  const { addToast } = useTheme();

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await apiCall("GET", ENDPOINTS.PRODUCTS.GET_ALL);
    if (res.success) setProducts(res.data);
    else addToast("Failed to load products. Please refresh.", "error");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const displayed = products.filter((p) =>
    [p.productName, p.version, p.productId]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.productName.trim()) e.productName = "Product name is required.";
    if (!form.version.trim())     e.version     = "Version is required.";
    return e;
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setModal(true);
  };

  const closeModal = () => { setModal(false); setErrors({}); };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      addToast("Please fix the errors before saving.", "error");
      return;
    }
    setSaving(true);
    const res = await apiCall("POST", ENDPOINTS.PRODUCTS.CREATE, form);
    addToast(
      res.success                ? `🎉 "${form.productName}" has been added.`
      : res.statusCode === 409   ? `A product named "${form.productName}" already exists.`
      : res.statusCode === 400   ? "Please fill in all required fields."
      : "Could not create product. Please try again.",
      res.success ? "success" : "error"
    );
    setSaving(false);
    if (res.success) { closeModal(); load(); }
  };

  return (
    <div className="pp-page">

      {/* Header */}
      <div className="pp-header">
        <div>
          <h2 className="pp-title">Products</h2>
          <p className="pp-sub">{products.length} {products.length === 1 ? "product" : "products"} registered</p>
        </div>
        <Tooltip text="Add Product" position="bottom">
          <button className="pp-add-btn" onClick={openAdd}>
            <i className="fa-solid fa-plus" /> Add Product
          </button>
        </Tooltip>
      </div>

      {/* Search */}
      <div className="pp-toolbar">
        <div className="pp-search-wrap">
          <i className="fa-solid fa-magnifying-glass pp-search-icon" />
          <input
            className="pp-search"
            placeholder="Search by name or version…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <Tooltip text="Clear" position="bottom">
              <button className="pp-search-clear" onClick={() => setSearch("")}>
                <i className="fa-solid fa-xmark" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="pp-empty">
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: "#4f46e5" }} />
          <span>Loading products…</span>
        </div>
      ) : displayed.length === 0 ? (
        <div className="pp-empty">
          <i className="fa-solid fa-box-open" style={{ fontSize: 32, color: "#d1d5db" }} />
          <strong>No products found</strong>
          <span style={{ fontSize: 12 }}>
            {search ? `No results for "${search}"` : "No products added yet. Click Add Product to get started."}
          </span>
        </div>
      ) : (
        <div className="pp-grid">
          {displayed.map((p) => (
            <div key={p.productId} className="pp-card">
              <div className="pp-card-icon" style={{ background: getColor(p.productName) }}>
                {p.productName.charAt(0).toUpperCase()}
              </div>
              <h3 className="pp-card-name">{p.productName}</h3>
              <div className="pp-card-meta">
                <span className="pp-version-badge">
                  <i className="fa-solid fa-code-branch" /> {p.version}
                </span>
                <span className="pp-id-badge">#{p.productId}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {modal && (
        <div className="cp-overlay" onClick={closeModal}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3>Add New Product</h3>
              <button className="cp-modal-close" onClick={closeModal}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSave} className="cp-modal-form">
              <div className="cp-field">
                <label className="cp-label">Product Name</label>
                <div className="cp-input-wrap">
                  <i className="fa-solid fa-box cp-input-icon" />
                  <input
                    type="text"
                    className={`cp-input${errors.productName ? " pf-input--err" : ""}`}
                    placeholder="e.g. InsightGrid"
                    value={form.productName}
                    onChange={(e) => { setForm({ ...form, productName: e.target.value }); setErrors({ ...errors, productName: "" }); }}
                  />
                </div>
                {errors.productName && (
                  <span className="pf-err-msg"><i className="fa-solid fa-circle-exclamation" /> {errors.productName}</span>
                )}
              </div>

              <div className="cp-field">
                <label className="cp-label">Version</label>
                <div className="cp-input-wrap">
                  <i className="fa-solid fa-code-branch cp-input-icon" />
                  <input
                    type="text"
                    className={`cp-input${errors.version ? " pf-input--err" : ""}`}
                    placeholder="e.g. v1.0"
                    value={form.version}
                    onChange={(e) => { setForm({ ...form, version: e.target.value }); setErrors({ ...errors, version: "" }); }}
                  />
                </div>
                {errors.version && (
                  <span className="pf-err-msg"><i className="fa-solid fa-circle-exclamation" /> {errors.version}</span>
                )}
              </div>

              <div className="cp-modal-footer">
                <Tooltip text="Cancel" position="top">
                  <button type="button" className="cp-cancel-btn" onClick={closeModal}>Cancel</button>
                </Tooltip>
                <Tooltip text="Create" position="top">
                  <button type="submit" className="cp-save-btn" disabled={saving}>
                    {saving
                      ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
                      : <><i className="fa-solid fa-check" /> Create</>
                    }
                  </button>
                </Tooltip>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductsPage;
