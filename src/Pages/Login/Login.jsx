import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../MockAPI/auth";                        // mock handler register karo
import { apiCall }   from "../../MockAPI/apiCall";
import { ENDPOINTS } from "../../MockAPI/endpoints";

function Login() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim())                   e.email    = "Please enter your email address.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email   = "That doesn't look like a valid email.";
    if (!form.password.trim())                e.password = "Please enter your password.";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return; }

    setLoading(true);
    const res = await apiCall("POST", ENDPOINTS.AUTH.LOGIN, form);
    setLoading(false);

    if (!res.success) {
      // Map API error field to the right input
      const field = res.error?.field || "email";
      const msg   =
        res.statusCode === 404 ? "No account found with this email address. Please check and try again."
      : res.statusCode === 401 ? "That password is incorrect. Please try again."
      : "Something went wrong. Please try again.";
      setErrors({ [field]: msg });
      console.error("Login failed:", res.error);
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", JSON.stringify(res.data));
    console.log("Login successful:", res.data);
    navigate("/dashboard");
  };

  return (
    <div className="login-bg">
      <div className="login-blob login-blob--1" />
      <div className="login-blob login-blob--2" />

      <div className="login-card">

        <div className="login-header">
          <div className="login-logo">
            <i className="fa-solid fa-shield-halved" />
          </div>
          <h2 className="login-title">Welcome back</h2>
          <p className="login-sub">Sign in to License Management System</p>
        </div>

        {/* Demo hint */}
        <div className="login-hint">
          <i className="fa-solid fa-circle-info" />
          <span>Demo: <strong>admin@company.com</strong> / <strong>admin1</strong></span>
        </div>

        <form onSubmit={handleLogin} className="login-form" noValidate>

          <div className="login-field">
            <label className="login-label">Email address</label>
            <div className={`login-input-wrap${errors.email ? " login-input-wrap--err" : ""}`}>
              <i className="fa-regular fa-envelope login-input-icon" />
              <input
                type="email"
                name="email"
                className="login-input"
                placeholder="admin@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="login-field-err">
                <i className="fa-solid fa-circle-exclamation" /> {errors.email}
              </p>
            )}
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <div className={`login-input-wrap${errors.password ? " login-input-wrap--err" : ""}`}>
              <i className="fa-solid fa-lock login-input-icon" />
              <input
                type={showPw ? "text" : "password"}
                name="password"
                className="login-input login-input--pw"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button type="button" className="login-eye" onClick={() => setShowPw(!showPw)}>
                <i className={`fa-regular ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
            {errors.password && (
              <p className="login-field-err">
                <i className="fa-solid fa-circle-exclamation" /> {errors.password}
              </p>
            )}
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" /> Checking credentials…</>
              : <><i className="fa-solid fa-arrow-right-to-bracket" /> Sign In</>
            }
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;
